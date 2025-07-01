var mediaRecorder
var recordedChunks
var finishedBlob
var recordingMessageDiv = document.getElementById("videoRecordingMessageDiv")
var recordVideoState = false
var videoRecordInterval
var videoEncoder
var muxer
var mobileRecorder
var videofps = 12
var frameNumber = 0

const record = {
  state: false,
}

export { record }
