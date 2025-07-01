import dat from "dat.gui"

import { obj, types } from "../const/variables"
import { refresh } from "../core/render"
import {
  togglePausePlay,
  changeVideoType,
  startDefaultVideo,
  startWebcam,
  stopVideo,
} from "../core/media"
import { record, toggleVideoRecord } from "../core/record"

var gui
var guiOpenToggle = false

const initGUI = () => {
  gui = new dat.gui.GUI({ autoPlace: false })
  gui.close()

  obj["selectVideo"] = function () {
    types.video = "Select Video"
    fileInput.click()
  }
  gui.add(obj, "selectVideo").name("Upload Video")

  obj["useWebcam"] = function () {
    types.video = "Webcam"
    changeVideoType()
  }
  gui.add(obj, "useWebcam").name("Use Webcam")

  gui
    .addColor(obj, "backgroundColor")
    .name("Background Color")
    .onFinishChange(refresh)
  gui.add(obj, "backgroundGradient").name("Bg Gradient?").onChange(refresh)
  gui
    .add(obj, "backgroundSaturation")
    .min(0)
    .max(100)
    .step(1)
    .name("Bg Saturation")
    .onChange(refresh)
  gui.addColor(obj, "fontColor").name("Font Color").onFinishChange(refresh)
  gui.addColor(obj, "fontColor2").name("Font Color2").onFinishChange(refresh)

  gui
    .add(obj, "fontSizeFactor")
    .min(0)
    .max(10)
    .step(1)
    .name("Font Size Factor")
    .onChange(refresh)
  gui
    .add(obj, "pixelSizeFactor")
    .min(10)
    .max(200)
    .step(1)
    .name("Resolution")
    .onChange(refresh)
  gui
    .add(obj, "threshold")
    .min(0)
    .max(95)
    .step(1)
    .name("Threshold")
    .onChange(refresh)
  gui.add(obj, "invert").name("Invert?").onChange(refresh)
  gui
    .add(obj, "randomness")
    .min(0)
    .max(100)
    .step(1)
    .name("Randomness")
    .onChange(refresh)

  gui
    .add(obj, "animationType", ["Random Text", "User Text"])
    .name("Text Type")
    .onChange(refresh)
  gui.add(obj, "textInput").onFinishChange(refresh)

  obj["pausePlay"] = function () {
    togglePausePlay()
  }
  gui.add(obj, "pausePlay").name("Pause/Play")

  obj["saveImage"] = function () {
    saveImage()
  }
  gui.add(obj, "saveImage").name("Image Export")

  obj["saveVideo"] = function () {
    toggleVideoRecord()
  }
  gui.add(obj, "saveVideo").name("Start/Stop Video Export")

  let customContainer = document.getElementById("gui")
  customContainer.appendChild(gui.domElement)

  var guiCloseButton = document.getElementsByClassName("close-button")
  console.log(guiCloseButton.length)
  guiCloseButton[0].addEventListener("click", updateGUIState)

  var useWebcamButton = document.getElementById("useWebcamButton")
  useWebcamButton.addEventListener("click", function () {
    types.video = "Webcam"
    changeVideoType()
  })
}

function selectVideo() {
  types.video = "Select Video"
  fileInput.click()
}

function updateGUIState() {
  if (guiOpenToggle) {
    guiOpenToggle = false
  } else {
    guiOpenToggle = true
  }
}

function saveImage() {
  const link = document.createElement("a")
  link.href = canvas.toDataURL()

  const date = new Date()
  const filename = `ASCII_${date.toLocaleDateString()}_${date.toLocaleTimeString()}.png`
  link.download = filename
  link.click()
}

function toggleGUI() {
  if (guiOpenToggle == false) {
    gui.open()
    guiOpenToggle = true
  } else {
    gui.close()
    guiOpenToggle = false
  }
}

export { initGUI }
