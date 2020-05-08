import React from 'react';
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter as Router, Route, Redirect, Switch } from "react-router-dom";

import Login from "./components/login"
import Home from "./components//home"

function App() {
  return (
    <Router>
      { localStorage.getItem('userSession') ? <Redirect push to="/"/> : <Redirect push to="/login"/> }
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/" component={Home} />
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