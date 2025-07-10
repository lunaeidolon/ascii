import GUI from "lil-gui"

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

const initGUI = () => {
  const gui = new GUI()
  // gui.close()

  obj["selectVideo"] = function () {
    selectVideo()
  }
  gui.add(obj, "selectVideo").name("Upload Media")

  obj["useWebcam"] = function () {
    types.video = "Webcam"
    changeVideoType()
  }
  // gui.add(obj, "useWebcam").name("Use Webcam")

  gui.add(obj, "ifBackground").name("Background").onFinishChange(refresh)

  gui
    .addColor(obj, "backgroundColor")
    .name("Background Color")
    .onFinishChange(refresh)
  // gui.add(obj, "backgroundGradient").name("Bg Gradient?").onChange(refresh)
  // gui
  //   .addColor(obj, "offset")
  //   .name("Offset")
  //   .onFinishChange(refresh)
  gui
    .add(obj, "bratType", { Fill: "fill", Glitch: "glitch" })
    .name("Animation Type")
  gui
    .add(obj, "offsetLength")
    .min(0)
    .max(6)
    .step(1)
    .name("Offset")
    .onChange(refresh)

  gui
    .add(obj, "opacity")
    .min(0)
    .max(100)
    .step(1)
    .name("Opacity")
    .onChange(refresh)
  // gui
  //   .add(obj, "backgroundSaturation")
  //   .min(0)
  //   .max(100)
  //   .step(1)
  //   .name("Bg Saturation")
  //   .onChange(refresh)
  // gui.addColor(obj, "fontColor").name("Font Color").onFinishChange(refresh)
  // gui.addColor(obj, "fontColor2").name("Font Color2").onFinishChange(refresh)

  // gui
  //   .add(obj, "fontSizeFactor")
  //   .min(0)
  //   .max(10)
  //   .step(1)
  //   .name("Font Size Factor")
  //   .onChange(refresh)
  gui
    .add(obj, "pixelSizeFactor")
    .min(10)
    .max(200)
    .step(1)
    .name("Resolution")
    .onChange(refresh)
  // gui
  //   .add(obj, "threshold")
  //   .min(0)
  //   .max(95)
  //   .step(1)
  //   .name("Threshold")
  //   .onChange(refresh)
  // gui.add(obj, "invert").name("Invert?").onChange(refresh)
  // gui
  //   .add(obj, "randomness")
  //   .min(0)
  //   .max(100)
  //   .step(1)
  //   .name("Randomness")
  //   .onChange(refresh)

  // gui
  //   .add(obj, "animationType", ["Random Text", "User Text"])
  //   .name("Text Type")
  //   .onChange(refresh)
  // gui.add(obj, "textInput").onFinishChange(refresh)

  obj["saveImage"] = function () {
    saveImage()
  }
  gui.add(obj, "saveImage").name("Export Image")

  obj["pausePlay"] = function () {
    togglePausePlay()
  }
  gui.add(obj, "pausePlay").name("Pause/Play Video")

  obj["saveVideo"] = function () {
    toggleVideoRecord()
  }
  gui.add(obj, "saveVideo").name("Start/Stop Video Export")

  let customContainer = document.getElementById("gui")
  customContainer.appendChild(gui.domElement)

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

function saveImage() {
  const link = document.createElement("a")
  link.href = canvas.toDataURL()

  const date = new Date()
  const filename = `BRAT_${date.toLocaleDateString()}_${date.toLocaleTimeString()}.png`
  link.download = filename
  link.click()
}

export { initGUI }
