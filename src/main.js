import { imagePaths, imageCache, loadAndCacheImages } from "./core/bitmap"
import { refresh } from "./core/render"
import { initGUI } from "./utils/gui"
import { startDefaultVideo } from "./core/media"

//MAIN METHOD
initGUI()

loadAndCacheImages(imagePaths).then(() => {
  refresh()
  startDefaultVideo()
  //   drawAllImages(ctx)
})
