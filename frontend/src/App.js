import React from 'react';
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter as Router, Route, Switch} from "react-router-dom";
import socketIOClient from "socket.io-client";

import Login from "./components/login"
import Home from "./components/home"
import AuthGuard from './components/authguard'

window.API_URL = 'http://mbp:3000';
// window.SOCKET_URL = 'http://mbp:4001';
window.SOCKET = socketIOClient('http://mbp:4001')

function App() {
  return (
    <Router>
        <Switch>
          <Route path="/login" component={Login} />
          <AuthGuard path="/" component={Home} />
        </Switch>
    </Router>
  );
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