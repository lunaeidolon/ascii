import Chance from "chance"

import { ctx } from "../const/dom"
import { obj, mediaSize, types } from "../const/variables"

const chance = new Chance()

let randomSeeds = []

function getRandomPercentSubsetWithChance(n, percent) {
  const total = n + 1
  const count = Math.floor((total * percent) / 100)
  const pool = Array.from({ length: total }, (_, i) => i)

  return chance.pickset(pool, count) // 从 pool 中随机选 count 个，不重复
}

function getRandomSeeds(numCols, numRows) {
  const randomX = getRandomPercentSubsetWithChance(numCols, obj.fillGlitchSeed)
  const randomY = getRandomPercentSubsetWithChance(numCols, obj.fillGlitchSeed)

  randomSeeds = randomX.map((x, i) => {
    return { x, y: randomY[i] }
  })
}

function distanceToRandom(x, y) {
  let d

  for (let i = 0; i < randomSeeds.length; i++) {
    const seed = randomSeeds[i]
    const dx = Math.abs(seed.x - x)
    const dy = Math.abs(seed.y - y)

    const dxy = Math.sqrt(dx * dx + dy * dy)

    d = d ? Math.min(dxy, d) : dxy
  }

  return d
}

const renderFillGlitch = ({
  fontSize,
  numRows,
  numCols,
  grayscaleDataArray,
  opacityArray,
  fontFamily,
  offsetW,
  offsetH,
  pixelW,
  pixelH,
} = params) => {
  ctx.drawImage(
    types.video === "Select Video" ? userVideo : defaultVideo,
    offsetW,
    offsetH,
    mediaSize.width,
    mediaSize.height,
  )

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

  const thresholdX = numCols * (obj.fillGlitchSize / 100)
  const thresholdY = numRows * (obj.fillGlitchSize / 100)
  const threshold = Math.sqrt(thresholdX * thresholdX + thresholdY * thresholdY)

  for (var row = 0; row < numRows; row++) {
    const rowOdd = Math.floor((row - 2) / 2) % 2 === 0 // 奇数

    for (var col = 0; col < numCols; col++) {
      const opacity = opacityArray[row][col]
      if (opacity.show > obj.fillGlitchThreshold) {
        if (col === 0) {
          charIndex = rowOdd ? 0 : obj.offsetLength
          charOffset = 0

          charSet = row % 2 === 0 ? charsA : charsB
        }
        const char = charSet[charIndex]
        const color = grayscaleDataArray[row][col][1]

        const textYOffset =
          obj.pixelSizeFactor < 20 ? -3.5 : obj.pixelSizeFactor < 51 ? -1 : 0

        const x = offsetW + col * pixelW
        const y = offsetH + row * pixelH

        if (obj.ifBackground) {
          if (obj.fillGlitchBgColor) {
            ctx.fillStyle = `rgba(${color[0].toFixed(0)}, ${color[1].toFixed(
              0,
            )}, ${color[2].toFixed(0)}, ${opacity.show / 2})`
          } else {
            ctx.fillStyle = obj.backgroundColor
          }

          const offsetX =
            obj.fontOffset[0] > 0 ? obj.fontOffset[0] : obj.fontOffset[1] * 0.3
          const offsetY = obj.fontOffset[1] * 0.3

          ctx.fillRect(
            x - offsetX,
            y - offsetY,
            pixelW + offsetX * 2,
            pixelH + offsetY * 2,
          )
        }

        // Text Noise Color
        if (chance.bool({ likelihood: obj.fillGlitchNoiseChance })) {
          const theCol = Math.min(
            Math.max(chance.integer({ min: -5, max: 5 }) + col, 0),
            numCols - 1,
          )
          const theRow = Math.min(
            Math.max(chance.integer({ min: -5, max: 5 }) + row, 0),
            numRows - 1,
          )
          const targetColor = grayscaleDataArray[theRow][theCol][1]
          ctx.fillStyle = `rgba(${targetColor[0].toFixed(
            0,
          )}, ${targetColor[1].toFixed(0)}, ${targetColor[2].toFixed(0)}, ${
            opacity.show
          })`
        } else {
          ctx.fillStyle = `rgba(${color[0].toFixed(0)}, ${color[1].toFixed(
            0,
          )}, ${color[2].toFixed(0)}, ${opacity.show})`
        }
        ctx.font = fontResize + "px " + fontFamily
        ctx.fillText(
          char.c,
          x - obj.fontOffset[0],
          y + pixelH - obj.fontOffset[1] * 1.3,
        )
        nextChar()
      }
    }
  }
}

export { getRandomSeeds, renderFillGlitch }
