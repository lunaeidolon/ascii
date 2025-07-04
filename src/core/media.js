import { ctx, dpr } from "../const/dom"
import { webcam, dVideo, cvs, types, anime } from "../const/variables"
import { loop, refresh } from "./render"
import { isIOS, isAndroid } from "../utils/broswer"

// canvas dpr

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
    console.log("select video file")
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

  cvs.width = dVideo.width
  cvs.height = dVideo.height
  canvas.width = cvs.width * dpr
  canvas.height = cvs.height * dpr

  canvas.style.width = cvs.width + "px"
  canvas.style.height = cvs.height + "px"

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0) // 设置缩放

  defaultVideo.play()
  anime.playAnimationToggle = true
  anime.animationRequest = requestAnimationFrame(loop)
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

      cvs.width = webcam.width
      cvs.height = webcam.height
      canvas.width = cvs.width * dpr
      canvas.height = cvs.height * dpr

      canvas.style.width = cvs.width + "px"
      canvas.style.height = cvs.height + "px"

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

  types.video = "Select Video"

  const file = e.target.files[0]
  const url = URL.createObjectURL(file)
  userVideo.src = url
  userVideo.addEventListener("loadedmetadata", () => {
    userVideo.width = userVideo.videoWidth / 2
    userVideo.height = userVideo.videoHeight / 2
    console.log(
      "user video width/height: " + userVideo.width + ", " + userVideo.height,
    )

    cvs.width = Math.min(userVideo.width, cvs.maxWidth)
    cvs.height = Math.floor(cvs.width * (userVideo.height / userVideo.width))

    canvas.width = cvs.width * dpr
    canvas.height = cvs.height * dpr

    canvas.style.width = cvs.width + "px"
    canvas.style.height = cvs.height + "px"

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0) // 设置缩放
  })

  setTimeout(function () {
    userVideo.play()
    refresh()
    anime.playAnimationToggle = true
    anime.animationRequest = requestAnimationFrame(loop)
  }, 2000)
})

export {
  togglePausePlay,
  changeVideoType,
  startDefaultVideo,
  startWebcam,
  stopVideo,
}
