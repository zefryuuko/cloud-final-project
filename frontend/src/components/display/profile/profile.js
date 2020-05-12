import React from 'react'
import axios from 'axios';
import {storage} from "../../../firebase/firebase"
import './styles.css'

export default class Profile extends React.Component{
    constructor(props) {
        super(props);
    
        this.state = {
            user: undefined,
            showEditButton: true,
            password: '',
            success: false,
            socket: window.SOCKET,
            communities: [],
            selectedFile: null
        }
    }

    componentDidMount() {
        this.getUserData()
    }

    componentWillReceiveProps(nextProps) {
        this.getUserData()
    }
    
    getUserData() {
        this.setState({
            communities: []
        })
        const token = localStorage.getItem("token")
        const obj = {
            token: token
        }
        axios.post(window.API_URL+'/user/token', obj)
        .then(res => {
            // if (res.data !== this.state.user) {
                this.setState({
                    user: res.data
                })
                const promises = this.state.user.communities.map(id => {
                    return axios.get(window.API_URL+'/community/'+id)
                    .then(community => {
                        if (!this.state.communities.map( c => {return c._id}).includes(id)) {// Optimize this
                            const data = {
                                _id: community.data._id,
                                name: community.data.name,
                                picture: community.data.picture
                            }
                            const socket = this.state.socket;
                            socket.emit('join', data._id)
                            this.setState({
                                communities: [...this.state.communities, data]
                            })
                        }
                    })
                    .catch(err => console.log(err))
                })
                Promise.all(promises)
            // }
        })

    }
    
    profile() {
        const onBlur = (e) => {
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
                let req = {
                    update: 'name',
                    _id: this.state.user._id,
                    name: e.target.textContent
                }
                axios.post(window.API_URL+'/user/update', req)
                req = {
                    update: 'name',
                    _id: this.state.user._id,
                    name: e.target.textContent,
                    communities: this.state.user.communities
                }
                const socket = this.state.socket;
                socket.emit('update', req);
            }
        }
    
        const onKeyPress = (e) => {
            if (e.charCode === 13) {
                e.target.blur()
            }
            if (e.target.textContent.length === 20) e.preventDefault()
            // if (e.charCode == 32) {
            //     e.preventDefault()
            // }
        }
    
        const onClick = (e) => {
            this.setState({
                showEditButton: false
            })
        }

        const changePassword = (e) => {
            e.preventDefault();
            const req = {
                update: 'password',
                _id: this.state.user._id,
                password: this.state.password
            }
            axios.post(window.API_URL+'/user/update', req)
            .then(res => {
                this.setState({
                    success: res.data
                })
            })
        }
    
        const deleteAccount = () => {
            axios.delete(window.API_URL+'/user/'+this.state.user._id)
            .then(res => {
                if (res.data) {
                    localStorage.clear()
                    window.location.reload()
                }
            })
        }
    
        const onChange = (e) => {
            this.setState({
                password: e.target.value
            })
        }

        const fileChangedHandler = e => {
            this.setState({ selectedFile: e.target.files[0] })
        }
        
        const uploadHandler = e => {
            e.preventDefault()
            storage.ref('images/users').child(this.state.user.pictureName).delete()
            .then(() => {
                const uploadTask = storage.ref(`/images/users/${this.state.selectedFile.name}`).put(this.state.selectedFile)
                uploadTask.on('state_changed', 
                (snapShot) => {
                    //takes a snap shot of the process as it is happening
                    console.log(snapShot)
                }, (err) => {
                    //catches the errors
                    console.log(err)
                }, () => {
                    // gets the functions from storage refences the image storage in firebase by the children
                    // gets the download url then sets the image from firebase as the value for the imgUrl key:
                    storage.ref('images/users').child(this.state.selectedFile.name).getDownloadURL()
                    .then(fireBaseUrl => {
                        const req = {
                            update: 'picture',
                            _id: this.state.user._id,
                            picture: fireBaseUrl,
                            pictureName: this.state.selectedFile.name
                        }
                        axios.post(window.API_URL+'/user/update', req)
                        .then(res => {
                            window.location.reload()
                        })
                    })
                })
            })
            
            // const formData = new FormData()
            // formData.append(
            //     'image',
            //     this.state.selectedFile,
            //     this.state.selectedFile.name
            // )
            // axios.post('my-domain.com/file-upload', formData, {
            //     onUploadProgress: progressEvent => {
            //       console.log(progressEvent.loaded / progressEvent.total)
            //     }
            // })
        }

        return (
            <div className='profile'>
                <img src={this.state.user.picture} />
                <input type="file" onChange={fileChangedHandler.bind(this)} accept="image/png,image/gif,image/jpeg"/>
                <button onClick={uploadHandler.bind(this)}>Upload!</button>
                <hr/>
                <div>
                    <p>Display name</p>
                    <p>Email</p>
                </div>
                <div className='edit'>
                    {/* Need further testing */}
                    <p className='name' contentEditable onClick={onClick.bind(this)} onKeyPress={onKeyPress.bind(this)} onBlur={onBlur.bind(this)}>{this.state.user.name}{this.state.showEditButton && <span>&#x270E;</span>}</p>
                    <p>{this.state.user.email}</p>
                </div>
                <hr/>
                <form onSubmit={changePassword.bind(this)}>
                    New Password <input type="password" onChange={onChange.bind(this)} required/>
                    {/* <input type="checkbox" onclick="myFunction()" />Show Password */}
                    <input type="submit" value="Change Password"/>
                </form>
                {this.state.success && <p>Password successfully changed!</p>}
                <button type="button" class="btn btn-danger" onClick={deleteAccount.bind(this)}>Delete account</button>
            </div>
        )
    }

    
    community() {
        const leave = (id) => {
            const req = {
                update: 'community leave',
                _id: this.state.user._id,
                community: id,
            }
            const socket = this.state.socket;
            socket.emit('leave', req.community)
            axios.post(window.API_URL+'/user/update', req)
            .then(() => {
                setTimeout(this.getUserData.bind(this),50)
            })
        }
        const communities = this.state.communities.map(c => {
            return <div className={this.props.mobile 
                ? 'searchStyle mobile' 
                : this.props.selected === 'yes' 
                ? 'searchStyle selected' 
                : 'searchStyle'}
            >
                <img src={c.picture} />
                <p className='name'>{c.name}</p>
                <button onClick={leave.bind(this, c._id)}>Leave</button>
            </div>
        })
        return (
            <div className='community'>
                {communities}
            </div>
        )
    }

    render() {
        if (this.state.user === undefined) return null
        return (
            <div>
                {parseInt(this.props.selected) === 1 && this.profile()}
                {parseInt(this.props.selected) === 2 && this.community()}
            </div>
        )
    }
}