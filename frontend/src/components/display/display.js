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
            width: this.props.hide ? 'calc(100% - 80px)' : 'calc(100% - 580px)',
            position: 'fixed',
            top: 0,
            left: 0,
            marginLeft: this.props.hide ? 80 : 580,
            transition: 'all 0.4s ease',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
        }

        const styleMobile = {
            height: 'calc(100% - 60px)',
            animation: 'fadein 0.4s'
        }
        
        return (
            this.props.mobile ? 
            <div style={styleMobile}>
                {this.props.mode === 'profile' && <Profile selected={this.props.selected} mobile={true}/>}
                {this.props.mode === 'community' && <Community selected={this.props.selected} mobile={true} community={this.props.community}/>}
                {this.props.mode === 'search' && <Search selected={this.props.selected} mobile={true}/>}
            </div>
            :
            <div style={style}>
                {this.props.mode === 'profile' && <Profile selected={this.props.selected} mobile={false}/>}
                {this.props.mode === 'community' && <Community selected={this.props.selected} mobile={false} community={this.props.community} hide={this.props.hide}/>}
                {this.props.mode === 'search' && <Search selected={this.props.selected} mobile={false} searchResult={this.props.searchResult}/>}
            </div>
        )
    }
}