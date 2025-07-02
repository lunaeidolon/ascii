import { obj, cvs, types, anime } from "../const/variables"
import {
  webcamVideo,
  userVideo,
  defaultVideo,
  canvas,
  ctx,
  dpr,
  canvasRaw,
  canvasPixel,
} from "../const/dom"

import {
  getAverageColor,
  getHueFromHex,
  hexToRgb,
  interpolateHex,
  tweakHexColor,
} from "../utils/color"

import { record, renderCanvasToVideoFrameAndEncode } from "./record"

var pixelSize
var numCols
var numRows
var alpha = 1

var fontFamily = "Courier New"
var fontSize
//this defines the character set. ordered by darker to lighter colour
const gradient = "____``..--^^~~<>??123456789%%&&@@"
const preparedGradient = gradient.replaceAll("_", "\u00A0")

var effectWidthInput = document.getElementById("effectWidthInput")
effectWidthInput.style.width = cvs.width
var effectWidth = Number(effectWidthInput.value) / 100
var effectWidthLabel = document.getElementById("effectWidthLabel")

var randomColumnArray = []
var startingRowArray = []

var counter = 0
var webcamStream

//turn video input into still images, and then into pixelated grayscale values

var videoPixels = []
var grayscaleDataArray = []

var backgroundColor = obj.backgroundColor
var backgroundRGB = hexToRgb(backgroundColor)
var backgroundHue = getHueFromHex(backgroundColor)
var backgroundSaturation = obj.backgroundSaturation

var backgroundGradient = obj.backgroundGradient
var fontSizeFactor = obj.fontSizeFactor
var pixelSizeFactor = obj.pixelSizeFactor
var fontColor = obj.fontColor
var fontHue = getHueFromHex(fontColor)
var fontColor2 = obj.fontColor2

var threshold = obj.threshold / 100
var textInput = obj.textInput
var randomness = obj.randomness / 100
var invertToggle = obj.invert

const getCharByScale = (scale) => {
  const val = Math.floor((scale / 255) * (gradient.length - 1))
  return preparedGradient[val]
}

