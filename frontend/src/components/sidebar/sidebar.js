import React from 'react'

export default class Sidebar extends React.Component{

    changeMode(mode) {
        this.props.modeCallback(mode);
    }

    render() {
        const sidebarStyle = {
            height: '100%',
            width: 80,
            position: 'fixed',
            top: 0,
            left: 0,
            backgroundColor: 'rgb(40, 40, 40)',
            overflowX: 'hidden',
            // paddingTop: 60,
        }
    
        const iconStyle = {
            marginLeft: 18,
            marginTop: 50,
            width:'50%'
        }

        // code is taken and modified from: https://www.youtube.com/watch?v=uHL6aeWUEQQ
        const sidebarStyleMobile = {
            position: 'fixed',
            bottom: 0,
            width: '100%',
            height: 80,
            backgroundColor: 'rgb(40, 40, 40)',
            display: 'flex',
            overflowX: 'auto',
            paddingLeft: 15
        }

        const iconStyleMobile = {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            flexGrow: 1,
            minWidth: '50px',
            overflow: 'hidden',
            whiteSpace: 'nowrap'
        }
    
        return (
            this.props.mobile ? 
            <div>
                <nav style={sidebarStyleMobile}>
                    <div style={iconStyleMobile}>
                        <a href='#' title='Profile' onClick={() => this.changeMode('profile')} style={{filter: this.props.mode === 'profile' && 'brightness(2.0)'}}><img src={require('./contacts-64.png')} style={{width: '70%'}}/></a>
                    </div>
                    <div style={iconStyleMobile}>
                        <a href='#' title='Community' onClick={() => this.changeMode('community')} style={{filter: this.props.mode === 'community' && 'brightness(2.0)'}}><img src={require('./conference-64.png')} style={{width: '80%'}}/></a>
                    </div>
                    <div style={iconStyleMobile}>
                        <a href='#' title='Search community' onClick={() => this.changeMode('search')} style={{filter: this.props.mode === 'search' && 'brightness(2.0)'}}><img src={require('./search-13-64.png')} style={{width: '70%'}}/></a>
                    </div>
                </nav>
            </div>
            :
            <div style={sidebarStyle}>
                <a href='#' title='Profile' onClick={() => this.changeMode('profile')} style={{filter: this.props.mode === 'profile' && 'brightness(2.0)'}}><img src={require('./contacts-64.png')} style={iconStyle}/></a>
                <a href='#' title='Community' onClick={() => this.changeMode('community')} style={{filter: this.props.mode === 'community' && 'brightness(2.0)'}}><img src={require('./conference-64.png')} style={iconStyle}/></a>
                <a href='#' title='Search community' onClick={() => this.changeMode('search')} style={{filter: this.props.mode === 'search' && 'brightness(2.0)'}}><img src={require('./search-13-64.png')} style={iconStyle}/></a>
                <footer style={{bottom: 50, position:"absolute"}}>
                    <a href='/'  title='Log out' onClick={() => localStorage.clear()}><img src={require('./logout-64.png')} style={iconStyle}/></a>
                </footer>
            </div>
        )
    }
}