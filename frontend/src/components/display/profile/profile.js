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
            selectedFile: null,
            picture: undefined,
            areYouSure: false,
            country: undefined
        }
    }

    componentDidMount() {
        this.getUserData()
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.selected !== this.props.selected)
        this.getUserData()
    }
    
    getUserData() {
        this.setState({
            communities: [],
            areYouSure: false,
            country: localStorage.getItem("server")
        })
        const token = localStorage.getItem("token")
        const obj = {
            token: token
        }
        axios.post(window.USER_URL+'/user/token', obj)
        .then(async res => {
            // if (res.data !== this.state.user) {
                await this.setState({
                    user: res.data
                })
                this.setState({
                    picture: this.state.user.picture
                })
                const promises = this.state.user.communities.map(id => {
                    return axios.get(window.COMMUNITY_URL+'/community/'+id)
                    .then(community => {
                        if (!this.state.communities.map( c => {return c._id}).includes(id)) {// Optimize this
                            const data = {
                                _id: community.data._id,
                                name: community.data.name,
                                picture: community.data.picture,
                                description: community.data.description
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
            if (e.target.value === '') {
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
                    token: localStorage.getItem('token'),
                    name: e.target.value
                }
                axios.post(window.USER_URL+'/user/update', req)
                req = {
                    update: 'name',
                    _id: this.state.user._id,
                    name: e.target.value,
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
            if (e.target.value.length === 20) e.preventDefault()
            // if (e.charCode == 32) {
                //     e.preventDefault()
            // }
        }
        
        const onClick = (e) => {
            // e.target.style.width = e.target.value.length + "ch"
            this.setState({
                showEditButton: false
            })
        }
        
        const changePassword = (e) => {
            e.preventDefault();
            const req = {
                update: 'password',
                token: localStorage.getItem('token'),
                password: this.state.password
            }
            axios.post(window.USER_URL+'/user/update', req)
            .then(res => {
                this.setState({
                    success: res.data
                })
            })
        }
    
        const deleteAccount = e => {
            if (!this.state.areYouSure) {
                e.target.innerHTML = 'Are you sure?'
                this.setState({ areYouSure: true })
                setTimeout(() => {
                    document.getElementById('deleteAccount').innerHTML = 'Delete account'
                    this.setState({ areYouSure: false })
                }, 2000);
            }
            else {
                const token = localStorage.getItem("token")
                const obj = {
                    token: token
                }
                axios.delete(window.USER_URL+'/user/', {headers: obj})
                .then(res => {
                    if (res.data) {
                        localStorage.clear()
                        window.location.reload()
                    }
                })
            }
        }
    
        const onChange = (e) => {
            this.setState({
                password: e.target.value
            })
        }

        const fileChangedHandler = async (e) => {
            e.preventDefault()
            const selectedFile = e.target.files[0];
            this.setState({ selectedFile: selectedFile })
            const reader = new FileReader();
    
            reader.onload = function(event) {
                this.setState({ picture: event.target.result })
            }.bind(this);
    
            await reader.readAsDataURL(selectedFile);
            uploadHandler()
        }
        
        const uploadHandler = () => {
            if (this.state.user.pictureName !== undefined)
            storage.ref('images/users').child(this.state.user.pictureName).delete()
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
                    let req = {
                        update: 'picture',
                        token: localStorage.getItem('token'),
                        picture: fireBaseUrl,
                        pictureName: this.state.selectedFile.name
                    }
                    axios.post(window.USER_URL+'/user/update', req)
                    .then(res => {
                        req = {
                            update: 'picture',
                            _id: this.state.user._id,
                            picture: fireBaseUrl,
                            communities: this.state.user.communities
                        }
                        const socket = this.state.socket;
                        socket.emit('update', req);
                    })
                })
            })
        }

        return this.props.mobile ? 
            <div className='profile mobile'>
                <label className="fileContainer">
                    <img src={this.state.picture} />
                    <div className='middle'>Change picture</div>
                    <input type="file" onChange={fileChangedHandler.bind(this)} accept="image/png,image/gif,image/jpeg"/>
                </label>
                <table>
                    <tbody>
                        <tr className='profileRow'>
                            <td><b>Display name</b></td>
                        </tr>
                        <tr>
                            <td><input type='text' className='name' onClick={onClick.bind(this)} onKeyPress={onKeyPress.bind(this)} onBlur={onBlur.bind(this)} defaultValue={this.state.user.name}/>{this.state.showEditButton && <span>&#x270E;</span>}</td>
                        </tr>
                        <tr className='profileRow'>
                            <td><b>Email</b></td>
                        </tr>
                        <tr>
                            <td>{this.state.user.email}</td>

                        </tr>
                        <tr className='profileRow'>
                            <td><b>Verified</b></td>
                        </tr>
                        <tr>
                            <td>{this.state.user.verified ? 'Verifed' : 'Email not verified'}</td>
                        </tr>
                        <tr className='profileRow'>
                            <td><b>New Password</b></td>
                        </tr>
                            <td>
                                <form onSubmit={changePassword.bind(this)}>
                                    <input type="password" onChange={onChange.bind(this)} required/>
                                    {/* <input type="checkbox" onclick="myFunction()" />Show Password */}
                                    <button type="submit" class="btn btn-dark">Change Password</button>
                                </form>
                            </td>
                            {this.state.success && <td><p>Password successfully changed!</p></td>}
                        <tr>
                        </tr>
                        <tr className='profileRow'>
                            <td colSpan='2'>
                                <button type="button" class="btn btn-danger" id='deleteAccount' onClick={deleteAccount.bind(this)}>Delete account</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        :
        <div className='profile'>
                <table>
                    <tbody>
                        <tr>
                            <td rowSpan='5'>
                                <label className="fileContainer" style={{overflow: 'hidden', position: 'relative'}}>
                                    <img src={this.state.picture} />
                                    <div className='middle'>Change picture</div>
                                    <input type="file" onChange={fileChangedHandler.bind(this)} accept="image/png,image/gif,image/jpeg"/>
                                </label>
                            </td>
                            <td><b>Display name</b></td>
                            <td><input type='text' className='name' onClick={onClick.bind(this)} onKeyPress={onKeyPress.bind(this)} onBlur={onBlur.bind(this)} defaultValue={this.state.user.name}/>{this.state.showEditButton && <span>&#x270E;</span>}</td>
                        </tr>
                        <tr>
                            <td><b>Email</b></td>
                            <td>{this.state.user.email}</td>
                        </tr>
                        <tr>
                            <td><b>Verified</b></td>
                            <td>{this.state.user.verified ? 'Verifed' : 'Email not verified'}</td>
                        </tr>
                        <tr>
                            <td><b>New Password</b></td>
                            <td>
                                <form onSubmit={changePassword.bind(this)}>
                                    <input type="password" onChange={onChange.bind(this)} required/>
                                    {/* <input type="checkbox" onclick="myFunction()" />Show Password */}
                                    <button type="submit" class="btn btn-dark">Change Password</button>
                                </form>
                            </td>
                                {this.state.success && <td><p>Password successfully changed!</p></td>}
                        </tr>
                        <tr>
                            <td colSpan='2'>
                                <button type="button" class="btn btn-danger" id='deleteAccount' onClick={deleteAccount.bind(this)}>Delete account</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
    }

    
    community() {
        const leave = (id) => {
            const req = {
                update: 'community leave',
                _id: this.state.user._id,
                community: id,
                token: localStorage.getItem('token')
            }
            const socket = this.state.socket;
            socket.emit('leave', req.community)
            axios.post(window.USER_URL+'/user/update', req)
            .then(() => {
                setTimeout(this.getUserData.bind(this),50)
            })
        }
        const communities = this.state.communities.map(c => {
            return <div className={this.props.mobile 
                    ? 'community mobile'
                    : 'community'} key={c._id}>
                    <img src={c.picture} />
                    <p className='name'>{c.name}</p>
                    <p className='description'>{c.description}</p>
                    <button className="btn btn-danger" onClick={leave.bind(this, c._id)}>Leave</button>
                </div>
        })
        return communities
    }

    setting() {
        const logout = () => {
            localStorage.clear()
            window.location.href='/'
        }
        const changeServer = e => {
            localStorage.setItem('server', e.target.value)
            window.location.reload()
        }
        return <div>
            <button className="btn btn-danger" onClick={logout}>Logout</button>
            <p><b>Change server location (Experimental)</b></p>
            <select name="countries" onChange={changeServer.bind(this)}>
                <option selected={this.state.country === 'ID' ? true : false} value="ID">🇮🇩 Indonesia</option>
                <option selected={this.state.country === 'US' ? true : false} value="US">🇺🇸 United States</option>
            </select>
        </div>
    }

    render() {
        if (this.state.user === undefined) return null
        return (
            <div className={this.props.mobile ? 'wrapperMobile' : 'wrapper'}>
                {parseInt(this.props.selected) === 1 && this.profile()}
                {parseInt(this.props.selected) === 2 && this.community()}
                {parseInt(this.props.selected) === 3 && this.setting()}
            </div>
        )
    }
}