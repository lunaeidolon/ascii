let obj

const objDefault = {
  ifBackground: true,
  // backgroundColor: "#080c37",
  backgroundColor: "#000000",
  backgroundGradient: true,
  // backgroundSaturation: 60,
  backgroundSaturation: 0,
  offsetLength: 1,
  opacity: 100,
  fontColor: "#c7205b",
  fontColor2: "#0032ff",
  fontSizeFactor: 3,
  pixelSizeFactor: 15,
  minPixelSizeFactor: 2,
  threshold: 30,
  textInput: "wavesand",
  randomness: 0,
  invert: false,
  animationType: "Random Text",
  bratType: "fillglitch", // 'fill' 'glitch'
  bratSize: "shape", // 'video' 'shape'
  glitchRandom: 90,
  glitchMass: 30,
  glitchSizeMax: 8,
  glitchLengthMin: 1,

  animeDuration: 3,
  animeEase: "inExpo",
  animeDuringRecord: true,
  customEase: "",

  fillGlitchSeed: 10,
  fillGlitchSize: 6,
}

// const localObj = localStorage.getItem("bart")
// if (localObj) {
//   try {
//     obj = JSON.parse(localObj)
//   } catch (e) {
//     console.warn("localStorage 中数据解析失败，使用默认值")
//     obj = objDefault
//   }
// } else {
obj = objDefault
// }

const webcam = () => {
  const aspectRatio = 1
  const videoMaxWidth = 1080
  const width = Math.min(videoMaxWidth, Math.floor(window.innerWidth))
  const height = Math.round(width / aspectRatio)

  return {
    aspectRatio,
    videoMaxWidth,
    width,
    height,
  }
}

const dVideo = {
  width: (1920 * 3) / 4,
  height: (1080 * 3) / 4,
}

const mediaSize = {
  width: dVideo.width,
  height: dVideo.height,
  maxSize: 1080,
  maxWidth: dVideo.width,
  maxHeight: dVideo.height,
}

const types = {
  video: "Default",
}

const anime = { animationRequest: null, playAnimationToggle: false }

export { obj, webcam, dVideo, mediaSize, types, anime }
