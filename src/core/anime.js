import { Tween, Easing } from "@tweenjs/tween.js"
import { obj } from "../const/variables"
import { userVideo, defaultVideo } from "../const/dom"
import { refresh } from "./render"
import { guiControllers } from "../utils/gui"

const targetEl = defaultVideo
let videoTime = 0
// let anime = null
let tween = null

targetEl.addEventListener("timeupdate", (e) => {
  videoTime = targetEl.currentTime
})

const test = {
  pixelSizeFactor: 10,
}

function animePixelSize() {
  targetEl.addEventListener(
    "play",
    () => {
      tween = new Tween(test)
        .to({ pixelSizeFactor: 201 }, obj.animeDuration)
        .easing(Easing.Linear.None)
        .onUpdate((object) => {
          test.pixelSizeFactor = Math.round(test.pixelSizeFactor)
          refresh(test.pixelSizeFactor)
          obj.pixelSizeFactor = test.pixelSizeFactor
          guiControllers.pixelSizeFactor.updateDisplay()
        })
        .start(targetEl.currentTime)
    },
    false,
  )

  targetEl.play()
}

function animePlay() {
  if (tween && targetEl.readyState === targetEl.HAVE_ENOUGH_DATA) {
    if (targetEl.currentTime === 0) test.pixelSizeFactor = 10
    tween.update(targetEl.currentTime)
  }
}

export { animePixelSize, animePlay }
