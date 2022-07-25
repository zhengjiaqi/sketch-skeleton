const { readFileSync } = require('fs')
const { resolve } = require('path')
const fs = require('fs-extra')

let INDEX_HTML
class Skeleton {
  constructor(project) {
    this.project = project
    this.init()
  }
  init() {
    this.artboardIndex = 0
    this.current = this.project.artboards[this.artboardIndex];
  }
  getRectString(rect, option) {
    const useAdaptive = option.useAdaptive === undefined ? true : option.useAdaptive;
    let width = '';
    let height = '';
    let left = '';
    let top = '';

    if (useAdaptive) {
      width = this.fixNumber(rect.width / this.current.width) + 'vw';
      height = (rect.width === 0 ? this.fixNumber(rect.height / this.current.width) : this.fixNumber((rect.height / rect.width) * (rect.width / this.current.width))) + 'vw';
      left = this.fixNumber(rect.x / this.current.width) + 'vw';
      top = (rect.x === 0 ? this.fixNumber(rect.y / this.current.width) : this.fixNumber((rect.y / rect.x) * (rect.x / this.current.width))) + 'vw';
    } else {
      width = rect.width + 'px';
      height = rect.height + 'px';
      left = rect.x + 'px';
      top = rect.y + 'px';
    }

    return 'width: ' + width + '; height: ' + height + '; left: ' + left + '; top: ' + top + ';';
  }
  getCssString(css, option) {
    const useAdaptive = option.useAdaptive === undefined ? true : option.useAdaptive;
    let resCss = css
    if (useAdaptive) { 
      resCss = resCss.map(cssItem => {
        cssItem = cssItem.replace(/(border-radius: )(\d+)(px)/g, (match, p1, p2, p3) => {
          const radius = this.fixNumber(parseInt(p2) / this.current.width) + 'vw'
          return p1 + radius
        })
        return cssItem
      })
    }
    return resCss.join(' ')
  }
  isInt(n) {
      return n % 1 === 0;
  }
  fixNumber(x) {
      if(x === NaN) {
          return 0;
      }
      x = x * 100
      if(this.isInt(x)) {
          return x
      } else {
          return Number.parseFloat(x).toFixed(6);
      }
  }
  layers(option) {
    const layersHTML = [];
    this.current.layers.forEach((layer, index) => {
      const classNames = ['skeleton-layer', `skeleton-layer-${layer.objectID}`];
      const cssString = this.getCssString(layer.css, option)
      const rectString = this.getRectString(layer.rect, option)
      layersHTML.push([
        '<div id="skeleton-layer-' + index + '" class="' + classNames.join(' ') 
        + '" data-index="' + index 
        + '" style="'+ cssString + rectString +'">',
        '</div>'
      ].join(''));
    })
    return layersHTML.join('');
  }
  generate(option) {
    const useLoading = option.useLoading === undefined ? true : option.useLoading;

    const style = `
    <style>
      body {
        margin: 0;
      }
      #skeleton-container {
        width: 100vw;
        height: 100vh;
        overflow: hidden;
        position: absolute;
        z-index: 99;
      }
      .skeleton-layer {
        position: absolute;
      }
      .skeleton-layer-animation {
        height: 100vh;
        width: 100vw;
        position: absolute;
        background: -webkit-linear-gradient(
          -25deg,
          rgba(255, 255, 255, 0) 47%,
          rgba(255, 255, 255, 0.2) 49%,
          rgba(255, 255, 255, 0.7) 50%,
          rgba(255, 255, 255, 0.2) 51%,
          rgba(255, 255, 255, 0) 53%
        ) rgba(255, 255, 255, 0);
        background: linear-gradient(
          115deg,
          rgba(255, 255, 255, 0) 47%,
          rgba(255, 255, 255, 0.2) 49%,
          rgba(255, 255, 255, 0.7) 50%,
          rgba(255, 255, 255, 0.2) 51%,
          rgba(255, 255, 255, 0) 53%
        ) rgba(255, 255, 255, 0);
        -webkit-animation: loading 3s ease-in-out infinite;
        animation: loading 3s ease-in-out infinite;
        background-position-x: 120%;
        background-size: 300% 100%;
      }
      @keyframes loading{
        0%{
          background-position-x: 0%;
        }
        100% {
          background-position-x: -150%;
        }
      }
      @-webkit-keyframes loading{
        0%{
          background-position-x: 0%;
        }
        100% {
          background-position-x: -150%;
        }
      }
    </style>
    `
    const loading = '<div class="skeleton-layer-animation"></div>'
    const generatedHTML = [
      style,
      '<div id="skeleton-container">',
      this.layers(option)
    ]

    if (useLoading) {
      generatedHTML.push(loading)
    }
    generatedHTML.push('</div>')
    return generatedHTML.join('');
  }
}

async function createSkeleton(data, option) {
  option = Object.assign({
    useLoading: true,
    generateHtml: true,
    generateTemplate: true,
  }, option)
  if (!INDEX_HTML) {
    INDEX_HTML = readFileSync(resolve(__dirname, '../assets/index.html'), {
      encoding: 'utf8'
    }).toString()
  }
  const skeleton = (new Skeleton(data)).generate(option)
  return skeleton
}

async function generateSkeleton(data, dest, option) {
  option = Object.assign({
    useLoading: true,
    generateHtml: true,
    generateTemplate: true,
  }, option)
  if (!INDEX_HTML) {
    INDEX_HTML = readFileSync(resolve(__dirname, '../assets/index.html'), {
      encoding: 'utf8'
    }).toString()
  }
  const skeleton = await createSkeleton(data, option)
  const html = INDEX_HTML.replace(/<!--app-skeleton-->/, skeleton)
  if (option.generateHtml) {
    const htmlFileDest = resolve(dest, 'index.html')
    await fs.ensureFile(htmlFileDest)
    await fs.writeFile(htmlFileDest, html)
  }

  if(option.generateTemplate) {
    const templateFileDest = resolve(dest, 'index.skeleton.html')
    await fs.ensureFile(templateFileDest)
    await fs.writeFile(templateFileDest, skeleton)
  }
}


module.exports = {
  generateSkeleton,
  createSkeleton
}
