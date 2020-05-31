import React, { Component } from 'react';

import Sidebar from './sidebar/sidebar'
import AdminList from './admin/list'

export default class Home extends Component {
    constructor(props) {
        super(props);
    
        this.state = {
            mode: 'profile'
        }
    }
    
    modeCallback = (childData) => {
        if (this.state.mode !== childData) {
            this.setState({
                mode: childData
            })
        }
    }

    render() {
        return (
            <div>
                <Sidebar modeCallback={this.modeCallback} mode={this.state.mode} admin={true} adminCallback={this.adminCallback} adminMode={true} truestAdminMode={true}/>
                <AdminList mode={this.state.mode}/>
            </div>
        )
    }
}