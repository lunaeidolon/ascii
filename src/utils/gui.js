import GUI from "lil-gui"

import { obj, types } from "../const/variables"
import { refresh } from "../core/render"
import { togglePausePlay } from "../core/media"
import { toggleVideoRecord } from "../core/record"

import { animePlay } from "../core/anime"
import ease from "./ease"

const gui = new GUI()
const guiControllers = { pixelSizeFactor: null }

const initGUI = () => {
  // gui.close()

  obj["selectVideo"] = function () {
    selectVideo()
  }
  gui.add(obj, "selectVideo").name("Upload Media")
  gui.add(obj, "ifBackground").name("Background").onFinishChange(refresh)
  gui
    .addColor(obj, "backgroundColor")
    .name("Background Color")
    .onFinishChange(refresh)
  gui
    .add(obj, "bratType", { Fill: "fill", Glitch: "glitch" })
    .name("Animation Type")

  gui
    .add(obj, "bratSize", {
      以视频尺寸为准: "video",
      以图形展示完整为准: "shape",
    })
    .name("展示尺寸")
    .onChange(refresh)
  gui.add(obj, "glitchRandom").min(1).max(100).step(1).name("Glitch Random")
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
  guiControllers.pixelSizeFactor = gui
    .add(obj, "pixelSizeFactor")
    .min(obj.minPixelSizeFactor)
    .max(201)
    .step(1)
    .name("Resolution")
    .onChange(refresh)

  // const autoAnime = gui.addFolder("Auto Anime")
  // autoAnime
  //   .add(obj, "animeDuration")
  //   .min(0)
  //   .max(10)
  //   .step(1)
  //   .name("Duration in ms")
  // autoAnime.add(obj, "animeEase", ease)
  // autoAnime.add(obj, "animeDuringRecord").name("Auto anime during record")
  // obj.autoAnimePlay = () => {
  //   animePlay()
  // }
  // autoAnime.add(obj, "autoAnimePlay").name("Test Anime Play")

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
}

function selectVideo() {
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

export { gui, guiControllers, initGUI }
