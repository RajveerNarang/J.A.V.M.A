import React , { createContext, useState, useRef, useEffect} from 'react';
import { io } from "socket.io-client";
import Peer from "simple-peer";


const SocketContext = createContext();

const socket  = io('http://localhost:5000');

const ContextProvider = ({children}) => {

    const [stream, setstream] = useState(null);
    const [me, setMe] = useState('');
    const [call, setCall] = useState({});
    const [callAccepted, setCallAccepted] = useState(false);
    const [callEnded, setCallEnded] = useState(false);
    const [name, setName] = useState('');
    
    
    const myVideo = useRef();
    const userVideo = useRef();
    const connectionRef = useRef();

        useEffect(() => {
        navigator.mediaDevices.getUserMedia({video : true , audio : true })
        .then((currentstream) => {
            setstream(currentstream);

            myVideo.current.srcObject = currentstream;

        });
        socket.on('me' , (id) => setImmediate(id));

        socket.on('callUser', ({ from , name:CallerName , signal}) => {

            setCall({ isRecievedCall: true, from , name:CallerName ,signal})

        });
    }, []);

    const answerCall = () => {
        setCallAccepted(true)

        const peer  =new Peer({initiator : false , trickle: false, stream });
        peer.on('signal', (data) => {
            socket.emit('answercall', {signal : data , to : call.from});
        });

        peer.on('stream', (currentstream) => {
            userVideo.current.srcObject = currentstream;

        });
        peer.signal(call.signal);

        connectionRef.current = peer;


    }

    const callUser = (id) => {
        const peer  =new Peer({initiator : true , trickle: false, stream });

        peer.on('signal', (data) => {
            socket.emit('callUser', {userTocall: id, signalData: data, from: me , name });
        });

        peer.on('stream', (currentstream) => {
            userVideo.current.srcObject = currentstream;

        });

        socket.on('callaccepted' , (signal) => {
            setCallAccepted(true);

            peer.signal(signal);
        });

        connectionRef.current = peer;

    }

    const leaveCall = () => {
        setCallEnded(true);
        connectionRef.current.destroy();

        window.location.reload();

    }

    return (
        <SocketContext.Provider value ={{ call,callAccepted,myVideo,userVideo,stream,name,setName,callEnded,me,callUser,leaveCall,answerCall,setMe,setstream}}>
            {children}
        </SocketContext.Provider>
    );
} 

export {ContextProvider, SocketContext };