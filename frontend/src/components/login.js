import React, { Component } from 'react';
import './login.css'
import axios from 'axios';

export default class Login extends Component {
  constructor(props) {
    super(props);

    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.onClick = this.onClick.bind(this);

    this.state = {
        mode: 'login',
        invalid: '',
        email: '',
        password: '',
        name: ''
    }
  }

  componentDidMount() {
    const token = localStorage.getItem("token")
    if (token) window.location.href='/'
  }

  onChange(e) {
    this.setState({
        [e.target.name]: e.target.value
    })
  }

  onSubmit(e) {
    e.preventDefault();

    this.setState({
        invalid: ''
    })

    if (this.state.mode === 'register') {
        const user = {
          email: this.state.email,
          password: this.state.password,
          name: this.state.name
        }
        axios.post(window.API_URL+'/user/register', user)
          .then(res => {
            //   this.setState({
            //       isLoading: false
            //   })
            if (res.data) {
                if (res.data === 'invalidEmail') {
                    this.setState({
                        invalid: 'email2'
                    })
                }
                else if (res.data.errors) {
                    // Handle unique error
                    console.log(res.data.message)
                }
                else {
                    localStorage.setItem('token', res.data.token)
                    const client = {
                        "mode": 'search',
                        "index": 1
                    }
                    localStorage.setItem("client", JSON.stringify(client))
                    window.location.href='/'
                }
            }
            else {
                // Handle connection error
            }
          });
    }
    else {
        const user = {
            email: this.state.email,
            password: this.state.password
        }
        axios.post(window.API_URL+'/user/login', user)
        .then(res => {
            if (res.data) {
                if (res.data === 'invalidEmail') {
                    this.setState({
                        invalid: 'email'
                    })
                }
                else if (res.data === 'invalidPass') {
                    this.setState({
                        invalid: 'password'
                    })
                }
                else if (res.data === 'maxAttempt') {
                    this.setState({
                        invalid: 'max'
                    })
                }
                else if (res.data.errors) {
                    // Handle unique error
                    console.log(res.data.message)
                }
                else {
                    localStorage.setItem('token', res.data.token)
                    const client = {
                        "mode": res.data.new ? 'search' : 'community',
                        "index": 1
                    }
                    localStorage.setItem("client", JSON.stringify(client))
                    window.location.href='/'
                }
            }
            else {
                // Handle connection error
            }
        });
    }
  }

  onClick(e) {
    this.setState({
        invalid: ''
    })
    if (this.state.mode === 'login') {
        this.setState({
            mode: 'register'
        })
    }
    else {
        this.setState({
            mode: 'login'
        })
    }
  }

  render() {
    return (
    <div className='body'>
        <div className='form'>
            <p>{this.state.mode === 'register' ? 'Create an account' : 'Welcome back!'}</p>
            <form onSubmit={this.onSubmit}>
                <label style={{color: this.state.invalid === 'email' ? 'red' : this.state.invalid === 'email2' ? 'red' : ''}}>Email<i>{this.state.invalid === 'email' ? ' - Email does not exist.' : this.state.invalid === 'email2' && ' - Email already in use.'}</i></label>
                <br />
                <input type='email' required name='email' onChange={this.onChange} style={{borderColor: this.state.invalid === 'email' ? 'red' : this.state.invalid === 'email2' ? 'red' : ''}}/>
                <br />

                <div style={{display: this.state.mode === 'register' ? "block" : "none"}}>
                    <label>Display name</label>
                    <br />
                    <input type='text' required={this.state.mode === 'register' ? true : false} name='name' onChange={this.onChange} maxLength="20"/>
                    <br />
                </div>

                <label style={{color: this.state.invalid === 'password' || this.state.invalid === 'max' ? 'red' : ''}}>Password<i>{this.state.invalid === 'password' ? ' - Password does not match.' : this.state.invalid === 'max' ? ' - Max login attempts exceeded. Please try again later.' : ''}</i></label>
                <br />
                <input type='password' required name='password' onChange={this.onChange} style={{borderColor: this.state.invalid === 'password' || this.state.invalid === 'max' ? 'red' : ''}}/>
                <br />
                {/* <a>Forgot your password?</a> */}

                <button type="submit" className="btn btn-primary" >{this.state.mode === 'register' ? 'Register' : 'Login'}</button>
                {this.state.mode === 'register' ? 'Already have' : 'Need'} an account? <a href='#' onClick={this.onClick}>{this.state.mode === 'register' ? 'Login' : 'Register'}</a>
            </form>
        </div>
    </div>
    )
  }
}