// import ndarray from "ndarray"
import { imagePaths, imageCache } from "./bitmap"
import { quadTreeFlat } from "../utils/quadtree"
import { renderGlitch } from "./renderGlitch"

import { obj, mediaSize, types, anime } from "../const/variables"
import {
  userVideo,
  defaultVideo,
  imageEl,
  canvas,
  ctx,
  dpr,
  canvasRaw,
} from "../const/dom"

import {
  getAverageColor,
  getHueFromHex,
  hexToRgb,
  interpolateHex,
  tweakHexColor,
} from "../utils/color"

import { record, renderCanvasToVideoFrameAndEncode } from "./record"
import { getFullPixelSize } from "./resize"

import { animePlay } from "./anime"

var pixelSize
var pixelW
var pixelH
var numCols
var numRows
var offsetW = 0
var offsetH = 0

// var fontFamily = "Courier New"
var fontFamily = "brat"
var fontSize

var grayscaleDataArray = []

const render = (context) => {
  animePlay()
  if (mediaSize.width && mediaSize.height) {
    canvasRaw.width = mediaSize.width
    canvasRaw.height = mediaSize.height

    let source

    switch (types.video) {
      case "Select Video":
        source = userVideo
        break
      case "Default":
        source = defaultVideo
        break
      case "image":
        source = imageEl
        break
      default:
        source = defaultVideo
        break
    }

    context.drawImage(
      source,
      0,
      0,
      mediaSize.width / dpr,
      mediaSize.height / dpr,
    )

    var pixelData = context.getImageData(
      0,
      0,
      mediaSize.width,
      mediaSize.height,
    )
    var pixels = pixelData.data

    grayscaleDataArray = []

    for (var cellY = 0; cellY < numRows; cellY++) {
      grayscaleDataArray[cellY] = []

      for (var cellX = 0; cellX < numCols; cellX++) {
        var cellPixels = []

        for (var pixelY = 0; pixelY < pixelH; pixelY++) {
          for (var pixelX = 0; pixelX < pixelW; pixelX++) {
            var currentXPosition = cellX * pixelW + pixelX
            var currentYPosition = cellY * pixelH + pixelY

            var currentPixelDataValue =
              (currentYPosition * mediaSize.width + currentXPosition) * 4

            if (
              currentXPosition < mediaSize.width &&
              currentYPosition < mediaSize.height
            ) {
              cellPixels.push(pixels[currentPixelDataValue])
              cellPixels.push(pixels[currentPixelDataValue + 1])
              cellPixels.push(pixels[currentPixelDataValue + 2])
              cellPixels.push(pixels[currentPixelDataValue + 3])
            }
          }
        }

        var avgColor = getAverageColor(cellPixels)
        var grayScaleValue =
          0.299 * avgColor[0] + 0.587 * avgColor[1] + 0.114 * avgColor[2] //perceived luminosity value
        grayscaleDataArray[cellY][cellX] = [grayScaleValue, avgColor]
      }
    }

    if (obj.bratType === "fill") {
      renderBrat()
    } else if (obj.bratType === "glitch") {
      // re-draw
      context.drawImage(source, 0, 0, mediaSize.width, mediaSize.height)
      renderGlitch(
        grayscaleDataArray,
        pixelSize,
        pixelW,
        pixelH,
        numCols,
        numRows,
      )
    }
  } else {
    context.fillStyle = "#fff"
    context.fillRect(0, 0, mediaSize.width, mediaSize.height)
  }
}

//draw the text and background color for each frame onto the final canvas

