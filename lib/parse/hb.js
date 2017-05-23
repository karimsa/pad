/**
 * parse-hb.js - pad
 * 
 * Licensed under MIT license.
 * Copyright (C) 2017 Karim Alibhai.
 */

const mustache = require('mustache')

/**
 * Convert handlebar name into valid name.
 */
function varify(name) {
  name = name.substr(1 + name.indexOf('"'))
  name = name.substr(0, name.indexOf('"'))
  return name.toLowerCase().replace(/\s+/g, '_')
}

/**
 * Creates a copy of an object.
 */
function copy(obj) {
  return JSON.parse(JSON.stringify(obj))
}

/**
 * Joines indices to make section/line number.
 */
function join(indices) {
  return indices.length > 0 ? indices.join('.') + '. ' : ''
}

/**
 * Make text usable as a title.
 */
function title(text) {
  if (text[0] === '_') {
    text = text.substr(text.indexOf('"') + 1)
    text = text.substr(0, text.indexOf('"'))
    return text
  }

  return text.replace(/"/g, '&quot;')
}

module.exports = (line, indices) => {
  const vars = []
      , document = copy(mustache.parse(line))
      , html = join(indices) + document.reduce((str, _doc) => {
          const doc = copy(_doc)
          let hiddenName = false
        
          if (doc[0] === 'name') {
            hiddenName = doc[1][0] === '_'
            doc[1] = varify(doc[1])

            if (!hiddenName) {
              vars.push(doc[1])
            }
          }

          return str + (doc[0] === 'name' ? `<input type="text" ng-model="${doc[1]}" title="${title(_doc[1])}">` + (hiddenName ? '' : ` (${_doc[1]})`) : doc[1])
        }, '')
      , template = join(indices) + document.reduce((str, doc) => {
          return str + (doc[0] === 'name' ? `<span class="input">{{{ ${ varify(doc[1]) } }}}</span>` + (doc[1][0] === '_' ? '' : ` (${doc[1]})`) : doc[1])
        }, '')
  
  return { vars, html, template }
}