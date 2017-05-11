/**
 * lib/parse-section.js - pad
 * 
 * Licensed under MIT license.
 * Copyright (C) 2017 Karim Alibhai.
 */

const parseHandlebars = require('./hb')
    , flatten = require('../flatten')
    , flatArray = require('flatten')

/**
 * Modified version of concat.
 */
Set.prototype.concat = function ( target ) {
  target.forEach(val => this.add(val))
  return this
}

/**
 * List of nulls.
 */
const nil = [ undefined, null ]

/**
 * Parses a body that is in array format.
 */
function parseSectionAsArray(title, body, level, indices) {
  const vars = new Set()

  // parse all lines
  body = body.map((line, index) => {
    if ( typeof line === 'object' ) {
      return parseSection(line, level + 1, indices.concat([ index + 1 ]))
    }

    const { vars: lineVars, html, template } = parseHandlebars(line, indices.concat([ index + 1 ]))
    //lineVars.forEach(varName => vars.add(varName))
    vars.concat(lineVars)
    return { html, template }
  })

  return {
    title,
    vars,
    html: flatten(title, body.map(b => b.html), level + 1, indices),
    template: flatten(title, body.map(b => b.template), level + 1, indices)
  }
}

/**
 * Parses a body that is in object format.
 */
function parseSectionAsObject(title, body, level, indices) {
  if (body instanceof Array) return parseSectionAsArray(title, body, level, indices)

  // construct sections
  const sections = Object.keys(body).map((subtitle, index) =>
    parseSection({
      title: subtitle,
      body: body[subtitle]
    }, level + 1, indices.concat([ index + 1 ]))
  )

  return {
    title,
    vars: flatArray(sections.map(sec => sec.vars)).reduce((a, b) => a.concat(b), new Set()),
    html: flatten(title, sections.map(sec => sec.html), level + 1, indices),
    template: flatten(title, sections.map(sec => sec.template), level + 1, indices)
  }
}

/**
 * Parses a valid document object.
 */
const parseSection = module.exports = (section, level, indices) => {
  if (typeof level !== 'number') level = 0
  if (level > 5) level = 5
  indices = indices || []

  console.log('parseSection(')
  process.stdout.write('  '); console.log(section); process.stdout.write(',')
  console.log('  %s', level)
  console.log(')')

  if ( section instanceof Array ) return parseSectionAsArray(null, section, level, indices)
  return parseSectionAsObject(section.title, section.body, level, indices)
}