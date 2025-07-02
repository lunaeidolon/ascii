const imagePaths = [
  "assets/els/c-01.png",
  "assets/els/c-02.png",
  "assets/els/c-03.png",
  "assets/els/c-04.png",
  "assets/els/c-05.png",
  "assets/els/c-06.png",
  "assets/els/c-07.png",
]

// 用于存储每张图的 ImageBitmap 和 离屏 Canvas
const imageCache = new Array()

/**
 * 加载单张 ImageBitmap
 */
async function loadImageBitmap(src) {
  const response = await fetch(src)
  const blob = await response.blob()
  return await createImageBitmap(blob)
}

/**
 * 将 ImageBitmap 缓存到离屏 Canvas
 */
function createOffscreenCanvas(imageBitmap) {
  const canvas = document.createElement("canvas")
  canvas.width = imageBitmap.width
  canvas.height = imageBitmap.height
  const ctx = canvas.getContext("2d")
  ctx.drawImage(imageBitmap, 0, 0)
  return canvas
}

/**
 * 批量加载并缓存图像
 */
async function loadAndCacheImages(paths) {
  for (const path of paths) {
    const bitmap = await loadImageBitmap(path)
    const offscreenCanvas = createOffscreenCanvas(bitmap)
    imageCache.push({
      path,
      bitmap,
      offscreenCanvas,
    })
  }

  return imageCache
}

/**
 * 示例：绘制图像到主 canvas
 */
// function drawAllImages(ctx) {
//   let x = 0
//   for (const { offscreenCanvas } of imageCache.values()) {
//     ctx.drawImage(offscreenCanvas, x, 0)
//     x += offscreenCanvas.width + 10 // 间距
//   }
// }

// 使用方式：
// const canvas = document.getElementById("myCanvas")
// const ctx = canvas.getContext("2d")

// loadAndCacheImages(imagePaths).then(() => {
//   drawAllImages(ctx)
// })

export { imagePaths, imageCache, loadAndCacheImages }
