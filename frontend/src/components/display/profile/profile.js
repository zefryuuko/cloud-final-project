import React from 'react'
import axios from 'axios';
import './styles.css'

export default class Profile extends React.Component{
    constructor(props) {
        super(props);
    
        this.state = {
            user: undefined,
            showEditButton: true,
            password: '',
            success: false
        }
    }

    componentDidMount() {
        const currentUser = localStorage.getItem("userSession")
        if (currentUser)
        axios.post(process.env.REACT_APP_API_URL+'/user/token', JSON.parse(currentUser))
        .then(res => {
            this.setState({
                user: res.data
            })
        })
    }

    componentWillReceiveProps(nextProps) {
        const currentUser = localStorage.getItem("userSession")
        if (currentUser)
        axios.post(process.env.REACT_APP_API_URL+'/user/token', JSON.parse(currentUser))
        .then(res => {
            this.setState({
                user: res.data
            })
        })
    }

    onBlur(e) {
        if (e.target.textContent === '') {
            const target = e.currentTarget;
            setTimeout(() => {
                target.focus();
            });
        }
        else {
            this.setState({
                showEditButton: true
            })            
            const req = {
                update: 'name',
                _id: this.state.user._id,
                name: e.target.textContent
            }
            axios.post(process.env.REACT_APP_API_URL+'/user/update', req)
        }
    }

    onKeyPress(e) {
        if (e.charCode === 13) {
            e.target.blur()
        }
        if (e.target.textContent.length === 20) e.preventDefault()
        // if (e.charCode == 32) {
        //     e.preventDefault()
        // }
    }

    onClick(e) {
        this.setState({
            showEditButton: false
        })
    }
    
    profile() {
        return (
            <div className='profile'>
                <img src={this.state.user.picture} />
                {/* <br/> */}
                <input name="file" type="file" accept="image/x-png,image/gif,image/jpeg" />
                <br/>
                <div>
                    <p>Display name</p>
                    <p>Email</p>
                </div>
                <div className='edit'>
                    {/* Need further testing */}
                    <p className='name' contentEditable onClick={this.onClick.bind(this)} onKeyPress={this.onKeyPress.bind(this)} onBlur={this.onBlur.bind(this)}>{this.state.user.name}{this.state.showEditButton && <img src={require('./edit-3-24.png')}/>}</p>
                    <p>{this.state.user.email}</p>
                </div>
            </div>
        )
    }

    changePassword(e) {
        e.preventDefault();
        const req = {
            update: 'password',
            _id: this.state.user._id,
            password: this.state.password
        }
        axios.post(process.env.REACT_APP_API_URL+'/user/update', req)
        .then(res => {
            this.setState({
                success: res.data
            })
        })
    }

    deleteAccount() {
        axios.delete(process.env.REACT_APP_API_URL+'/user/'+this.state.user._id)
        .then(res => {
            if (res.data) {
                localStorage.clear()
                window.location.reload()
            }
        })
    }

    onChange(e) {
        this.setState({
            password: e.target.value
        })
    }
    
    account() {
        return (
            <div className='account'>
                <form onSubmit={this.changePassword.bind(this)}>
                    New Password <input type="password" onChange={this.onChange.bind(this)} required/>
                    {/* <input type="checkbox" onclick="myFunction()" />Show Password */}
                    <input type="submit" value="Change Password"/>
                </form>
                <br/>
                {this.state.success && <p>Password successfully changed!</p>}
                <button type="button" class="btn btn-danger" onClick={this.deleteAccount.bind(this)}>Delete account</button>
            </div>
        )
    }

    render() {
        if (this.state.user === undefined) return null
        return (
            <div>
                {parseInt(this.props.selected) === 1 && this.profile()}
                {parseInt(this.props.selected) === 2 && this.account()}
            </div>
        )
    }
}