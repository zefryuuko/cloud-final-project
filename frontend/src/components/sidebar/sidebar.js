import React from 'react'
import './styles.css'

export default class Sidebar extends React.Component{

    changeMode(mode) {
        this.props.modeCallback(mode);
        if (mode === 'community' && this.props.mode === mode) {
            if (this.props.hide) this.props.hideCallback(false)
            else this.props.hideCallback(true)
        }
        if (!this.props.mobile) {
            document.getElementsByClassName('speech-bubble')[0].style.display = 'none'
            document.getElementsByClassName('speech-bubble')[0].style.opacity = 0
            document.getElementsByClassName('speech-bubble')[0].style.left = '110px'
        }
    }

    changeAdminMode() {
        if (this.props.truestAdminMode === undefined) {
            if (this.props.adminMode) this.props.adminCallback(false);
            else this.props.adminCallback(true);
        }
    }

    render() {
        return (
            this.props.mobile ? 
            <div>
                <nav className='sidebarMobile'>
                    <div className={this.props.mode === 'profile' ? 'iconMobile iconSelectedMobile' : 'iconMobile'}>
                        <a href='#' title='Profile' onClick={() => this.changeMode('profile')}><img src={require('./contacts-64.png')}/></a>
                    </div>
                    <div className={this.props.mode === 'community' ? 'iconMobile iconSelectedMobile' : 'iconMobile'}>
                        <a href='#' title='Community' onClick={() => this.changeMode('community')}><img src={require('./conference-64.png')}/></a>
                    </div>
                    <div className={this.props.mode === 'search' ? 'iconMobile iconSelectedMobile' : 'iconMobile'}>
                        <a href='#' title='Search community' onClick={() => this.changeMode('search')}><img src={require('./search-13-64.png')}/></a>
                    </div>
                </nav>
            </div>
            :
            <div className='sidebar'>
                {this.props.admin && <a href='#' title='Admin' onClick={() => this.changeAdminMode()}><img src={!this.props.adminMode ? require('./crown-3-64.png') : require('./crown-3-64-2.png')} className='icon'/></a>}
                <a href='#' title='Profile' onClick={() => this.changeMode('profile')}><img src={require('./contacts-64.png')} className={this.props.mode === 'profile' ? 'iconSelected' : 'icon'}/></a>
                <a href='#' title='Community' onClick={() => this.changeMode('community')}><img src={require('./conference-64.png')} className={this.props.mode === 'community' ? 'iconSelected' : 'icon'} id='clickMe'/></a>
                <div className='speech-bubble'>Check out here!</div>
                {!this.props.adminMode && <a href='#' title='Search community' onClick={() => this.changeMode('search')}><img src={require('./search-13-64.png')} className={this.props.mode === 'search' ? 'iconSelected' : 'icon'}/></a>}
                {/* {!this.props.adminMode && <a href='#' title='Chat with chatbot' onClick={() => this.changeMode('chatbot')}><img src={require('./ai-64.png')} className={this.props.mode === 'chatbot' ? 'iconSelected' : 'icon'}/></a>} */}
                <footer style={{bottom: 50, position:"absolute"}}>
                    <a href='/'  title='Log out' onClick={() => localStorage.clear()}><img src={require('./logout-64.png')} className='icon'/></a>
                </footer>
            </div>
        )
    }
}