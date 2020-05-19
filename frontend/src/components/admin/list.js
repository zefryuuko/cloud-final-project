import React, { Component } from 'react'
import axios from 'axios'
import './styles.css'

export default class list extends Component {
    constructor(props) {
        super(props);
    
        this.state = {
            users: [],
            communities: []
        }
    }

    componentDidMount() { this.getData() }
    componentWillReceiveProps() { this.getData() }

    getData() {
        const token = localStorage.getItem("token")
        const obj = {
            token: token
        }
        if (this.props.mode === 'profile') axios.get(window.API_URL+'/admin/users/', {headers: obj})
        .then(res => {
            this.setState({
                users: res.data
            })
        })
        else axios.get(window.API_URL+'/admin/communities/', {headers: obj})
        .then(res => {
            this.setState({
                communities: res.data
            })
        })
    }

    user() {
        const drop = (id) => {
            const token = localStorage.getItem("token")
            const obj = {
                token: token
            }
            axios.delete(window.API_URL+'/admin/user/'+id,  {headers: obj})
            .then(() => {
                this.getData()
            })
        }
        const users = this.state.users.map(c => {
            return <div className='user' key={c._id}>
                <img src={c.picture} />
                <p className='name'>{c.name}</p>
                <p className='email'>{c.email}</p>
                <button className="btn btn-danger" onClick={drop.bind(this, c._id)}>Delete</button>
            </div>
        })
        return users
    }

    community() {
        const drop = (id) => {
            const token = localStorage.getItem("token")
            const obj = {
                token: token
            }
            axios.delete(window.API_URL+'/admin/communities/'+id,  {headers: obj})
            .then(() => {
                this.getData()
            })
        }
        const communities = this.state.communities.map(c => {
            return <div className='community' key={c._id}>
                <img src={c.picture} />
                <p className='name'>{c.name}</p>
                <p className='description'>{c.description}</p>
                <button className="btn btn-danger" onClick={drop.bind(this, c._id)}>Delete</button>
            </div>
        })
        return communities
    }

    render() {
        return (
            <div className='admin'>
                {this.props.mode === 'profile' ? this.user() : this.community()}
            </div>
        )
    }
}
