import { obj, webcam, dVideo, cvs, types, anime } from "./variables"
import { loop, refresh } from "./render"

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
  canvas.width = cvs.width
  canvas.height = cvs.height

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
      canvas.width = cvs.width
      canvas.height = cvs.height

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
    userVideo.width = userVideo.videoWidth
    userVideo.height = userVideo.videoHeight
    console.log(
      "user video width/height: " + userVideo.width + ", " + userVideo.height,
    )

    cvs.width = Math.min(userVideo.videoWidth, cvs.maxWidth)
    cvs.height = Math.floor(
      cvs.width * (userVideo.videoHeight / userVideo.videoWidth),
    )

    canvas.width = cvs.width
    canvas.height = cvs.height
  })

  setTimeout(function () {
    userVideo.play()
    refresh()
    anime.playAnimationToggle = true
    anime.animationRequest = requestAnimationFrame(loop)
  }, 2000)
})

/*
  //shortcut hotkey presses
  document.addEventListener('keydown', function(event) {
    
      if(event.shiftKey && event.key == 'p'){
          togglePausePlay();
      } else if (event.key === 'i' && event.shiftKey) {
          saveImage();
      } else if (event.key === 'v' && event.shiftKey) {
          toggleVideoRecord();
      } else if (event.key === 'o' && event.shiftKey) {
          dat.GUI.toggleHide();
      } 
     
  });
  
  //shortcut hotkey presses
  document.addEventListener('keydown', function(event) {
    
      if(event.key === 'h') {
          toggleGUI();
      } 
     
  });
  */

export {
  togglePausePlay,
  changeVideoType,
  startDefaultVideo,
  startWebcam,
  stopVideo,
}
