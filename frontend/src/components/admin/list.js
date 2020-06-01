import React, { Component } from 'react'
import axios from 'axios'
import {storage} from "../../firebase/firebase"
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
        if (this.props.mode === 'profile') axios.get(window.ADMIN_URL+'/admin/users/', {headers: obj})
        .then(res => {
            this.setState({
                users: res.data
            })
        })
        else axios.get(window.ADMIN_URL+'/admin/communities/', {headers: obj})
        .then(res => {
            this.setState({
                communities: res.data
            })
        })
    }

    user() {
        const fileChangedHandler = async (id, e) => {
            e.preventDefault()
            const selectedFile = e.target.files[0];
            const reader = new FileReader();
    
            reader.onload = function(event) {
                document.getElementById(id).src = event.target.result
            }.bind(this);
    
            await reader.readAsDataURL(selectedFile);
            const uploadTask = storage.ref(`/images/users/${id}`).put(selectedFile)
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
                storage.ref('images/users').child(id).getDownloadURL()
                .then(fireBaseUrl => {
                    const req = {
                        id: id,
                        update: 'picture',
                        value: fireBaseUrl,
                        pictureName: id
                    }
                    const token = localStorage.getItem("token")
                    const obj = {
                        token: token
                    }
                    axios.post(window.ADMIN_URL+'/admin/users', req, {headers: obj})
                })
            })
        }
        const onBlur = (id, type, e) => {
            if (e.target.value === '') {
                const target = e.currentTarget;
                setTimeout(() => {
                    target.focus();
                });
            }
            else {
                const req = {
                    id: id,
                    update: type,
                    value: e.target.value
                }
                const token = localStorage.getItem("token")
                const obj = {
                    token: token
                }
                axios.post(window.ADMIN_URL+'/admin/users', req, {headers: obj})
            }
        }
        const onKeyPress = (e) => {
            if (e.charCode === 13) {
                e.target.blur()
            }
            if (e.target.value.length === 20) e.preventDefault()
        }
        const drop = (id) => {
            const token = localStorage.getItem("token")
            const obj = {
                token: token
            }
            axios.delete(window.ADMIN_URL+'/admin/users/'+id,  {headers: obj})
            .then(() => {
                this.getData()
            })
        }
        const users = this.state.users.map(c => {
            return <div className='user' key={c._id}>
                <label className="fileContainer" style={{overflow: 'hidden', position: 'relative'}}>
                    <img id={c._id} src={c.picture} />
                    <input type="file" onChange={fileChangedHandler.bind(this, c._id)} accept="image/png,image/gif,image/jpeg"/>
                </label>
                <input type='text' className='name' onKeyPress={onKeyPress.bind(this)} onBlur={onBlur.bind(this, c._id, 'name')} defaultValue={c.name}/>
                <input type='text' className='email' onKeyPress={onKeyPress.bind(this)} onBlur={onBlur.bind(this, c._id, 'email')} defaultValue={c.email}/>
                <button className="btn btn-danger" onClick={drop.bind(this, c._id)}>Delete</button>
            </div>
        })
        return users
    }

    community() {
        const fileChangedHandler = async (id, e) => {
            e.preventDefault()
            const selectedFile = e.target.files[0];
            const reader = new FileReader();
    
            reader.onload = function(event) {
                document.getElementById(id).src = event.target.result
            }.bind(this);
    
            await reader.readAsDataURL(selectedFile);
            const uploadTask = storage.ref(`/images/communities/${id}`).put(selectedFile)
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
                storage.ref('images/communities').child(id).getDownloadURL()
                .then(fireBaseUrl => {
                    const req = {
                        id: id,
                        update: 'picture',
                        value: fireBaseUrl
                    }
                    const token = localStorage.getItem("token")
                    const obj = {
                        token: token
                    }
                    axios.post(window.ADMIN_URL+'/admin/communities', req, {headers: obj})
                })
            })
        }
        const onBlur = (id, type, e) => {
            if (e.target.value === '') {
                const target = e.currentTarget;
                setTimeout(() => {
                    target.focus();
                });
            }
            else {
                const req = {
                    id: id,
                    update: type,
                    value: e.target.value
                }
                const token = localStorage.getItem("token")
                const obj = {
                    token: token
                }
                axios.post(window.ADMIN_URL+'/admin/communities', req, {headers: obj})
            }
        }
        const onKeyPress = (e) => {
            if (e.charCode === 13) {
                e.target.blur()
            }
            if (e.target.value.length === 20) e.preventDefault()
        }
        const drop = (id) => {
            const token = localStorage.getItem("token")
            const obj = {
                token: token
            }
            axios.delete(window.ADMIN_URL+'/admin/communities/'+id,  {headers: obj})
            .then(() => {
                this.getData()
            })
        }
        const communities = this.state.communities.map(c => {
            return <div className='community' key={c._id}>
                <label className="fileContainer" style={{overflow: 'hidden', position: 'relative'}}>
                    <img id={c._id} src={c.picture} />
                    <input type="file" onChange={fileChangedHandler.bind(this, c._id)} accept="image/png,image/gif,image/jpeg"/>
                </label>
                <input type='text' className='name' onKeyPress={onKeyPress.bind(this)} onBlur={onBlur.bind(this, c._id, 'name')} defaultValue={c.name}/>
                <input type='text' className='description' onKeyPress={onKeyPress.bind(this)} onBlur={onBlur.bind(this, c._id, 'description')} defaultValue={c.description}/>
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
