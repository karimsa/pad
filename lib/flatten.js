/**
 * lib/flatten.js - pad
 * 
 * Licensed under MIT license.
 * Copyright (C) 2017 Karim Alibhai.
 */

const marked = require('marked')
    , renderer = new marked.Renderer()

/**
 * Joines indices to make section/line number.
 */
function join(indices) {
  indices = indices || []
  return indices.length > 0 ? indices.join('.') + '. ' : ''
}

renderer.paragraph = text => text

const htmlFromArray = (body, level) =>
  `
    <ul class="row">
      ${body.map(b => html(b, level + 1)).join('\n')}
    </ul>
  `

const htmlFromObject = (body, level) =>
  Object.keys(body)
        .map(b => html(b.title, b.body, level + 1))
        .join('')

function html(body, level) {
  if (body instanceof Array) return htmlFromArray(body, level)

  if (typeof body === 'string') {
    if (body.trim().startsWith('<') && body.trim().endsWith('>')) {
      return body
    }

    return `<li>${marked(body, { renderer })}</li>`
  }

  return htmlFromObject(body, level)
}

module.exports = (title, body, level, indices) => {
  if ( typeof level !== 'number' ) level = 1
  if ( level > 6 ) level = 6

  return (title ? `<h${level}>${join(indices) + title}</h${level}>` : '') + html(body)
}