const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const port = process.env.PORT || 4001;
const index = require("./routes/index");

const app = express();
app.use(index);

const server = http.createServer(app);

const io = socketIo(server);

const axios = require('axios');
const API_URL = 'http://mbp:3000'

let interval;

io.on("connection", (socket) => {
  // if (interval) {
  //   clearInterval(interval);
  // }
  console.log("New client connected");
  
  // interval = setInterval(() => fetchChat(c._id), 1000);

  socket.on('chat', data => {
    // console.log(socket.rooms)
    axios.post(API_URL+'/chat', data)
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
    io.to(data._id).emit('typing', isTyping, data.user)
  });

  socket.on('update', data => {
    for (let i = 0; i < data.communities.length; i++) {
      io.to(data.communities[i]).emit('update', data)
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
    // clearInterval(interval);
  });
});

server.listen(port, () => console.log(`Listening on port ${port}`));