import { Muxer, ArrayBufferTarget } from "mp4-muxer"
import { isFirefox, isIOS, isAndroid } from "../utils/broswer"

var mediaRecorder
var recordedChunks
var finishedBlob
var recordingMessageDiv = document.getElementById("videoRecordingMessageDiv")
var recordVideoState = false
var videoRecordInterval
var muxer
var mobileRecorder

const record = {
  state: false,
  videoEncoder: null,
  frameNumber: 0,
  videofps: 12,
}

function toggleVideoRecord() {
  userVideo.currentTime = 0
  defaultVideo.currentTime = 0

  setTimeout(function () {
    if (record.state == false) {
      record.state = true
      chooseRecordingFunction()
    } else {
      record.state = false
      chooseEndRecordingFunction()
    }
  }, 250)
}

function chooseRecordingFunction() {
  if (isIOS || isAndroid || isFirefox) {
    startMobileRecording()
  } else {
    recordVideoMuxer()
  }
}

function chooseEndRecordingFunction() {
  if (isIOS || isAndroid || isFirefox) {
    mobileRecorder.stop()
  } else {
    finalizeVideo()
  }
}

//record html canvas element and export as mp4 video
//source: https://devtails.xyz/adam/how-to-save-html-canvas-to-mp4-using-web-codecs-api
async function recordVideoMuxer() {
  console.log("start muxer video recording")
  var videoWidth = Math.floor(canvas.width / 2) * 2
  var videoHeight = Math.floor(canvas.height / 8) * 8 //force a number which is divisible by 8
  console.log("Video dimensions: " + videoWidth + ", " + videoHeight)

  record.frameNumber = 0

  //display user message
  //recordingMessageCountdown(videoDuration);
  recordingMessageDiv.classList.remove("hidden")

  record.state = true
  const ctx = canvas.getContext("2d", {
    // This forces the use of a software (instead of hardware accelerated) 2D canvas
    // This isn't necessary, but produces quicker results
    willReadFrequently: true,
    // Desynchronizes the canvas paint cycle from the event loop
    // Should be less necessary with OffscreenCanvas, but with a real canvas you will want this
    desynchronized: true,
  })

  muxer = new Muxer({
    target: new ArrayBufferTarget(),
    //let muxer = new Muxer({
    //target: new ArrayBufferTarget(),
    video: {
      // If you change this, make sure to change the VideoEncoder codec as well
      codec: "avc",
      width: videoWidth,
      height: videoHeight,
    },

    firstTimestampBehavior: "offset",

    // mp4-muxer docs claim you should always use this with ArrayBufferTarget
    fastStart: "in-memory",
  })

  record.videoEncoder = new VideoEncoder({
    output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
    error: (e) => console.error(e),
  })

  // This codec should work in most browsers
  // See https://dmnsgn.github.io/media-codecs for list of codecs and see if your browser supports
  record.videoEncoder.configure({
    codec: "avc1.42003e",
    // codec: "vp09.02.62.10",
    width: videoWidth,
    height: videoHeight,
    bitrate: 14_000_000,
    bitrateMode: "constant",
    framerate: 60,
  })
  //NEW codec: "avc1.42003e",
  //ORIGINAL codec: "avc1.42001f",

  /*
    var frameNumber = 0;
    //setTimeout(finalizeVideo,1000*videoDuration+200); //finish and export video after x seconds
    */

  /*
    //take a snapshot of the canvas every x miliseconds and encode to video
    videoRecordInterval = setInterval(
        function(){
            if(record.state == true){
                renderCanvasToVideoFrameAndEncode({
                    canvas,
                    videoEncoder,
                    frameNumber,
                    videofps
                })
                frameNumber++;
            }else{
            }
        } , 1000/videofps);
    */
}

//finish and export video
async function finalizeVideo() {
  console.log("finalize muxer video")
  clearInterval(videoRecordInterval)
  record.state = false
  // Forces all pending encodes to complete
  await record.videoEncoder.flush()
  muxer.finalize()
  let buffer = muxer.target.buffer
  finishedBlob = new Blob([buffer])
  downloadBlob(new Blob([buffer]))

  //hide user message
  recordingMessageDiv.classList.add("hidden")
}

async function renderCanvasToVideoFrameAndEncode({
  canvas,
  videoEncoder,
  frameNumber,
  videofps,
}) {
  let frame = new VideoFrame(canvas, {
    // Equally spaces frames out depending on frames per second
    timestamp: (frameNumber * 1e6) / videofps,
  })

  // The encode() method of the VideoEncoder interface asynchronously encodes a VideoFrame
  videoEncoder.encode(frame)

  // The close() method of the VideoFrame interface clears all states and releases the reference to the media resource.
  frame.close()
}

function downloadBlob() {
  console.log("download video")
  let url = window.URL.createObjectURL(finishedBlob)
  let a = document.createElement("a")
  a.style.display = "none"
  a.href = url
  const date = new Date()
  const filename = `BRAT_${date.toLocaleDateString()}_${date.toLocaleTimeString()}.mp4`
  a.download = filename
  document.body.appendChild(a)
  a.click()
  window.URL.revokeObjectURL(url)
}

//record and download videos on mobile devices
function startMobileRecording() {
  var stream = canvas.captureStream(record.videofps)
  mobileRecorder = new MediaRecorder(stream, { type: "video/mp4" })
  mobileRecorder.addEventListener("dataavailable", finalizeMobileVideo)

  console.log("start simple video recording")
  console.log("Video dimensions: " + canvas.width + ", " + canvas.height)

  //display user message
  //recordingMessageCountdown(videoDuration);
  recordingMessageDiv.classList.remove("hidden")

  record.state = true
  mobileRecorder.start() //start mobile video recording

  /*
    setTimeout(function() {
        recorder.stop();
    }, 1000*videoDuration+200);
    */
}

function finalizeMobileVideo(e) {
  setTimeout(function () {
    console.log("finish simple video recording")
    record.state = false
    /*
    mobileRecorder.stop();*/
    var videoData = [e.data]
    finishedBlob = new Blob(videoData, { type: "video/mp4" })
    downloadBlob(finishedBlob)

    //hide user message
    recordingMessageDiv.classList.add("hidden")
  }, 500)
}

export { record, toggleVideoRecord, renderCanvasToVideoFrameAndEncode }
