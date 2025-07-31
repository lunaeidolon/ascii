const getCharByScale = (scale) => {
  const val = Math.floor((scale / 255) * (gradient.length - 1))
  return preparedGradient[val]
}

// bitmap
const getBitmapByScale = (scale) => {
  const val = Math.floor((scale / 255) * (imageCache.length - 1))
  return imageCache[val]
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
