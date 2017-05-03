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
function parseSectionAsArray(title, body, level) {
  const vars = new Set()

  // parse all lines
  body = body.map(line => {
    if ( typeof line === 'object' ) {
      return parseSection(line, level + 1)
    }

    const { vars: lineVars, html, template } = parseHandlebars(line)
    //lineVars.forEach(varName => vars.add(varName))
    vars.concat(lineVars)
    return { html, template }
  })

  return {
    title,
    vars,
    html: flatten(title, body.map(b => b.html), level + 1),
    template: flatten(title, body.map(b => b.template), level + 1)
  }
}

/**
 * Parses a body that is in object format.
 */
function parseSectionAsObject(title, body, level) {
  // construct sections
  const sections = Object.keys(body).map(subtitle =>
    parseSection({
      title: subtitle,
      body: body[subtitle]
    }, level + 1)
  )

  return {
    title,
    vars: flatArray(sections.map(sec => sec.vars)).reduce((a, b) => a.concat(b), new Set()),
    html: flatten(title, sections.map(sec => sec.html), level + 1),
    template: flatten(title, sections.map(sec => sec.template), level + 1)
  }
}

/**
 * Parses a valid document object.
 */
const parseSection = module.exports = ({ title, body }, level) => {
  if ( typeof title !== 'string' || nil.indexOf(body) !== -1 ) {
    throw new Error('Section has invalid property "title".')
  }

  if ( typeof body !== 'object' || nil.indexOf(body) !== -1 ) {
    throw new Error('Section has invalid property "body".')
  }

  if (typeof level !== 'number') level = 0
  if (level > 5) level = 5

  if ( body instanceof Array ) return parseSectionAsArray(title, body, level)
  return parseSectionAsObject(title, body, level)
}