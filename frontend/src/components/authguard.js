import React from 'react'
import { BrowserRouter as Redirect } from "react-router-dom";
import axios from 'axios';
 
export default class AuthGuard extends React.Component {
    constructor(props) {
        super(props);
        this.state = { 
            authorized: false,
            loading: true
        };
    }

    async OAuth2_0() {
        // Validate token
        const token = localStorage.getItem("token")
        const obj = {
            token: token
        }
        if (token)
        axios.post(window.API_URL+'/user/token', obj)
        .then(res => {
            if (res.data === false) {
                localStorage.clear()
                this.setState({
                    // Authorize user
                    authorized: false,
                    loading: false
                })
            }
            else this.setState({
                // Authorize user
                authorized: true,
                loading: false
            })
            // Cache user data received from OAuth2.0 server
            // localStorage.setItem("userCache", JSON.stringify(res.data))
        })
        else this.setState({
            authorized: false,
            loading: false
        })
    }
    
    componentDidMount() {
        this.OAuth2_0()
        // this.interval = setInterval(() => this.OAuth2_0(), 120000);
        window.addEventListener('unhandledrejection', this.OAuth2_0.bind(this));
    }
    
    componentWillUnmount() {
        // clearInterval(this.interval);
        window.SOCKET.disconnect()
        window.removeEventListener('unhandledrejection', this.OAuth2_0)
    }
    
    render() {
        return this.state.loading
        ? null : this.state.authorized
        ? <this.props.component /> : <Redirect push to='/login'/>
    }
}