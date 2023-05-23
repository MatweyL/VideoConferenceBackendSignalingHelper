var myVideo;

document.addEventListener("DOMContentLoaded", (event) => {
    myVideo = document.getElementById("local_vid");
    myVideo.onloadeddata = () => { console.log("W,H: ", myVideo.videoWidth, ", ", myVideo.videoHeight); };

     var videoButton = document.getElementById("VIDEO_BUTTON");
     var audioButton = document.getElementById("AUDIO_BUTTON");
     var finishButton = document.getElementById("CONFERENCE_FINISH_BUTTON");

    // muteBttn.addEventListener("click", (event)=>{
    //     audioMuted = !audioMuted;
    //     setAudioMuteState(audioMuted);        
    // });    
    // muteVidBttn.addEventListener("click", (event)=>{
    //     videoMuted = !videoMuted;
    //     setVideoMuteState(videoMuted);        
    // });    
    // callEndBttn.addEventListener("click", (event)=>{
    //     window.location.replace("/");
    // });

    // document.getElementById("room_link").innerHTML=`or the link: <span class="heading-mark">${window.location.href}</span>`;

});

function makeVideoElementCustom(element_id, display_name) {
    let vid = document.createElement("video");
    let vidWrapper = document.createElement("div");
    vidWrapper.className = "video-wrapper";
    let vidUsername = document.createElement("div");
    vidUsername.innerText = display_name;
    vidUsername.className = "video-username";
    vidWrapper.id = "vid_" + element_id;
    vid.className = "video";
    vid.autoplay = true;
    vidWrapper.appendChild(vidUsername);
    vidWrapper.appendChild(vid);
    return vidWrapper;
}

function addVideoElement(element_id, display_name) {
    document.getElementById("video_grid").appendChild(makeVideoElementCustom(element_id, display_name));
    addUserToParticipants(element_id, display_name);
}
function removeVideoElement(element_id) {
    let videoWrapper = getVideoWrapper(element_id);
    let v = videoWrapper.children[1];
    if (v.srcObject) {
        v.srcObject.getTracks().forEach(track => track.stop());
    }
    v.removeAttribute("srcObject");
    v.removeAttribute("src");

    document.getElementById("vid_" + element_id).remove();
    removeUserToParticipants(element_id);
}

function getVideoWrapper(element_id) {
    return document.getElementById("vid_" + element_id);
}

function getVideoObj(element_id) {
    let videoWrapper = getVideoWrapper(element_id);
    return videoWrapper.children[1];
}

function setAudioMuteState(flag) {
    let local_stream = myVideo.srcObject;
    local_stream.getAudioTracks().forEach((track) => { track.enabled = !flag; });
}

function setVideoMuteState(flag) {
    let local_stream = myVideo.srcObject;
    local_stream.getVideoTracks().forEach((track) => { track.enabled = !flag; });
}


function addUserToParticipants(element_id, display_name) {
    let participantContainer = document.createElement("div");
    participantContainer.id = "participant_" + element_id;
    participantContainer.className = "d-flex justify-content-between p-3";
    let participantName = document.createElement("span")
    participantName.innerText = display_name;
    participantName.className = "text-white mt-1";
    participantContainer.appendChild(participantName);
    document.getElementById("participants").appendChild(participantContainer);
}

function removeUserToParticipants(element_id) {
    let participantContainer = document.getElementById("participant_" + element_id);
    participantContainer.remove();
}