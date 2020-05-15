import React, { Component } from 'react';

import Sidebar from './sidebar/sidebar'
import List from './list/list'
import AdminList from './admin/list'

export default class Home extends Component {
    constructor(props) {
        super(props);
    
        this.state = {
            mode: '',
            search: '',
            mobile: false,
            adminMode: false
        }
    }

    componentDidMount() {
        this.setState({
            // Change selected mode on load
            mode: JSON.parse(localStorage.getItem('client')).mode,
            // Change admin mode on load
            adminMode: JSON.parse(localStorage.getItem('admin'))
        })
        // Detect mobile phone screen
        window.addEventListener("resize", this.isMobile.bind(this));
        this.isMobile();
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.isMobile)
    }

    isMobile() {
        const screen = (window.innerWidth <= 800);
        if (this.state.mobile !== screen) {
            this.setState({mobile: screen});
        }
    }

    // Change list when clicking sidebar
    modeCallback = (childData) => {
        if (this.state.mode !== childData) {
            this.setState({
                mode: childData,
                search: ''
            })
            // Save selected mode and reset index to 1
            const client = {
                "mode": childData,
                "index": 1
            }
            localStorage.setItem("client", JSON.stringify(client))
        }
    }

    searchCallback = (childData) => {
        this.setState({
            search: childData
        })
    }

    adminCallback = (childData) => {
        this.setState(prevState => ({
            adminMode: childData,
            mode: prevState.mode === 'search' ? 'profile' : prevState.mode
        }))
        const client = {
            "mode": this.state.mode === 'search' ? 'profile' : this.state.mode,
            "index": 1
        }
        localStorage.setItem("client", JSON.stringify(client))
        localStorage.setItem("admin", childData)
    }

    render() {
        return (
            <div>
                <Sidebar modeCallback={this.modeCallback} mobile={this.state.mobile} mode={this.state.mode} admin={this.props.admin} adminCallback={this.adminCallback} adminMode={this.state.adminMode}/>
                {this.state.adminMode ? <AdminList mode={this.state.mode}/> : <List mode={this.state.mode} search={this.state.search} searchCallback={this.searchCallback} mobile={this.state.mobile}/>}
            </div>
        )
    }
}