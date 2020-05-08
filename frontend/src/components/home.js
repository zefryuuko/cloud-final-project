import React, { Component } from 'react';
import axios from 'axios';

import Sidebar from './sidebar/sidebar'
import List from './list/list'

export default class Home extends Component {
    constructor(props) {
        super(props);
    
        this.state = {
            mode: '',
            search: '',
            mobile: false
        }
    }

    componentDidMount() {
        // Validate API token
        const currentUser = localStorage.getItem("userSession")
        if (currentUser)
        axios.post(process.env.REACT_APP_API_URL+'/user/token', JSON.parse(currentUser))
        .then(res => {
            if (res.data === false) {
                localStorage.clear()
                window.location.reload()
            }
            else this.setState({
                // Change selected mode on load
                mode: localStorage.getItem('mode'),
            })
            // Cache user data received from API
            // localStorage.setItem("userCache", JSON.stringify(res.data))
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
            localStorage.setItem('mode', childData)
            localStorage.setItem('index', 1)
        }
    }

    searchCallback = (childData) => {
        this.setState({
            search: childData
        })
    }

    render() {
        return (
            <div>
                <List mode={this.state.mode} search={this.state.search} searchCallback={this.searchCallback} mobile={this.state.mobile}/>
                <Sidebar modeCallback={this.modeCallback} mobile={this.state.mobile}/>
            </div>
        )
    }
}