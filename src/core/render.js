// import ndarray from "ndarray"
import { imagePaths, imageCache } from "./bitmap"
import { quadTreeFlat } from "../utils/quadtree"
import { renderGlitch, renderTest } from "./renderGlitch"

import { obj, mediaSize, types, anime } from "../const/variables"
import {
  webcamVideo,
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

var pixelSize
var pixelRaito = 1
var pixelW
var pixelH
var numCols
var numRows
var offsetW = 0
var offsetH = 0
var alpha = 1

// var fontFamily = "Courier New"
var fontFamily = "brat"
var fontSize
//this defines the character set. ordered by darker to lighter colour
const gradient = "____``..--^^~~<>??123456789%%&&@@"
const preparedGradient = gradient.replaceAll("_", "\u00A0")

var randomColumnArray = []
var startingRowArray = []

var counter = 0
var webcamStream

//turn video input into still images, and then into pixelated grayscale values

var grayscaleDataArray = []

var backgroundRGB = hexToRgb(obj.backgroundColor)
var backgroundHue = getHueFromHex(obj.backgroundColor)

var fontHue = getHueFromHex(obj.fontColor)

var threshold = obj.threshold / 100
var randomness = obj.randomness / 100

const getCharByScale = (scale) => {
  const val = Math.floor((scale / 255) * (gradient.length - 1))
  return preparedGradient[val]
}

// bitmap
const getBitmapByScale = (scale) => {
  const val = Math.floor((scale / 255) * (imageCache.length - 1))
  return imageCache[val]
}

const render = (context) => {
  if (mediaSize.width && mediaSize.height) {
    canvasRaw.width = mediaSize.width
    canvasRaw.height = mediaSize.height

    let source

    switch (types.video) {
      case "Webcam":
        source = webcamVideo
        break
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
    } else if (obj.bratType === "test") {
      // re-draw
      context.drawImage(source, 0, 0, mediaSize.width, mediaSize.height)
      renderTest(
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
const renderText = () => {
  if (obj.ifBackground) {
    ctx.fillStyle = obj.backgroundColor
    ctx.fillRect(0, 0, mediaSize.width, mediaSize.height)
  }

  for (var col = 0; col < numCols; col++) {
    for (var row = 0; row < numRows; row++) {
      var adjustedThreshold =
        threshold + 0.2 * Math.sin(counter / 30) * randomness
      var currentGrayValue = grayscaleDataArray[row][col][0]

      var char
      var currentFontSize = Math.min(
        fontSize * 3,
        (fontSize * obj.fontSizeFactor) / 3,
      )

      //draw background color of pixels
      if (counter % 8 == 0 && Math.random() < randomness * 0.002) {
        ctx.fillStyle = tweakHexColor(obj.backgroundColor, 100 * randomness)
        ctx.fillRect(col * pixelW, row * pixelH, pixelW, pixelH)
      } else if (obj.backgroundGradient) {
        var currentBackgroundColor =
          "hsl(" +
          backgroundHue +
          "," +
          obj.backgroundSaturation +
          "%," +
          Math.pow(currentGrayValue / 255, 2) * 100 +
          "%)"
        var currentBackgroundColorInvert =
          "hsl(" +
          backgroundHue +
          "," +
          obj.backgroundSaturation +
          "%," +
          (1 - Math.pow(currentGrayValue / 255, 2)) * 100 +
          "%)"

        if (obj.invertToggle == false) {
          if (currentGrayValue / 255 > adjustedThreshold) {
            ctx.fillStyle = currentBackgroundColor
          } else {
            ctx.fillStyle =
              "hsl(" +
              backgroundHue +
              "," +
              obj.backgroundSaturation +
              "%," +
              (adjustedThreshold / 4) * 100 +
              "%)"
          }
        } else {
          if (currentGrayValue / 255 < 1 - adjustedThreshold) {
            ctx.fillStyle = currentBackgroundColorInvert
          } else {
            ctx.fillStyle =
              "hsl(" +
              backgroundHue +
              "," +
              obj.backgroundSaturation +
              "%," +
              (adjustedThreshold / 4) * 100 +
              "%)"
          }
        }

        ctx.fillRect(col * pixelW, row * pixelH, pixelW, pixelH)
      } else {
      }

      //choose text character to draw
      if (randomColumnArray[col]) {
        if (
          (((counter + startingRowArray[col]) % 100) / 100) * numRows +
            startingRowArray[col] >
          row
        ) {
          char = getCharByScale(currentGrayValue)
        } else {
          char = ""
        }
      } else if (Math.random() < 0.005 * randomness) {
        char =
          preparedGradient[Math.floor(Math.random() * preparedGradient.length)] //draw random char
      } else if (obj.animationType == "Random Text") {
        char = getCharByScale(currentGrayValue)
      } else if (obj.animationType == "User Text") {
        char = obj.textInput[(row * numCols + col) % obj.textInput.length]
        if (obj.invertToggle) {
          currentFontSize = Math.min(
            fontSize * 3,
            Math.floor(
              (((1 - Math.pow(currentGrayValue / 255, 1)) *
                obj.fontSizeFactor) /
                3) *
                fontSize,
            ),
          )
        } else {
          currentFontSize = Math.min(
            fontSize * 3,
            Math.floor(
              ((Math.pow(currentGrayValue / 255, 1) * obj.fontSizeFactor) / 3) *
                fontSize,
            ),
          )
        }
      }

      //draw text onto canvas
      ctx.font = currentFontSize + "px " + fontFamily

      if (obj.invertToggle == false) {
        if (currentGrayValue / 255 > adjustedThreshold) {
          ctx.fillStyle = interpolateHex(
            obj.fontColor,
            obj.fontColor2,
            (currentGrayValue / 255 - adjustedThreshold) /
              (1 - adjustedThreshold),
          )
          ctx.fillText(char, col * pixelW, row * pixelH + pixelH)
        }
      } else {
        if (currentGrayValue / 255 < 1 - adjustedThreshold) {
          ctx.fillStyle = interpolateHex(
            obj.fontColor2,
            obj.fontColor,
            currentGrayValue / 255 / (1 - adjustedThreshold),
          )
          ctx.fillText(char, col * pixelW, row * pixelH + pixelH)
        }
      }
    }
  }
}

const renderSVG = () => {
  if (obj.ifBackground) {
    ctx.fillStyle = obj.backgroundColor
    ctx.fillRect(0, 0, mediaSize.width, mediaSize.height)
  }

  for (var col = 0; col < numCols; col++) {
    for (var row = 0; row < numRows; row++) {
      var adjustedThreshold =
        threshold + 0.2 * Math.sin(counter / 30) * randomness
      var currentGrayValue = grayscaleDataArray[row][col][0]
      var bitmap = getBitmapByScale(currentGrayValue)

      ctx.drawImage(
        bitmap.offscreenCanvas,
        col * pixelW,
        row * pixelH,
        pixelW,
        pixelH,
      )
    }
  }
}

const renderTree = () => {
  if (obj.ifBackground) {
    ctx.fillStyle = obj.backgroundColor
    ctx.fillRect(0, 0, mediaSize.width, mediaSize.height)
  }

  const arr = quadTreeFlat(grayscaleDataArray)

  for (let i = 0; i < arr.length; i++) {
    const blk = arr[i]
    var bitmap = getBitmapByScale(blk.value)

    if (bitmap) {
      ctx.drawImage(
        bitmap.offscreenCanvas,
        blk.x * pixelW,
        blk.y * pixelH,
        blk.w * pixelW,
        blk.h * pixelH,
      )
    }
  }
}

const renderBrat = () => {
  if (obj.ifBackground) {
    ctx.fillStyle = obj.backgroundColor
    // ctx.fillRect(0, 0, mediaSize.width, mediaSize.height)
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  }

  if (obj.pixelSizeFactor === 201) {
    ctx.drawImage(
      userVideo,
      offsetW,
      offsetH,
      mediaSize.width,
      mediaSize.height,
    )

    console.log("?")

    return
  }

  const fontResizeFactor = 0
  const fontResize = fontSize * (1 + fontResizeFactor)

  // const chars = [
  //   { c: "B", offset: 0, offsetA: 0 },
  //   { c: "R", offset: 0, offsetA: fontResizeFactor },
  //   { c: "A", offset: -0.5, offsetA: fontResizeFactor * 2 - 1.5 },
  //   { c: "T", offset: -1, offsetA: fontResizeFactor * 3 - 2 },
  // ]
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

const refresh = () => {
  let targetWidth, targetHeight
  ;({ pixelSize, pixelW, pixelH, numCols, numRows, targetWidth, targetHeight } =
    getFullPixelSize(mediaSize, obj.pixelSizeFactor))

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

  fontHue = getHueFromHex(obj.fontColor)

  backgroundRGB = hexToRgb(obj.backgroundColor)
  backgroundHue = getHueFromHex(obj.backgroundColor)

  // threshold = obj.threshold / 100
  // counter = 0
  // randomness = obj.randomness / 100
  // randomColumnArray = []
  // startingRowArray = []

  // for (var i = 0; i < numCols; i++) {
  //   if (Math.random() < randomness) {
  //     randomColumnArray[i] = true
  //     startingRowArray[i] = Math.floor(Math.random() * numRows)
  //   } else {
  //     randomColumnArray[i] = false
  //   }
  // }

  if (types.video === "image") {
    anime.animationRequest = requestAnimationFrame(loop)
  }
  // localStorage.setItem("brat", JSON.stringify(obj))
}

//animation loop to go frame by frame
function loop() {
  if (counter == 0) {
    console.log("start animation, first frame")
  }
  if (anime.playAnimationToggle) {
    counter++
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

export { render, renderText, renderBrat, refresh, loop }
