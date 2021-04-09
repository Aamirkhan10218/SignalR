"use strict";


/*Camera Cdoe*/

document.getElementById("startCamera").addEventListener("click", async function (event) {

    var stream = await navigator.mediaDevices.getUserMedia({ video: true });
    if (stream && stream.getVideoTracks().length > 0) {
        var videoTrack = stream.getVideoTracks()[0];
        document.getElementById("localVideo").srcObject = new MediaStream([videoTrack]);
    }
    event.preventDefault();

});
document.getElementById("stopCamera").addEventListener("click", async function (event) {


    document.getElementById("localVideo").srcObject = null;

    event.preventDefault();

});

//Hub Connection

var connection = new signalR.HubConnectionBuilder().withUrl("/videoCallingHub").build();
//Start Connection
connection.start().catch(function (err) {
    return console.error(err.toString());

});


connection.on("ReceiveMessage", function (message) {
    var msg = message.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt");
    var plainMsg = JSON.parse(msg);
    if (plainMsg.offer) {
        var rtcConnection = new RTCPeerConnection(null);
        rtcConnection.setRemoteDescription(new RTCSessionDescription(plainMsg.offer));
        var answer = rtcConnection.createAnswer();
        rtcConnection.setLocalDescription(answer);
        connection.invoke("SendMessage", JSON.stringify({ 'answer': answer }));
    }
    else if (plainMsg.answer) {
        rtcConnection.setRemoteDescription(new RTCSessionDescription(plainMsg.answer));
    }
    var div = document.createElement("div");
    div.innerHTML = msg + "<hr/>";
    document.getElementById("messages").appendChild(div);

});


document.getElementById("sendButton").addEventListener("click", function (event) {
    var message = document.getElementById("message").value;

    connection.invoke("SendMessage", message).catch(function (err) {

        return console.error(err.toString());
    });

    event.preventDefault();

});


//WebRTC Signalling Code

document.getElementById("startConnection").addEventListener("click", async function (event) {
    var rtcConnection = new RTCPeerConnection(null);
    var offer = rtcConnection.createOffer();
    rtcConnection.setLocalDescription(offer)
    //send this offer to hub
    rtcConnection.invoke("SendMessage", JSON.stringify({ 'offer': rtcConnection.localDescription }));

});
