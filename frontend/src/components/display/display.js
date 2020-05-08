import React from 'react'

import Profile from './profile/profile'
import Community from './community/community'
import Search from './search/search'

export default class Display extends React.Component{
    constructor(props) {
        super(props);
    
        this.state = {
        }
    }

    render() {
        const style = {
            height: '100%',
            width: 'calc(100% - 580px)',
            position: 'fixed',
            zIndex: 1,
            top: 0,
            left: 0,
            marginLeft: 580,
            padding: this.props.mode !== 'community' ? '40px 50px' : ''
        }

        const styleMobile = {
            padding: this.props.mode !== 'community' ? '40px 50px' : '',
            position: 'fixed'
        }
        
        return (
            this.props.mobile ? 
            <div style={styleMobile}>
                {this.props.mode === 'profile' && <Profile selected={this.props.selected} mobile={true}/>}
                {this.props.mode === 'community' && <Community selected={this.props.selected} mobile={true}/>}
                {this.props.mode === 'search' && <Search selected={this.props.selected} mobile={true}/>}
            </div>
            :
            <div style={style}>
                {this.props.mode === 'profile' && <Profile selected={this.props.selected} mobile={false}/>}
                {this.props.mode === 'community' && <Community selected={this.props.selected} mobile={false}/>}
                {this.props.mode === 'search' && <Search selected={this.props.selected} mobile={false}/>}
            </div>
        )
    }
}