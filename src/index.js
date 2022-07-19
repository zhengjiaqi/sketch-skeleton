const { join } = require('path')
const Transformer = require('./transform')
const parseSketchFile = require('./parseSketchFile')
const { generateSkeleton, createSkeleton } = require('./generateMeasurePage')

function build(sketchFile, dest, options) {
  const NAME_MAP = {}
  let transformer
  return parseSketchFile(sketchFile)
    // convert data
    .then(data => {
      transformer = new Transformer(data.meta, data.pages, {
        savePath: dest,
        // Don't export symbol artboard.
        // Because sketchtool doesn't offer cli to export symbols, we can't
        // export single symbol image.
        ignoreSymbolPage: true,
        // From version 47, sketch support library
        foreignSymbols: data.document.foreignSymbols,
        layerTextStyles: data.document.layerTextStyles
      })
      const processedData = transformer.convert()
      processedData.artboards.forEach(artboard => {
        NAME_MAP[artboard.objectID] = artboard.slug
      })
      return generateSkeleton(processedData, dest, options)
    })
}

async function getSketchString(sketchFile, options) {
  const dest = ''
  const NAME_MAP = {}
  let transformer
  const data = await parseSketchFile(sketchFile)

  transformer = new Transformer(data.meta, data.pages, {
    savePath: dest,
    // Don't export symbol artboard.
    // Because sketchtool doesn't offer cli to export symbols, we can't
    // export single symbol image.
    ignoreSymbolPage: true,
    // From version 47, sketch support library
    foreignSymbols: data.document.foreignSymbols,
    layerTextStyles: data.document.layerTextStyles
  })
  const processedData = transformer.convert()
  processedData.artboards.forEach(artboard => {
    NAME_MAP[artboard.objectID] = artboard.slug
  })  
  const skeleton = await createSkeleton(processedData, options)
  return skeleton
}

module.exports = {
  build,
  getSketchString
}
