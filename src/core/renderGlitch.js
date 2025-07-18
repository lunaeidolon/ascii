import Chance from "chance"

import { ctx } from "../const/dom"
import { obj } from "../const/variables"

const chance = new Chance()

const glitchDice = () => {
  return chance.bool({ likelihood: obj.pixelSizeFactor / 500 })
}

const glitchSize = () => {
  return chance.weighted([1, 2, 3, 4, 6, 8, 10], [1, 1, 1, 1, 1, 1, 1])
}

const randomSpan = (max = 60, min = 0) => {
  if (max - min < 1) throw new Error("区间太小，无法取两个不同的数")

  const a = chance.integer({ min, max })
  let b

  // 生成直到不同为止
  do {
    b = chance.integer({ min, max })
  } while (b === a)

  return [Math.min(a, b), Math.max(a, b)]
}

const randomChar = () => {
  return chance.pickone(chars)
}

const glitchPool = []

const getAverageColor = (pixels = []) => {
  var r = 0
  var g = 0
  var b = 0

  for (let i = 0; i < pixels.length; i++) {
    r += pixels[i][1][0]
    g += pixels[i][1][1]
    b += pixels[i][1][2]
  }
  return [r / pixels.length, g / pixels.length, b / pixels.length]
}

const getPixels = (allPixels, startRow, endRow, startCol, endCol) => {
  const pixels = []

  for (let y = startRow; y < endRow; y++) {
    for (let x = startCol; x < endCol; x++) {
      pixels.push(allPixels[y][x])
    }
  }

  return pixels
}

const getColor = (allPixels, startRow, endRow, startCol, endCol) => {
  const pixels = getPixels(allPixels, startRow, endRow, startCol, endCol)
  const color = getAverageColor(pixels)

  return color
}

const chars = ["a", "b", "c", "d"]
const charsLength = chars.length
let charIndex = 0

function nextChar() {
  if (charIndex + 1 === charsLength) {
    charIndex = 0
  } else {
    charIndex++
  }
}

const glitchs = []

const renderGlitch = (
  allPixels,
  pixelSize,
  pixelW,
  pixelH,
  numCols,
  numRows,
) => {
  let skip = 1
  //   const width = pixelW * numCols
  //   const height = pixelH * numCols

  for (let cellY = 0; cellY < numRows; cellY += skip) {
    skip = 1
    charIndex = 0
    if (glitchDice()) {
      const size = glitchSize()
      const maxCol = Math.floor(numCols / size) - 1
      const colSpan = randomSpan(maxCol)

      const glitchSpan = []

      for (let spanIndex = colSpan[0]; spanIndex < colSpan[1]; spanIndex++) {
        const startCol = spanIndex * size
        const endCol =
          (spanIndex + 1) * size > numCols - 1
            ? numCols - 1
            : (spanIndex + 1) * size
        const startRow = cellY
        const endRow = cellY + size > numRows - 1 ? numRows - 1 : cellY + size

        glitchSpan.push({
          startCol,
          endCol,
          startRow,
          endRow,
          size,
          char: chars[charIndex],
        })

        nextChar()
      }

      glitchs.push(glitchSpan)

      if (glitchs.length > 10) {
        glitchs.shift()
      }

      skip = size
    }
  }

  if (glitchs.length > 0) {
    for (let g = 0; g < glitchs.length; g++) {
      const glitch = glitchs[g]

      for (let c = 0; c < glitch.length; c++) {
        const char = glitch[c]
        const x = char.startCol * pixelW
        const y = char.startRow * pixelH

        const width = (char.endCol - char.startCol) * pixelW
        const height = char.size * pixelH
        const color = getColor(
          allPixels,
          char.startRow,
          char.endRow,
          char.startCol,
          char.endCol,
        )

        if (obj.ifBackground) {
          ctx.fillStyle = obj.backgroundColor
          ctx.fillRect(x, y, width, height)
        }
        const size = pixelSize * char.size

        ctx.fillStyle = `rgba(${color[0].toFixed(0)}, ${color[1].toFixed(
          0,
        )}, ${color[2].toFixed(0)}, 1)`
        ctx.font = size + "px brat"
        ctx.textBaseline = "bottom"
        ctx.fillText(char.char, x, y + size)
      }
    }
  }
}

const gap = 3

const renderTest = (allPixels, pixelSize, pixelW, pixelH, numCols, numRows) => {
  for (let row = 0; row < allPixels.length; row += gap) {
    for (let col = 0; col < allPixels[row].length; col += gap) {
      const el = allPixels[row][col]

      const x = col * pixelW
      const y = row * pixelH
      const radius = (pixelSize / 2) * gap

      ctx.beginPath()
      ctx.arc(x, y, radius, 0, Math.PI * 2) // 画一个完整的圆
      ctx.strokeStyle = "white" // 描边颜色
      ctx.lineWidth = 0.5 // 描边宽度为 2px
      ctx.stroke() // 执行描边

      ctx.fillStyle = `white`
      ctx.font = radius * 2 + "px brat"
      ctx.textBaseline = "bottom"
      ctx.fillText(chars[charIndex], x + radius / 2, y + radius)

      nextChar()
    }
  }

  charIndex = 0
}

export { renderGlitch, renderTest }
