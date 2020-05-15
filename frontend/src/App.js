import React from 'react';
import "bootstrap/dist/css/bootstrap.min.css";
import socketIOClient from "socket.io-client";

import AuthGuard from './components/authguard'

window.API_URL = 'http://mbp:3000';
// window.SOCKET_URL = 'http://mbp:4001';
window.SOCKET = socketIOClient('http://mbp:4001')

function App() {
  return <AuthGuard />
}

export default App;

/*
Login -> Home:
          - Sidebar ^mode
          - List vmode ^search vsearch
            - Sublist ^selected
            - Display vselected
              - Profile/Search ^community vcommunity
*/