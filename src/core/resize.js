import { obj, mediaSize } from "../const/variables"

function getFullPixelSize(mediaSize, pixelSizeFactor) {
  const pixelSize = Math.ceil(
    Math.min(mediaSize.width, mediaSize.height) / pixelSizeFactor,
  )
  const pixelW = pixelSize
  const pixelH = pixelSize

  const numCols = Math.ceil(mediaSize.width / pixelW)
  const numRows = Math.ceil(mediaSize.height / pixelH)

  const targetWidth = numCols * pixelW
  const targetHeight = numRows * pixelH

  return {
    pixelSize,
    pixelW,
    pixelH,
    numCols,
    numRows,
    targetWidth,
    targetHeight,
  }
}

function getMaxSize(mediaSize) {
  let maxWidth = mediaSize.width
  let maxHeight = mediaSize.height

  for (
    let pixelSizeFactor = obj.minPixelSizeFactor;
    pixelSizeFactor < 200;
    pixelSizeFactor++
  ) {
    const result = getFullPixelSize(mediaSize, pixelSizeFactor)

    maxWidth = Math.max(maxWidth, result.targetWidth)
    maxHeight = Math.max(maxHeight, result.targetHeight)
  }

  return {
    maxWidth,
    maxHeight,
  }
}

export { getFullPixelSize, getMaxSize }
