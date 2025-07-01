//detect user browser
const ua = navigator.userAgent
const isSafari = ua.includes("Safari")
const isFirefox = ua.includes("Firefox")
const isIOS =
  ua.includes("iPhone") || ua.includes("iPad") || ua.includes("iPod")
const isAndroid = ua.includes("Android")

export { ua, isSafari, isFirefox, isIOS, isAndroid }
