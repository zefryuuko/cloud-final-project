const express = require("express");
const cors = require('cors');
const http = require("http");
const socketIo = require("socket.io");

require('dotenv').config()

// const port = process.env.PORT || 8080;
const port = 8080;
const index = require("./src/routes/index");

const app = express();
app.use(index);
app.use(cors());

const server = http.createServer(app);

const io = socketIo(server);

const axios = require('axios');
const CHAT_URL = process.env.CHAT_URL

// let interval;
let typingUsers = {}
let onlineUsers = {}

io.on("connection", (socket) => {
  // if (interval) {
  //   clearInterval(interval);
  // }
  console.log("New client connected");
  
  // interval = setInterval(() => fetchChat(c._id), 1000);

  socket.on('login', data => {
    const community = onlineUsers[data._id]
    if (community !== undefined) community[socket.id] = data.user
    else {
      onlineUsers[data._id] = {}
      onlineUsers[data._id][socket.id] = data.user
    }
  })

  socket.on('chat', data => {
    // console.log(socket.rooms)
    axios.post(CHAT_URL+'/chat', data)
    // .then(res => {
    //   if (res) {
        io.to(data._id).emit('chat', data)
        io.to(data._id).emit('list', data)
    //   }
    // })
  })

  socket.on('join', community => {
    socket.join(community);
  });

  socket.on('leave', community => {
    socket.leave(community);
  });

  socket.on('typing', (isTyping, data) => {
    const community = typingUsers[data._id]
    if (isTyping) {
      if (community !== undefined) community.push(data.user)
      else typingUsers[data._id] = [data.user]
    }
    else {
      if (community !== undefined) {
        const index = community.indexOf(data.user)
        if (index !== -1)
        community.splice(index, 1)
      }
    }
    io.emit('typing_'+data._id, isTyping, data.user)
  });

  socket.on('retrieve', id => {
    const communityTypingUsers = typingUsers[id]
    // const communityOnlineUsers = Object.values(onlineUsers[id])

    // console.log(id)
    // console.log(typingUsers)
    // console.log(communityTypingUsers)
    
    if (communityTypingUsers !== undefined)
    socket.emit('retrieve', communityTypingUsers)
  })

  socket.on('update', data => {
    for (let i = 0; i < data.communities.length; i++) {
      io.to(data.communities[i]).emit('update', data)
    }
  });

  socket.on('audio', data => {
    io.emit('audio_'+data._id, data)
  });

  socket.on('video', data => {
    io.emit('video_'+data._id, data)
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
    // clearInterval(interval);
    // delete onlineUsers[][socket.id]
  });
});

server.listen(port, "0.0.0.0", () => console.log(`Listening on port ${port}`));