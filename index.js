#!/usr/bin/env node

/**
 * index.js - pad
 * 
 * Licensed under MIT license.
 * Copyright (C) 2017 Karim Alibhai.
 */

const fs = require('fs')
    , path = require('path')
    , kopy = require('kopy')
    , mustache = require('mustache')
    , nightmare = require('nightmare')
    , parseSection = require('./lib/parse/section')
    , args = require('minimist')( process.argv.slice(2) )

/**
 * Print help & exit.
 */
function help() {
  console.log('usage: pad <json_file> <output_filename>')
  process.exit(-1)
}

/**
 * Just die.
 */
function die() {
  console.error.apply(console, arguments)
  process.exit(-1)
}

// verify arguments
if ( args._.length !== 2 ) {
  help()
}

// get full path
const input = args._[0][0] === '/' ? args._[0] : path.resolve(process.cwd(), args._[0])
    , output = args._[1][0] === '/' ? args._[1] : path.resolve(process.cwd(), args._[1])

// verify input exists
if (!fs.existsSync(input)) die('Error: %s: no such file or directory.', args._[0])

// verify output doesn't exist
if (fs.existsSync(output)) die('Error: %s: already exists.', args._[1])

// create temporary folder for working
const tmp = require('tmp').dirSync().name

// try parse
let document

try {
  document = JSON.parse(fs.readFileSync(input, 'utf8'))
} catch (err) {
  die('The input file is not in valid JSON format.\n\n' + String(err.stack || err))
}

// get parse tree
const data = parseSection(document)

// grab template
const templateDir = path.resolve(__dirname, 'templates', 'default')

// merge
kopy(templateDir, tmp, {
  template: require('jstransformer-handlebars'),
  data: {
    title: data.title,
    body: data.html,
    vars: [... data.vars].map(v => `$scope.${v} = ''`).join('\n'),
    varList: JSON.stringify([... data.vars])
  }
})
  .then(async () => {
    // copy over controller
    fs.writeFileSync(tmp + '/controller.html', fs.readFileSync(path.resolve(__dirname, 'templates', 'controller.html'), 'utf8'))

    // open up browser and wait for input
    const scope = await nightmare({
      show: true,
      openDevTools: process.env.DEBUG === 'nightmare',
      waitTimeout: 2147483647
    })
      .goto('file://' + tmp + '/controller.html')
      .wait('done')
      .evaluate(() => getScope())
      .end()

    // ...
    console.log(scope)
    
    // create file
    fs.writeFileSync(tmp + '/pdf.html', mustache.render(fs.readFileSync(path.resolve(templateDir, 'index.html'), 'utf8'), {
      title: '',
      body: mustache.render(data.template, scope)
    }))

    // pdf it
    await nightmare()
      .goto('file://' + tmp + '/pdf.html')
      .pdf(output)
      .end()
  })
  .catch(die)