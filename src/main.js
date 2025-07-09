import { imagePaths, imageCache, loadAndCacheImages } from "./core/bitmap"
import { refresh } from "./core/render"
import { initGUI } from "./utils/gui"
import { startDefaultVideo } from "./core/media"

const font = new FontFace("brat", "url(/fonts/icomoon.woff?5kjft6)")

//MAIN METHOD
initGUI()

font.load().then(function (loadedFont) {
  document.fonts.add(loadedFont) // 注册字体
  // console.log(loadedFont)

  refresh()
  startDefaultVideo()
})

// loadAndCacheImages(imagePaths).then(() => {
//   refresh()
//   startDefaultVideo()
//   //   drawAllImages(ctx)
// })
