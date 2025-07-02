// DOM 获取视频和画布元素
export const webcamVideo = document.getElementById("webcamVideo")
export const userVideo = document.getElementById("userVideo")
export const defaultVideo = document.getElementById("defaultVideo")

const dpr = window.devicePixelRatio || 1

const canvas = document.getElementById("canvas")
const ctx = canvas.getContext("2d", {
  willReadFrequently: true,
})
ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

//Final animation canvas
export { dpr, canvas, ctx }

//Canvas for raw still images from video
export const canvasRaw = document.getElementById("canvas-video")
export const ctx2 = canvasRaw.getContext("2d", {
  willReadFrequently: true,
})

//canvas for pixelated grayscale images
export const canvasPixel = document.getElementById("canvas-video-pixel")
export const ctx3 = canvasPixel.getContext("2d", {
  willReadFrequently: true,
})
