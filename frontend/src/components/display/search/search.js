import React from 'react'
import axios from 'axios';
import {storage} from "../../../firebase/firebase"
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
            picture: 'https://res.cloudinary.com/erizky/image/upload/v1588573978/community_mgshrs.png',
            newCommunityID: undefined,
            pictureFile: undefined
        }
    }

    componentDidMount() {
        const token = localStorage.getItem("token")
        const obj = {
            token: token
        }
        axios.post(window.USER_URL+'/user/token', obj)
        .then(res => {
            this.setState({
                user: res.data,
                hasJoin: false
            })
        })
        .catch(err => console.log(err))

        if (parseInt(this.props.selected) > 3)
        axios.get(window.COMMUNITY_URL+'/community/'+this.props.selected)
        .then(res => {
            this.setState({
                community: res.data
            })
        })
        .catch(err => console.log(err))
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.selected !== nextProps.selected) {
            const token = localStorage.getItem("token")
            const obj = {
                token: token
            }
            axios.post(window.USER_URL+'/user/token', obj)
            .then(res => {
                this.setState({
                    user: res.data,
                    hasJoin: false
                })
            })
            .catch(err => console.log(err))

            this.setState({ community: undefined })
    
            if (parseInt(nextProps.selected) > 3)
            axios.get(window.COMMUNITY_URL+'/community/'+nextProps.selected)
            .then(res => {
                this.setState({
                    community: res.data
                })
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
                token: localStorage.getItem("token")
            }
            axios.post(window.USER_URL+'/user/update', req)
            .then(res => {
                if (res.data) {
                    this.setState({
                        isLoading: false,
                        hasJoin: true
                    })
                    if (!this.props.mobile) {
                        document.getElementsByClassName('speech-bubble')[0].style.display = 'block'
                        document.getElementsByClassName('speech-bubble')[0].style.opacity = 1
                        document.getElementsByClassName('speech-bubble')[0].style.left = '92px'
                    }
                    // setTimeout(() => {
                    //     localStorage.setItem('mode','community')
                    //     localStorage.setItem('index','1')
                    //     window.location.reload()
                    // }, 1500)
                }
            })
        }
    }

    viewCommunity() {
        return (
            <div className={this.props.mobile ? 'view mobile' : 'view'}>
                <img src={this.state.community.picture} />
                <p className='name'>{this.state.community.name}</p>
                <p className='description'>{this.state.community.description}</p>
                { this.state.isLoading ? <div class="loader"></div> : (
                    <button type="button" className="btn btn-success" onClick={this.joinCommunity.bind(this)}  disabled={this.state.hasJoin || this.state.user.communities.includes(this.state.community._id) ? true : false}>
                        <b>{this.state.hasJoin || this.state.user.communities.includes(this.state.community._id) ? 'Joined!' : 'Join Community'}</b>
                    </button>
                )}
            </div>
        )
    }

    async createCommunity(e) {
        e.preventDefault()
        this.setState({
            isLoading: true
        })
        await this.uploadImage()
        const req = {
            name: this.state.name,
            description: this.state.description,
            picture: this.state.picture,
        }
        axios.post(window.COMMUNITY_URL+'/community/create', req)
        .then(res => {
            if (res.data) {
                const req = {
                    update: 'community',
                    _id: this.state.user._id,
                    community: res.data._id,
                    token: localStorage.getItem("token")
                }
                this.setState({
                    newCommunityID: res.data._id
                })
                axios.post(window.USER_URL+'/user/update', req)
                .then(res => {
                    if (res.data) {
                        this.setState({
                            isLoading: false,
                            hasJoin: true
                        })
                        const obj = {
                            _id: this.state.newCommunityID,
                            user: '',
                            message: this.state.user.name+'['+this.state.user._id+']'+' joined the game.',
                            timestamp: new Date().toLocaleString(),
                            token: localStorage.getItem('token')
                        }
                        axios.post(window.CHAT_URL+'/chat', obj)
                        const client = {
                            "mode": 'community',
                            "index": 1,
                            'hide': false
                        }
                        localStorage.setItem("client", JSON.stringify(client))
                        if (!this.props.mobile) {
                            document.getElementsByClassName('speech-bubble')[0].style.display = 'block'
                            document.getElementsByClassName('speech-bubble')[0].style.opacity = 1
                            document.getElementsByClassName('speech-bubble')[0].style.left = '92px'
                        }
                        // setTimeout(() => {
                        //     localStorage.setItem('mode','community')
                        //     localStorage.setItem('index','1')
                        //     window.location.reload()
                        // }, 1500)
                    }
                })
            }
        })
        .catch(err => {
            alert('Image is too large!')
            this.setState({isLoading: false})
        })
    }

    onChange(e) {
        this.setState({
            [e.target.name]: e.target.value
        })
    }

    changeImage(e) {
        e.preventDefault()
        const selectedFile = e.target.files[0];
        this.setState({ pictureFile: selectedFile })
        const reader = new FileReader();

        reader.onload = function(event) {
            this.setState({ picture: event.target.result })
        }.bind(this);

        reader.readAsDataURL(selectedFile);
    }

    uploadImage() {
        if (this.state.pictureFile !== undefined) {
            const selectedFile = this.state.pictureFile
            const uploadTask = storage.ref(`/images/groups/${selectedFile.name}`).put(selectedFile)
            uploadTask.on('state_changed', 
            (snapShot) => {
                //takes a snap shot of the process as it is happening
                // console.log(snapShot)
            }, (err) => {
                //catches the errors
                console.log(err)
            }, () => {
                // gets the functions from storage refences the image storage in firebase by the children
                // gets the download url then sets the image from firebase as the value for the imgUrl key:
                storage.ref('images/groups').child(selectedFile.name).getDownloadURL()
                .then(fireBaseUrl => {
                    this.setState({ picture: fireBaseUrl })
                })
            })
        }
    }

    formCommunity() {
        return (
            <div className={this.props.mobile ? 'createStyle mobile' : 'createStyle'}>
                <div className={this.props.mobile ? 'perfection' : ''} style={{position: !this.props.mobile ? 'relative' : ''}}>
                    <img src={this.state.picture}/>
                    <label className={this.props.mobile ? 'fileContainer mobile' : 'fileContainer search'}>
                        <img src="https://img.icons8.com/material-outlined/48/000000/image.png"/>
                        <input type="file" onChange={this.changeImage.bind(this)} accept="image/png,image/gif,image/jpeg"/>
                    </label>
                </div>
                <br/>
                <form onSubmit={this.createCommunity.bind(this)}>
                    <input className='inputName' type='text' name='name' onChange={this.onChange.bind(this)} maxLength='50' placeholder='Name' required/>
                    <br/>
                    <textarea type='text' name='description' onChange={this.onChange.bind(this)} maxLength='500' placeholder='Description' required/>
                    <br/>
                    { this.state.isLoading ? <div class="loader"></div> : (
                        <button type="submit" className="btn btn-success" disabled={this.state.hasJoin ? true : false}>
                            <b>{this.state.hasJoin ? 'Created!' : 'Create Community'}</b>
                        </button>
                    )}
                </form>
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