import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import TextField from "@material-ui/core/TextField";
import AssignmentIcon from "@material-ui/icons/Assignment";
import PhoneIcon from "@material-ui/icons/Phone";
import React, { useEffect, useRef, useState } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import Peer from "simple-peer";
import io from "socket.io-client";
import "./Home.css";

const socket = io.connect("https://ms-teams-clone-server.azurewebsites.net/");
function Home() {
  const [me, setMe] = useState("");
  const [stream, setStream] = useState();
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState("");
  const [callerSignal, setCallerSignal] = useState();
  const [callAccepted, setCallAccepted] = useState(false);
  const [idToCall, setIdToCall] = useState("");
  const [callEnded, setCallEnded] = useState(false);
  const [name, setName] = useState("");
  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setStream(stream);
        myVideo.current.srcObject = stream;
      });

    socket.on("me", (id) => {
      setMe(id);
    });

    socket.on("callUser", (data) => {
      setReceivingCall(true);
      setCaller(data.from);
      setName(data.name);
      setCallerSignal(data.signal);
    });
  }, []);

  const callUser = (id) => {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: stream,
    });
    peer.on("signal", (data) => {
      socket.emit("callUser", {
        userToCall: id,
        signalData: data,
        from: me,
        name: name,
      });
    });
    peer.on("stream", (stream) => {
      userVideo.current.srcObject = stream;
    });
    socket.on("callAccepted", (signal) => {
      setCallAccepted(true);
      peer.signal(signal);
    });

    connectionRef.current = peer;
  };

  const answerCall = () => {
    setCallAccepted(true);
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: stream,
    });
    peer.on("signal", (data) => {
      socket.emit("answerCall", { signal: data, to: caller });
    });
    peer.on("stream", (stream) => {
      userVideo.current.srcObject = stream;
    });

    peer.signal(callerSignal);
    connectionRef.current = peer;
  };

  const leaveCall = () => {
    setCallEnded(true);
    connectionRef.current.destroy();
  };

  return (
    <>
      <h1
        style={{
          textAlign: "center",
          color: "#fff",
          margin: "50px auto 60px auto",
        }}
      >
        <i>Start video calling with your friends and family!</i>
      </h1>
      <div className="container">
        <div className="video-container">
          <div className="video" style={{}}>
            {stream && (
              <video
                playsInline
                muted
                ref={myVideo}
                autoPlay
                style={{ width: "400px" }}
              />
            )}
          </div>
          <div className="video">
            {callAccepted && !callEnded ? (
              <video
                playsInline
                ref={userVideo}
                autoPlay
                style={{ width: "400px" }}
              />
            ) : null}
          </div>
        </div>
        <div style={{ height:"50px", transform: `translate(${0}px, ${-200}px)`,zIndex:"1" }}>
          {receivingCall && !callAccepted ? (
            <div className="caller">
              {name ? (
                <h1>
                 {name} is calling...
                </h1>
              ) : (
                <h1>
                  Someone is calling...
                </h1>
              )}

              <Button variant="contained" color="primary" style={{marginLeft:"50px", height:"50px", marginTop:"15px"}} onClick={answerCall}>
                Answer
              </Button>
            </div>
          ) : null}
        </div>

        <div className="myId">
          <TextField
            id="filled-basic"
            label="Name"
            variant="filled"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ margin: "20px" }}
          />
          <CopyToClipboard text={me} style={{ margin: "20px" }}>
            <Button
              variant="contained"
              color="primary"
              style={{ margin: "20px" }}
              startIcon={<AssignmentIcon fontSize="large" />}
            >
              Share ID
            </Button>
          </CopyToClipboard>
          <TextField
            id="filled-basic"
            label="ID to call"
            variant="filled"
            value={idToCall}
            style={{ margin: "20px" }}
            onChange={(e) => setIdToCall(e.target.value)}
          />
          <div className="call-button">
            {callAccepted && !callEnded ? (
              <Button
                variant="contained"
                color="secondary"
                style={{ width: "93%", height: "56px", margin: "20px" }}
                onClick={leaveCall}
              >
                End Call
              </Button>
            ) : (
              <IconButton
                color="primary"
                aria-label="call"
                style={{ margin: "20px" }}
                onClick={() => callUser(idToCall)}
              >
                <PhoneIcon fontSize="large" />
              </IconButton>
            )}
            {idToCall}
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;

// export default function Home() {
//   return (
//     <div>
//       <VideocamIcon fontSize="large" className="videoIcon" />
//       <MicIcon fontSize="large" className="videoIcon" />
//       <Button
//         variant="contained"
//         color="primary"
//         className="button"
//         onClick={() => {
//           axios
//             .get("http://localhost:5000")
//             .then(function (response) {
//               // handle success
//               console.log(response);
//             })
//             .catch(function (error) {
//               // handle error
//               console.log(error);
//             });
//         }}
//       >
//         Join
//       </Button>
//     </div>
//   );
// }
