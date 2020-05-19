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
            adminMode: false,
            hide: false
        }
    }

    componentDidMount() {
        this.setState({
            // Change selected mode on load
            mode: JSON.parse(localStorage.getItem('client')).mode,
            // Change admin mode on load
            adminMode: JSON.parse(localStorage.getItem('admin')),
            // Change hide mode on load
            hide: JSON.parse(localStorage.getItem('client')).hide
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
                search: '',
                hide: false
            })
            // Save selected mode and reset index to 1
            const client = {
                "mode": childData,
                "index": 1,
                'hide': false
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
            mode: prevState.mode === 'search' ? 'profile' : prevState.mode,
            hide: false
        }))
        const client = {
            "mode": this.state.mode === 'search' ? 'profile' : this.state.mode,
            "index": 1,
            'hide': false
        }
        localStorage.setItem("client", JSON.stringify(client))
        localStorage.setItem("admin", childData)
    }

    hideCallback = (childData) => {
        this.setState({ hide: childData })
        const client = {
            "mode": this.state.mode,
            "index": JSON.parse(localStorage.getItem('client')).index,
            'hide': childData
        }
        localStorage.setItem("client", JSON.stringify(client))
    }

    render() {
        return (
            <div>
                {!this.state.mobile && 
                <div>
                    <div className="bird-container">
                        <div className="bird"></div>
                    </div>
                    <div className="bird-container-2">
                        <div className="bird"></div>
                    </div>
                </div>
                }
                <div id="modal" className="modal" onClick={() => {document.getElementById('modal').style.display = 'none'}}>
                    <div>
                        <img className="modal-content" id="modalImage" onClick={() => {window.open(document.getElementById("modalImage").src, '_blank')}}/>
                    </div>
                </div>
                <Sidebar modeCallback={this.modeCallback} mobile={this.state.mobile} mode={this.state.mode} admin={this.props.admin} adminCallback={this.adminCallback} adminMode={this.state.adminMode} hideCallback={this.hideCallback} hide={this.state.hide}/>
                {this.state.adminMode ? <AdminList mode={this.state.mode}/> : <List mode={this.state.mode} search={this.state.search} searchCallback={this.searchCallback} mobile={this.state.mobile} hide={this.state.hide}/>}
            </div>
        )
    }
}