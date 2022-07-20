#!/usr/bin/env node

const { resolve, basename, extname } = require('path')
const program = require('commander')
const pkg = require('../package.json')
const { build } = require('../src')
let debug = () => {}

program
  .version(pkg.version)

program
  .command('build <sketchFile>')
  .alias('c')
  .description('convert sketch file to static html pages')
  .option('-d, --dest <dir>', 'Dest directory which html skeleton pages generate to.')
  .option('-v, --verbose', 'print details when execute commands.')
  .option('-l, --useLoading <useLoading>', 'add loading in generated skeleton.', 'true')
  .option('-a, --useAdaptive <useAdaptive>', 'generated skeleton page can be adaptive.', 'true')
  .option('-m, --generateHtml <generateHtml>', 'generate html skeleton pages.', 'true')
  .option('-t, --generateTemplate <generateTemplate>', 'generate template skeleton pages.', 'true')
  .action((sketchFile, options) => {
    options.useLoading = convertBoolean(options.useLoading)
    options.generateHtml = convertBoolean(options.generateHtml)
    options.generateTemplate = convertBoolean(options.generateTemplate)
    options.useAdaptive = convertBoolean(options.useAdaptive)

    const src = resolve(sketchFile)
    const dest = resolve(
      options.dest || basename(sketchFile, extname(sketchFile))
    )
    // load debug module after set process.env.DEBUG
    if (options.verbose) {
      process.env.DEBUG = 'sketch-skeleton'
      debug = require('debug')('sketch-skeleton')
    }
    debug('src: %s', dest)
    debug('dest: %s', dest)
    build(src, dest, options)
      .then(() => {
        console.log('')
        console.log('  Success!')
        console.log(`  Open file:///${dest.slice(1)}/index.html in browser.`)
        console.log('  And you can start a static server for better experience.')
        console.log('')
      })
      .catch(console.error.bind(console))
  })

program.parse(process.argv)

function convertBoolean(value) {
  return value === 'true'
}