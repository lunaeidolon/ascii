const obj = {
  ifBackground: false,
  // backgroundColor: "#080c37",
  backgroundColor: "#000000",
  backgroundGradient: true,
  // backgroundSaturation: 60,
  backgroundSaturation: 0,
  fontColor: "#c7205b",
  fontColor2: "#0032ff",
  fontSizeFactor: 3,
  pixelSizeFactor: 70,
  threshold: 30,
  textInput: "wavesand",
  randomness: 0,
  invert: false,
  animationType: "Random Text",
}

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
  width: 476,
  height: 848,
}

const cvs = {
  width: dVideo.width,
  height: dVideo.height,
  maxWidth: 1080,
}

const types = {
  video: "Default",
  animation: obj.animationType,
}

const anime = { animationRequest: null, playAnimationToggle: false }

export { obj, webcam, dVideo, cvs, types, anime }