const renderBrat = () => {
  if (obj.ifBackground) {
    ctx.fillStyle = obj.backgroundColor
    // ctx.fillRect(0, 0, mediaSize.width, mediaSize.height)
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  }

  if (obj.pixelSizeFactor === 201) {
    // 这里有问题
    ctx.drawImage(
      defaultVideo,
      offsetW,
      offsetH,
      mediaSize.width,
      mediaSize.height,
    )

    return
  }

  const fontResizeFactor = 0
  const fontResize = fontSize * (1 + fontResizeFactor)

  const charsA = [
    { c: "1", o: false },
    { c: "2", o: true },
    { c: "2", o: false },
    { c: "3", o: false },
    { c: "3", o: false },
    { c: "2", o: false },
    { c: "3", o: false },
  ]
  const charsB = [
    { c: "4", o: false },
    { c: "3", o: false },
    { c: "2", o: false },
    { c: "3", o: false },
    { c: "5", o: false },
    { c: "2", o: false },
    { c: "2", o: true },
  ]

  const charsLength = charsA.length
  let charIndex = 0
  function nextChar() {
    if (charIndex + 1 === charsLength) {
      charIndex = 0
    } else {
      charIndex++
    }
  }

  let charOffset = 0
  let charSet = charsA

  for (var row = 0; row < numRows; row++) {
    const rowOdd = Math.floor((row - 2) / 2) % 2 === 0 // 奇数

    for (var col = 0; col < numCols; col++) {
      if (col === 0) {
        charIndex = rowOdd ? 0 : obj.offsetLength
        charOffset = 0

        charSet = row % 2 === 0 ? charsA : charsB
      }
      const char = charSet[charIndex]

      const color = grayscaleDataArray[row][col][1]
      ctx.fillStyle = `rgba(${color[0].toFixed(0)}, ${color[1].toFixed(
        0,
      )}, ${color[2].toFixed(0)}, ${char.o ? obj.opacity / 100 : 1})`
      ctx.font = fontResize + "px " + fontFamily
      // ctx.fillText(
      //   char.c,
      //   col * pixelW + char.offset * fontResize - charOffset * fontResize,
      //   row * pixelH * 1.8 + pixelH,
      // )

      const textYOffset =
        obj.pixelSizeFactor < 20 ? -3.5 : obj.pixelSizeFactor < 51 ? -1 : 0

      ctx.fillText(
        char.c,
        offsetW + col * pixelW,
        offsetH + (row + 1) * pixelH + textYOffset,
      )
      nextChar()
      // charOffset += 0.2
    }
  }
}

const refresh = (pixelSizeFactor) => {
  let targetWidth, targetHeight
  ;({ pixelSize, pixelW, pixelH, numCols, numRows, targetWidth, targetHeight } =
    getFullPixelSize(mediaSize, pixelSizeFactor || obj.pixelSizeFactor))

  if (obj.bratSize === "video") {
    offsetW = 0
    offsetH = 0

    canvas.width = mediaSize.width * dpr
    canvas.height = mediaSize.height * dpr

    canvas.style.width = mediaSize.width + "px"
    canvas.style.height = mediaSize.height + "px"
  } else {
    offsetW = (mediaSize.maxWidth - targetWidth) / 2
    offsetH = (mediaSize.maxHeight - targetHeight) / 2

    canvas.width = mediaSize.maxWidth * dpr
    canvas.height = mediaSize.maxHeight * dpr

    canvas.style.width = mediaSize.maxWidth + "px"
    canvas.style.height = mediaSize.maxHeight + "px"
  }

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

  fontSize = pixelSize
  ctx.font = fontSize + "px " + fontFamily

  if (types.video === "image") {
    anime.animationRequest = requestAnimationFrame(loop)
  }
  // localStorage.setItem("brat", JSON.stringify(obj))
}

//animation loop to go frame by frame
function loop() {
  if (anime.playAnimationToggle) {
    render(ctx)

    if (types.video !== "image") {
      if (record.state == true) {
        renderCanvasToVideoFrameAndEncode({
          canvas,
          videoEncoder: record.videoEncoder,
          frameNumber: record.frameNumber,
          videofps: record.videofps,
        })
        record.frameNumber++
      }

      anime.animationRequest = requestAnimationFrame(loop)
    }
  }
}

export { render, renderBrat, refresh, loop }