const render = (context) => {
  if (cvs.width && cvs.height) {
    canvasRaw.width = cvs.width
    canvasRaw.height = cvs.height

    //choose video feed
    if (types.video == "Webcam") {
      context.drawImage(webcamVideo, 0, 0, cvs.width / dpr, cvs.height / dpr)
    } else if (types.video == "Select Video") {
      context.drawImage(userVideo, 0, 0, cvs.width / dpr, cvs.height / dpr)
    } else if (types.video == "Default") {
      context.drawImage(defaultVideo, 0, 0, cvs.width / dpr, cvs.height / dpr)
    }

    var pixelData = context.getImageData(0, 0, cvs.width, cvs.height)
    var pixels = pixelData.data

    //new canvas with a pixelated image
    canvasPixel.width = cvs.width
    canvasPixel.height = cvs.height
    videoPixels = []
    grayscaleDataArray = []

    for (var cellY = 0; cellY < numRows; cellY++) {
      grayscaleDataArray[cellY] = []

      for (var cellX = 0; cellX < numCols; cellX++) {
        var cellPixels = []

        for (var pixelY = 0; pixelY < pixelSize; pixelY++) {
          for (var pixelX = 0; pixelX < pixelSize; pixelX++) {
            var currentXPosition = cellX * pixelSize + pixelX
            var currentYPosition = cellY * pixelSize + pixelY

            var currentPixelDataValue =
              (currentYPosition * cvs.width + currentXPosition) * 4

            if (currentXPosition < cvs.width && currentYPosition < cvs.height) {
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
        grayscaleDataArray[cellY][cellX] = grayScaleValue
      }
    }
  } else {
    context.fillStyle = "#fff"
    context.fillRect(0, 0, cvs.width, cvs.height)
  }
}

//draw the text and background color for each frame onto the final canvas
const renderText = () => {
  ctx.fillStyle = backgroundColor
  ctx.fillRect(0, 0, cvs.width * effectWidth, cvs.height)

  for (var col = 0; col < numCols; col++) {
    for (var row = 0; row < numRows; row++) {
      var adjustedThreshold =
        threshold + 0.2 * Math.sin(counter / 30) * randomness
      var currentGrayValue = grayscaleDataArray[row][col]

      var char
      var currentFontSize = Math.min(
        fontSize * 3,
        (fontSize * fontSizeFactor) / 3,
      )

      //draw background color of pixels
      if (counter % 8 == 0 && Math.random() < randomness * 0.002) {
        ctx.fillStyle = tweakHexColor(backgroundColor, 100 * randomness)
        ctx.fillRect(col * pixelSize, row * pixelSize, pixelSize, pixelSize)
      } else if (backgroundGradient) {
        var currentBackgroundColor =
          "hsl(" +
          backgroundHue +
          "," +
          backgroundSaturation +
          "%," +
          Math.pow(currentGrayValue / 255, 2) * 100 +
          "%)"
        var currentBackgroundColorInvert =
          "hsl(" +
          backgroundHue +
          "," +
          backgroundSaturation +
          "%," +
          (1 - Math.pow(currentGrayValue / 255, 2)) * 100 +
          "%)"

        if (invertToggle == false) {
          if (currentGrayValue / 255 > adjustedThreshold) {
            ctx.fillStyle = currentBackgroundColor
          } else {
            ctx.fillStyle =
              "hsl(" +
              backgroundHue +
              "," +
              backgroundSaturation +
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
              backgroundSaturation +
              "%," +
              (adjustedThreshold / 4) * 100 +
              "%)"
          }
        }

        ctx.fillRect(col * pixelSize, row * pixelSize, pixelSize, pixelSize)
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
      } else if (types.animation == "Random Text") {
        char = getCharByScale(currentGrayValue)
      } else if (types.animation == "User Text") {
        char = textInput[(row * numCols + col) % textInput.length]
        if (invertToggle) {
          currentFontSize = Math.min(
            fontSize * 3,
            Math.floor(
              (((1 - Math.pow(currentGrayValue / 255, 1)) * fontSizeFactor) /
                3) *
                fontSize,
            ),
          )
        } else {
          currentFontSize = Math.min(
            fontSize * 3,
            Math.floor(
              ((Math.pow(currentGrayValue / 255, 1) * fontSizeFactor) / 3) *
                fontSize,
            ),
          )
        }
      }

      //draw text onto canvas
      ctx.font = currentFontSize + "px " + fontFamily

      if (invertToggle == false) {
        if (currentGrayValue / 255 > adjustedThreshold) {
          ctx.fillStyle = interpolateHex(
            fontColor,
            fontColor2,
            (currentGrayValue / 255 - adjustedThreshold) /
              (1 - adjustedThreshold),
          )
          ctx.fillText(char, col * pixelSize, row * pixelSize + pixelSize)
          //ctx.strokeStyle = fontColor;
          //ctx.strokeText(char, col*pixelSize + pixelSize/4, row*(pixelSize) + pixelSize/2);
        }
      } else {
        if (currentGrayValue / 255 < 1 - adjustedThreshold) {
          ctx.fillStyle = interpolateHex(
            fontColor2,
            fontColor,
            currentGrayValue / 255 / (1 - adjustedThreshold),
          )
          ctx.fillText(char, col * pixelSize, row * pixelSize + pixelSize)
        }
      }
    }
  }
}

const refresh = () => {
  console.log("refresh")
  console.log("canvas width/height: " + cvs.width + ", " + cvs.height)

  document
    .getElementById("canvasDiv")
    .setAttribute("style", "width: " + cvs.width + "px;")
  //effectWidthInput.style.width = cvs.width;
  effectWidth = Number(effectWidthInput.value) / 100
  effectWidthLabel.innerHTML =
    "Effect Width: " + Math.round(effectWidth * 100) + "%"

  types.animation = obj.animationType
  fontSizeFactor = obj.fontSizeFactor
  pixelSizeFactor = obj.pixelSizeFactor
  pixelSize = Math.ceil(Math.min(cvs.width, cvs.height) / pixelSizeFactor)
  numCols = Math.ceil(Math.ceil(cvs.width / pixelSize) * effectWidth)
  numRows = Math.ceil(cvs.height / pixelSize)
  fontSize = pixelSize / 0.65
  ctx.font = fontSize + "px " + fontFamily

  fontColor = obj.fontColor
  fontColor2 = obj.fontColor2
  fontHue = getHueFromHex(fontColor)

  backgroundColor = obj.backgroundColor
  backgroundRGB = hexToRgb(backgroundColor)
  backgroundHue = getHueFromHex(backgroundColor)
  backgroundSaturation = obj.backgroundSaturation

  backgroundGradient = obj.backgroundGradient
  threshold = obj.threshold / 100
  textInput = obj.textInput
  counter = 0
  randomness = obj.randomness / 100
  invertToggle = obj.invert
  randomColumnArray = []
  startingRowArray = []

  for (var i = 0; i < numCols; i++) {
    if (Math.random() < randomness) {
      randomColumnArray[i] = true
      startingRowArray[i] = Math.floor(Math.random() * numRows)
    } else {
      randomColumnArray[i] = false
    }
  }
}

effectWidthInput.addEventListener("change", refresh)

//animation loop to go frame by frame
function loop() {
  if (counter == 0) {
    console.log("start animation, first frame")
  }
  if (anime.playAnimationToggle) {
    counter++
    render(ctx)

    if (effectWidth < 1) {
      //draw the chosen video onto the final canvas
      if (types.video == "Webcam") {
        ctx.drawImage(webcamVideo, 0, 0, cvs.width, cvs.height)
      } else if (types.video == "Select Video") {
        ctx.drawImage(userVideo, 0, 0, cvs.width, cvs.height)
      } else if (types.video == "Default") {
        ctx.drawImage(defaultVideo, 0, 0, cvs.width, cvs.height)
      }
    }

    renderText()

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

export { render, renderText, refresh, loop }
