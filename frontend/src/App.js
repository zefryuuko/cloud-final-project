import React from 'react';
import "bootstrap/dist/css/bootstrap.min.css";

import AuthGuard from './components/authguard'

let vh = window.innerHeight * 0.01;
document.documentElement.style.setProperty('--vh', `${vh}px`);
let vw = window.innerWidth * 0.01;
document.documentElement.style.setProperty('--vw', `${vw}px`);

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