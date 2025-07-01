import { obj, webcam, dVideo, cvs, types } from "./const/variables"
import {
  webcamVideo,
  userVideo,
  defaultVideo,
  canvas,
  ctx,
  canvasRaw,
  ctx2,
  canvasPixel,
  ctx3,
} from "./const/dom"

import { render, renderText, refresh, loop } from "./core/render"

import { ua, isSafari, isFirefox, isIOS, isAndroid } from "./utils/broswer"

import { initGUI } from "./utils/gui"

import { startDefaultVideo } from "./core/media"

/*
To do:
Allow toggle for different monospace fonts (Japanese, bolder font, etc.)
Allow image upload, with function to determine based on the file extension and handle accordingly
When image is uploaded, use a new function that accepts the image and then runs scanLines algo on it -- as pseudo video feed
Investigate frame rate unsynced issue when video recording -- video export can have dropped frames / uneven time / low quality
Allow custom char set during Random Text mode (so that you can try with only a few chars)
Add button that exports the relevant chars / line breaks into a textfield, for a specific frame
*/

canvas.width = cvs.width
canvas.height = cvs.height

//MAIN METHOD
initGUI()
refresh()
startDefaultVideo()
