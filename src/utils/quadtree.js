let flat = []

function buildQuadtree(matrix, x, y, w, h, threshold = 5) {
  const region = extractRegion(matrix, x, y, w, h)
  const { min, max, mean } = analyzeRegion(region)

  if (max - min <= threshold || w <= 1 || h <= 1) {
    flat.push({ x, y, w, h, value: mean })
    return { x, y, w, h, value: mean, children: null }
  }

  const w2 = Math.floor(w / 2)
  const h2 = Math.floor(h / 2)

  return {
    x,
    y,
    w,
    h,
    value: mean,
    children: [
      buildQuadtree(matrix, x, y, w2, h2, threshold),
      buildQuadtree(matrix, x + w2, y, w - w2, h2, threshold),
      buildQuadtree(matrix, x, y + h2, w2, h - h2, threshold),
      buildQuadtree(matrix, x + w2, y + h2, w - w2, h - h2, threshold),
    ],
  }
}

function extractRegion(matrix, x, y, w, h) {
  const values = []
  for (let j = y; j < y + h; j++) {
    for (let i = x; i < x + w; i++) {
      if (matrix[j] && matrix[j][i] !== undefined) {
        values.push(matrix[j][i])
      }
    }
  }
  return values
}

function analyzeRegion(values) {
  const min = Math.min(...values)
  const max = Math.max(...values)
  const mean = values.reduce((a, b) => a + b, 0) / values.length
  if (!mean) {
    console.log(values)
  }
  return { min, max, mean }
}

export const quadTreeFlat = (origin, threshold) => {
  flat = []

  const data = origin.map((x) => {
    return x.map((y) => {
      return y[0]
    })
  })

  const col = origin.length
  const row = origin[0].length

  buildQuadtree(data, 0, 0, col, row, 115)

  return flat
}
