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

module.exports = line => {
  const vars = []
      , document = copy(mustache.parse(line))
      , html = document.reduce((str, _doc) => {
          const doc = copy(_doc)
        
          if (doc[0] === 'name') {
            doc[1] = varify(doc[1])
            vars.push(doc[1])
          }
        
          return str + (doc[0] === 'name' ? `<input type="text" ng-model="${doc[1]}"> (${_doc[1]})` : doc[1])
        }, '')
      , template = document.reduce((str, doc) => {
          return str + (doc[0] === 'name' ? `<span class="input">{{{ ${ varify(doc[1]) } }}}</span> (${doc[1]})` : doc[1])
        }, '')
  
  return { vars, html, template }
}