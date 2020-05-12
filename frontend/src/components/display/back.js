import React from 'react'

export default function Back(args){
    const back = () => {
        args.callback();
    }

    const navStyle = {
        backgroundColor: 'rgb(40, 40, 40)',
        height: 60
    }
    
    const buttonStyle = {
        backgroundColor: 'Transparent',
        border: 'none',
        overflow: 'hidden',
        outline: 'none',
        color: 'white',
        fontSize: 24,
        zIndex: 1,
        position: 'fixed'
    }

    const titleStyle = {
        color: 'white',
        position: 'absolute',
        width: '100%',
        left: 0,
        textAlign: 'center'
    }

    return <nav class="navbar text-center" style={navStyle}>
      <span class="navbar-brand mb-0 h1" style={titleStyle}>{args.name}</span>
      <button style={buttonStyle} onClick={back}>&#x276E;</button>
  </nav>
}