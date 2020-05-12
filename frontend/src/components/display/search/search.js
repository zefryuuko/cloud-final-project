import React from 'react'
import axios from 'axios';
import './styles.css'

export default class Search extends React.Component{
    constructor(props) {
        super(props);
    
        this.state = {
            user: undefined,
            community: undefined,
            isLoading: false,
            hasJoin: false,
            name: undefined,
            description: undefined,
            picture: undefined,
            newCommunityID: undefined

        }
    }

    componentDidMount() {
        const token = localStorage.getItem("JSONWebToken")
        axios.post(window.API_URL+'/user/token', JSON.parse(token))
        .then(res => {
            this.setState({
                user: res.data,
                hasJoin: false
            })
        })
        .catch(err => console.log(err))

        if (parseInt(this.props.selected) > 3)
        axios.get(window.API_URL+'/community/'+this.props.selected)
        .then(res => {
            this.setState({
                community: res.data
            })
        })
        .catch(err => console.log(err))
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.selected !== nextProps.selected) {
            const token = localStorage.getItem("JSONWebToken")
            axios.post(window.API_URL+'/user/token', JSON.parse(token))
            .then(res => {
                this.setState({
                    user: res.data,
                    hasJoin: false
                })
                // console.log(res)
            })
            .catch(err => console.log(err))
    
            if (parseInt(nextProps.selected) > 3)
            axios.get(window.API_URL+'/community/'+nextProps.selected)
            .then(res => {
                this.setState({
                    community: res.data
                })
                // console.log(res)
            })
            .catch(err => console.log(err))
        }
    }

    joinCommunity(e) {
        e.preventDefault()
        if (!this.state.hasJoin) {
            this.setState({
                isLoading: true
            })
            const req = {
                update: 'community',
                _id: this.state.user._id,
                community: this.state.community._id,
            }
            axios.post(window.API_URL+'/user/update', req)
            .then(res => {
                if (res.data) {
                    this.setState({
                        isLoading: false,
                        hasJoin: true
                    })
                    setTimeout(() => {
                        localStorage.setItem('mode','community')
                        localStorage.setItem('index','1')
                        window.location.reload()
                    }, 1500)
                }
            })
        }
    }

    viewCommunity() {
        return (
            <div className='view'>
                <img src={this.state.community.picture} />
                <p className='name'>{this.state.community.name}</p>
                <p className='description'>{this.state.community.description}</p>
                { this.state.isLoading ? 'Loading...' : (
                    <button type="button" className="btn btn-success" onClick={this.joinCommunity.bind(this)}  disabled={this.state.hasJoin || this.state.user.communities.includes(this.state.community._id) ? true : false}>
                        <b>{this.state.hasJoin || this.state.user.communities.includes(this.state.community._id) ? 'Joined!' : 'Join Community'}</b>
                    </button>
                )}
            </div>
        )
    }

    createCommunity(e) {
        e.preventDefault()
        this.setState({
            isLoading: true
        })
        const req = {
            name: this.state.name,
            description: this.state.description,
            picture: this.state.picture,
        }
        axios.post(window.API_URL+'/community/create', req)
        .then(res => {
            if (res.data) {
                this.setState({
                    isLoading: false,
                    hasJoin: true
                })
                const req = {
                    update: 'community',
                    _id: this.state.user._id,
                    community: res.data._id,
                }
                this.setState({
                    newCommunityID: res.data._id
                })
                axios.post(window.API_URL+'/user/update', req)
                .then(res => {
                    if (res.data) {
                        const obj = {
                            _id: this.state.newCommunityID,
                            user: '',
                            message: this.state.user.name+'['+this.state.user._id+']'+' joined the game.',
                            timestamp: new Date().toLocaleString()
                        }
                        axios.post(window.API_URL+'/community/chat', obj)
                        setTimeout(() => {
                            localStorage.setItem('mode','community')
                            localStorage.setItem('index','1')
                            window.location.reload()
                        }, 1500)
                    }
                })
            }
        })
    }

    onChange(e) {
        this.setState({
            [e.target.name]: e.target.value
        })
    }

    formCommunity() {
        return (
            <div className='create'>
                <img src='https://res.cloudinary.com/erizky/image/upload/v1588573978/community_mgshrs.png'/>
                <br/>
                <input name="file" type="file" accept="image/x-png,image/gif,image/jpeg" />
                <br/>
                <p>Community name</p>
                <input type='text' name='name' onChange={this.onChange.bind(this)} maxLength='50'/>
                <br/>
                <p>Description</p>
                <textarea type='text' name='description' onChange={this.onChange.bind(this)} />
                <br/>
                { this.state.isLoading ? '' : (
                    <button type="button" className="btn btn-success" onClick={this.createCommunity.bind(this)} disabled={this.state.hasJoin ? true : false}>
                        <b>{this.state.hasJoin ? 'Created!' : 'Create Community'}</b>
                    </button>
                )}
            </div>
        )
    }

    render() {
        // const {user, community} = this.props
        // if (user === undefined) return <span>Loading...</span>
        if (this.state.user !== undefined) {
            if (parseInt(this.props.selected) < 4) if (parseInt(this.props.selected) === 0) return this.formCommunity()
            if (this.state.community !== undefined) return this.viewCommunity()
        }
        return null
    }
}