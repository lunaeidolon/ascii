import {
  canvas,
  ctx,
  defaultVideo,
  dpr,
  imageEl,
  userVideo,
} from "../const/dom"
import { webcam, dVideo, mediaSize, types, anime } from "../const/variables"
import { loop, refresh, renderBrat } from "./render"
import { isIOS, isAndroid } from "../utils/broswer"
import { resetGlitch } from "./renderGlitch"
import { getMaxSize } from "./resize"

function togglePausePlay() {
  if (anime.playAnimationToggle == false) {
    if (types.video == "Webcam") {
      startWebcam()
    } else if (types.video == "Select Video") {
      refresh()
      userVideo.play()
      anime.playAnimationToggle = true
      anime.animationRequest = requestAnimationFrame(loop)
    } else if (types.video == "Default") {
      startDefaultVideo()
    }
  } else {
    stopVideo()
  }
}

function changeVideoType() {
  stopVideo()

  if (types.video == "Webcam") {
    startWebcam()
  } else if (types.video == "Select Video") {
    selectVideo()
  } else if (types.video == "Default") {
    startDefaultVideo()
  }

  refresh()
}

function startDefaultVideo() {
  if (anime.playAnimationToggle == true) {
    anime.playAnimationToggle = false
    cancelAnimationFrame(anime.animationRequest)
    console.log("cancel animation")
  }

  mediaSize.width = dVideo.width
  mediaSize.height = dVideo.height
  canvas.width = mediaSize.width * dpr
  canvas.height = mediaSize.height * dpr

  canvas.style.width = mediaSize.width + "px"
  canvas.style.height = mediaSize.height + "px"

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0) // 设置缩放

  defaultVideo.play()
  anime.playAnimationToggle = true
  anime.animationRequest = requestAnimationFrame(loop)

  refresh()
}

function startWebcam() {
  if (anime.playAnimationToggle == true) {
    anime.playAnimationToggle = false
    cancelAnimationFrame(anime.animationRequest)
    console.log("cancel animation")
  }

  navigator.mediaDevices
    .getUserMedia({
      audio: false,
      video: true,
    })
    .then((stream) => {
      window.localStream = stream
      webcamVideo.srcObject = stream
      webcamVideo.play()
      if (isIOS || isAndroid) {
        webcam.aspectRatio = 3 / 4
      } else {
        webcam.aspectRatio = stream
          .getVideoTracks()[0]
          .getSettings().aspectRatio
      }

      if (webcam.aspectRatio == undefined) {
        webcam.aspectRatio = 1.33333
      }
      console.log("Aspect Ratio: " + webcam.aspectRatio)

      webcam.width = Math.min(
        webcam.videoMaxWidth,
        Math.floor(window.innerWidth),
      )
      webcam.height = Math.round(webcam.width / webcam.aspectRatio)

      mediaSize.width = webcam.width
      mediaSize.height = webcam.height
      canvas.width = mediaSize.width * dpr
      canvas.height = mediaSize.height * dpr

      canvas.style.width = mediaSize.width + "px"
      canvas.style.height = mediaSize.height + "px"

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0) // 设置缩放

      refresh()

      anime.playAnimationToggle = true
      anime.animationRequest = requestAnimationFrame(loop)
    })
    .catch((err) => {
      console.log(err)
    })
}

var localStream
function stopVideo() {
  if (anime.playAnimationToggle == true) {
    anime.playAnimationToggle = false
    cancelAnimationFrame(anime.animationRequest)
    console.log("cancel animation")
  }

  webcamVideo.pause()
  userVideo.pause()
  defaultVideo.pause()

  if (localStream == null) {
  } else {
    localStream.getVideoTracks()[0].stop()
  }
}

var fileInput = document.getElementById("fileInput")
fileInput.addEventListener("change", (e) => {
  if (anime.playAnimationToggle == true) {
    anime.playAnimationToggle = false
    cancelAnimationFrame(anime.animationRequest)
    console.log("cancel animation")
  }

  const file = e.target.files[0]
  const type = file.type.split("/")[0]
  const url = URL.createObjectURL(file)

  if (type === "video") {
    resetGlitch()
    types.video = "Select Video"
    // userVideo.muted = false
    userVideo.src = url
    userVideo.addEventListener("loadedmetadata", () => {
      userVideo.width = userVideo.videoWidth / 2
      userVideo.height = userVideo.videoHeight / 2
      console.log(
        "user video width/height: " + userVideo.width + ", " + userVideo.height,
      )

      if (userVideo.width > userVideo.height) {
        mediaSize.width = Math.min(userVideo.width, mediaSize.maxSize)
        mediaSize.height = Math.floor(
          mediaSize.width * (userVideo.height / userVideo.width),
        )
      } else {
        mediaSize.height = Math.min(userVideo.height, mediaSize.maxSize)
        mediaSize.width = Math.floor(
          mediaSize.height * (userVideo.width / userVideo.height),
        )
      }

      const maxSize = getMaxSize(mediaSize)

      mediaSize.maxWidth = maxSize.maxWidth
      mediaSize.maxHeight = maxSize.maxHeight

      userVideo.classList.remove("hidden")
      defaultVideo.classList.add("hidden")
    })

    setTimeout(function () {
      userVideo.play()
      refresh()
      anime.playAnimationToggle = true
      anime.animationRequest = requestAnimationFrame(loop)
    }, 2000)
  } else if (type === "image") {
    types.video = "image"

    imageEl.src = url
    imageEl.onload = (img) => {
      mediaSize.width = imageEl.width
      mediaSize.height = imageEl.height

      refresh()
      anime.playAnimationToggle = true
      anime.animationRequest = requestAnimationFrame(loop)
    }
  }
})

function audioStream(video) {
  const audioCtx = new AudioContext()
  const sourceNode = audioCtx.createMediaElementSource(video)
  const dest = audioCtx.createMediaStreamDestination()
  sourceNode.connect(dest)
  sourceNode.connect(audioCtx.destination)

  return dest
}

export {
  togglePausePlay,
  changeVideoType,
  startDefaultVideo,
  startWebcam,
  stopVideo,
  audioStream,
}
