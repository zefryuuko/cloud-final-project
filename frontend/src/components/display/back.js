import React from 'react'

export default function Back(args){
    const back = () => {
        args.callback();
    }

    const navStyle = {
        height: 50,
        backdropFilter: 'blur(10px)',
        filter: 'drop-shadow(0 0 1rem black)',
        animation: 'fadein 0.4s',
        boxShadow: '0 1rem 1rem 0 rgba(0, 0, 0, 0.404)',
        position: 'fixed',
        width: '100%',
        zIndex: 2
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

    return <nav className="navbar text-center" style={navStyle}>
      <span className="navbar-brand mb-0 h1" style={titleStyle}>{args.name}</span>
      <button style={buttonStyle} onClick={back}>&#x276E;</button>
  </nav>
}