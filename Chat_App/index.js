const app = require("express")();
const server = require("http").createServer(app);
const cors = require("cors");
const { Socket } = require("dgram");

const io = require("socket.io")(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
app.use(cors());

const PORT = process.env.PORT || 5000;

app.get("/", (req, res)=>{
    res.send('VideoChat Server is Running.');
});

io.on('connection',(socket) => {
    socket.emit("me", socket.id);

    socket.on('disconnect', () =>{
        socket.broadcast.emit('Call Ended');
    });
    socket.on('CallUser' , ({usertocall, signalData , from ,name}) =>{
        io.to(usertocall).emit('CallUser', { signal: signalData, from ,name});

    });
    socket.on('answecall', () =>{
        io.to(data.to).emit('callaccepted' , data.signal);
    });
});

server.listen(PORT,()=>console.log('Server listening on port ${PORT}'));