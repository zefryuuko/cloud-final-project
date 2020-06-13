import React from 'react'
import axios from 'axios'
import {storage} from "../../../firebase/firebase"
import './styles.css'
import smoothscroll from 'smoothscroll-polyfill';
import Peer from 'peerjs'
 
import Chat from './chat'
import AudioAnalyser from './AudioVisualiser/AudioAnalyser';

export default class Community extends React.Component{
    constructor(props) {
        super(props);
    
        this.state = {
            socket: window.SOCKET,
            rawChats: [],
            chatLoaded: 0,
            user: undefined,
            users: [],
            communityName: undefined,
            members: [],
            isTyping: false,
            whosTyping: [],
            bottom: true,
            top: false,
            chat: 'text',
            audio: null,
            peer: null,
            streams: [],
            video: null
        }
    }
    
    async componentDidMount() {
        await this.loadChat()
        window.addEventListener("drop", this.dropImage);
        window.addEventListener('paste', this.pasteImage);
        window.addEventListener('beforeunload', this.disconnect);
        this.fetchChat()
        this.fetchUser()
        this.fetchUserTyping()
        this.retrieveUserTyping()
        const socket = this.state.socket;
        socket.on('reconnect', () => {
            this.fetchChat()
            this.fetchUser()
            this.fetchUserTyping()
            this.retrieveUserTyping()
        })
        // const data = {
        //     _id: this.props.selected,
        //     user: this.state.user._id
        // }
        // socket.emit('login', data)
    }

    async componentDidUpdate(prevProps, prevState) {
        // Detect if column has changed
        if (this.props.selected !== prevProps.selected) {
            if (this.state.chat !== 'text') {
                this.state.peer.destroy()
                // if (this.state.streams.length === 0) {
                //     if (this.state.chat === 'video') this.localVideo.srcObject.getTracks().forEach(track => track.stop());
                //     await this.setState({
                //         chat: 'text',
                //         peer: null,
                //         streams: [],
                //         video: null,
                //         audio: null
                //     })
                // }
                // else 
                window.location.reload()
            }
            // Load chat
            await this.loadChat()
            if (parseInt(prevProps.selected) > 3) {
                const data = {
                    _id: prevProps.selected,
                    user: this.state.user.name
                }
                const socket = this.state.socket;
                socket.off('typing_'+prevProps.selected)
                this.fetchUserTyping()
                socket.emit('typing', false, data)
                document.getElementById('chatbox').value = ''
                socket.emit('retrieve', this.props.selected)
            }
        }
        if (this.state.isTyping !== prevState.isTyping) {
            const data = {
                _id: this.props.selected,
                user: this.state.user.name
            }
            const socket = this.state.socket;
            if (this.state.isTyping) {
                socket.emit('typing', true, data)
            }
            else {
                socket.emit('typing', false, data)
            }
        }
        if (this.state.rawChats !== prevState.rawChats) {
            if (this.state.rawChats.length > 30) {
                const top = document.getElementById((30).toString())
                if (top) top.scrollIntoView()
            }
        }
        if (this.state.chat !== prevState.chat) {
            if (this.state.chat !== 'text') this.requestPermission(this.state.chat)
        }
    }

    componentWillUnmount() {
        if (this.state.chat !== 'text') {
            this.state.peer.destroy()
            window.location.reload()
        }
        window.removeEventListener('drop', this.dropImage)
        window.removeEventListener('paste', this.pasteImage)
    }
    
    async loadChat() {
        if (parseInt(this.props.selected) > 3) {
            // Flush saved raw chat if any from previous column
            this.setState({
                members: [],
                users: [],
                rawChats: [],
                chatLoaded: 0,
                isTyping: false,
                whosTyping: []
            })
            const token = localStorage.getItem("token")
            const obj = {
                token: token
            }
            await axios.post(window.USER_URL+'/user/token', obj)
            .then(res => {
                this.setState({
                    user: res.data
                })
            })
            // kick off the polyfill!
            smoothscroll.polyfill();
            this.getRawChat(true)
        }
    }

    async getRawChat(firstTime = false) {
        // Get raw chat
        await axios.get(window.COMMUNITY_URL+'/community/'+this.props.selected)
        .then(res => {
            if (firstTime) this.setState({ communityName: res.data.name, members: res.data.member })
            const increment = 30
            const index = this.state.chatLoaded + increment

            let rawChatsDump = [...this.state.rawChats]
            const rawChats = res.data.chat.length > this.state.chatLoaded + increment ? res.data.chat.slice(res.data.chat.length - index, res.data.chat.length - this.state.chatLoaded) : res.data.chat.slice(0, res.data.chat.length - this.state.chatLoaded)
            for (let i = rawChats.length - 1; i > - 1; i--) rawChatsDump = [rawChats[i], ...rawChatsDump]
            
            this.setState({
                rawChats: rawChatsDump,
                chatLoaded: res.data.chat.length > this.state.chatLoaded + increment ? index : undefined
            })
        })

        // Get sender information
        let senders = this.state.users.map(u => { return u._id })
        this.state.rawChats.map(chat => {
            if (chat.user !==  '')
            if (!senders.includes(chat.user)) senders.push(chat.user)
        })
        let promises = []
        if (this.state.users.length !== senders.length) 
        promises = senders.map(userID => {
            return axios.get(window.USER_URL+'/user/'+userID)
            .then(userData => {
                const data = {
                    _id: userID,
                    name: userData.data.name,
                    picture: userData.data.picture
                }
                this.setState(prevState => ({
                    users: [...prevState.users, data]
                }))
            })
        })
        Promise.all(promises)
        .then(() => {
            let promise = this.state.members.map(member => {
                return axios.get(window.USER_URL+'/user/'+member)
                .then(userData => {
                    const data = {
                        _id: member,
                        name: userData.data.name,
                        picture: userData.data.picture
                    }
                    if (!this.state.users.some(e => e._id === member)) {
                        this.setState(prevState => ({
                            users: [...prevState.users, data]
                        }))
                    }
                })
            })
            Promise.all(promise)
            .then(() => {
                if (this.state.top && this.state.chatLoaded !== undefined) this.setState({ top: false })
                if (firstTime) this.scrollToBottom()
            })
        })
    }
        
    fetchChat() {
        const socket = this.state.socket;
        socket.on('chat', async data => {
            if (this.state.user !== undefined)
            if (data.user !== this.state.user._id)
            this.notificationChat(data.name + ' (' + data.community + ')',{
                icon: 'http://cdn.sstatic.net/stackexchange/img/logos/so/so-icon.png',
                body: data.message,
            })
            await this.setState(prevState => ({ rawChats: [...prevState.rawChats, data]}))
            if (this.state.rawChats.length === 2) this.getRawChat()
            if (document.getElementById('chat') !== null) {
                if (this.state.bottom) this.scrollToBottom()
                else document.getElementById('chat').scrollTop = this.state.scrollPosition
            }
        });
    }

    fetchUser() {
        const socket = this.state.socket;
        socket.on('update', data => {
            // 1. Make a shallow copy of the items
            let users = [...this.state.users];
            // 2. Make a shallow copy of the item you want to mutate
            let index = this.state.users.map( u => {return u._id}).indexOf(data._id)
            let user = {...users[index]};
            // 3. Replace the property you're intested in
            if (data.update === 'name')
            user.name = data.name
            if (data.update === 'picture')
            user.picture = data.picture
            // 4. Put it back into our array. N.B. we *are* mutating the array here, but that's why we made a copy first
            users[index] = user;
            // 5. Set the state to our new copy
            this.setState({users});
        })
    }
    
    fetchUserTyping() {
        const socket = this.state.socket;
        socket.on('typing_'+this.props.selected, (isTyping, data) => {
            if (isTyping) {
                if (data !== this.state.user.name)
                this.setState({
                    whosTyping: [...this.state.whosTyping, data]
                })
            }
            else {
                let newWhosTyping = [...this.state.whosTyping]
                newWhosTyping.splice(newWhosTyping.indexOf(data), 1)
                this.setState({
                    whosTyping: newWhosTyping
                })
            }
        });
    }

    retrieveUserTyping() {
        const socket = this.state.socket;
        socket.on('retrieve', data => {
            this.setState({
                whosTyping: data
            })
        });
    }

    scrollToBottom() {
        document.getElementById('chat').scroll({ top: document.getElementById('chat').scrollHeight, left: 0, behavior: 'smooth' });
    }

    uploadImage(selectedFiles) {
        for (let i = 0; i < selectedFiles.length; i++) {
            const selectedFile = selectedFiles[i]
            const uploadTask = storage.ref(`/images/groups/`+this.props.selected+`/${selectedFile.name}`).put(selectedFile)
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
                storage.ref('images/groups/'+this.props.selected).child(selectedFile.name).getDownloadURL()
                .then(fireBaseUrl => {
                    this.sendChat(fireBaseUrl)
                })
            })
        }
    }
    
    dropImage = (e) => {
        e.preventDefault();
        this.uploadImage(e.dataTransfer.files)
    }

    pasteImage = (e) => {
        if (e.clipboardData.files.length !== 0) {
            e.preventDefault();
            this.uploadImage(e.clipboardData.files)
        }
    }
 
    sendChat(text) {
        const data = {
            _id: this.props.selected,
            user: this.state.user._id,
            message: text,
            timestamp: new Date().toLocaleString(),
            name: this.state.user.name,
            community: this.state.communityName,
            token: localStorage.getItem('token')
        }
        const socket = this.state.socket;
        socket.emit('chat', data);
    }

    notificationChat = (title, option) => {
        // Let's check if the browser supports notifications
        if (!("Notification" in window)) {
        //   alert("This browser does not support desktop notification");
        }
        
        // Let's check whether notification permissions have already been granted
        else if (Notification.permission === "granted") {
            // If it's okay let's create a notification
            new Notification(title, option);
        }
        
        // Otherwise, we need to ask the user for permission
        else if (Notification.permission !== "denied") {
            Notification.requestPermission()
        }
        
        // At last, if the user has denied notifications, and you 
        // want to be respectful there is no need to bother them any more.
      }

    chatList() {
        return this.state.rawChats.map((chat, index, array) => {
            const user = this.state.users[this.state.users.map( u => {return u._id}).indexOf(chat.user)]
            if (index !== 0 && new Date(array[index - 1].timestamp).getMinutes() === new Date(chat.timestamp).getMinutes() && array[index - 1].user === chat.user) {
                return <Chat key={index} sender={user === undefined ? '' : chat.user === this.state.user._id ? 'me' : 'other'} user={user} message={chat.message} time={chat.timestamp} recent={true} id={index} mobile={this.props.mobile}/>
            }
            else {
                return <Chat key={index} sender={user === undefined ? '' : chat.user === this.state.user._id ? 'me' : 'other'} user={user} message={chat.message} time={chat.timestamp} recent={false} id={index} mobile={this.props.mobile}/>
            }
        })
    }

    memberList() {
        return this.state.users.map((member, i) => {
            if (member.name !== '')
            return <div key={i} className='other member'>
            <table>
                <tbody>
                    <tr>
                        <td rowSpan='2'>
                            <div style={{position:"relative"}}>
                                <img src={member.picture} className="profilePic"
                                loading="lazy"/>
                                <img src={member._id === this.state.user._id ? "https://img.icons8.com/emoji/24/000000/green-circle-emoji.png" : "https://img.icons8.com/emoji/24/000000/black-circle-emoji.png"}/>
                            </div>
                        </td>
                        <td>
                            <p className='name'>{member.name}</p>
                        </td>
                    </tr>
                    <tr>
                        <td colSpan='2'>
                            <p className='message'>{member._id === this.state.user._id ? 'online' : 'offline'}</p>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        })
    }
    
    chat() {
        const onKeyPress = (e) => {
            if (e.charCode === 13) {
                if (e.target.value !== '')
                if (e.target.value.trim().length !== 0) {
                    this.sendChat(e.target.value)
                    e.target.value = ''
                    this.setState({ isTyping: false })
                }
            }
        }
        const onChange = (e) => {
            if (e.target.value !== '') this.setState({ isTyping: true })
            else this.setState({ isTyping: false })
        }
        const onScroll = (element) => {
            this.setState({
                scrollPosition: element.target.scrollTop
            })
            element.preventDefault()
            if (element.target.scrollHeight - element.target.scrollTop <= element.target.clientHeight) this.setState({
                bottom: true
            })
            else if (element.target.scrollTop <= 0 && !this.state.top) {
                this.getRawChat()
                this.setState({
                    top: true
                })
            }
            else {
                if (this.state.bottom)
                this.setState({
                    bottom: false
                })
            }
        }
        const uploadHandler = e => {
            e.preventDefault()
            const selectedFile = e.target.files
            this.uploadImage(selectedFile)
        }

        const switchToAudio = () => {
            this.setState({chat: 'audio'})
        }
        const switchToVideo = () => {
            this.setState({chat: 'video'})
        }

        if (this.props.selected !== 0)
        return (
            this.props.mobile 
            ? <div>
                <div id='chat' className='chatMobile' onScroll={onScroll.bind(this)}>
                    {this.chatList()}
                </div>
                <div className='typing'>
                    {this.state.whosTyping !== [] && this.state.whosTyping.map((user, i) => {
                        return <p key={i}><b>{user}</b> is typing
                        <div class="loading">
                            <div class="loading__circle"></div>
                            <div class="loading__circle"></div>
                            <div class="loading__circle"></div>
                        </div></p>
                    })}
                </div>
                <div className='scrollMobile'>
                    {!this.state.bottom && <button onClick={this.scrollToBottom.bind(this, 10)}>&#8595;</button>}
                </div>
                <div className='chatboxMobile'>
                    <label className="fileContainer">
                        &#x2295;
                        <input type="file" onChange={uploadHandler.bind(this)} accept="image/png,image/gif,image/jpeg" multiple/>
                    </label>
                    <input id='chatbox' type='text' placeholder='type here' onKeyPress={onKeyPress.bind(this)} onChange={onChange.bind(this)}/>
                    <img onClick={switchToAudio} src='https://img.icons8.com/material/24/000000/phone--v1.png' alt='audiocall'/>
                    <img onClick={switchToVideo} src='https://img.icons8.com/material/24/000000/video-call--v1.png' alt='videocall'/>
                </div>
            </div>
            :
            <div>
                <div className='memberList'>
                    {this.memberList()}
                </div>
                <div className={this.props.hide ? 'chat expand' : 'chat'}>
                    <div id='dragZone' className={this.props.hide ? 'expand' : ''}>
                        Drop image here
                    </div>
                    <div id='chat' className='chatDesktop' onScroll={onScroll.bind(this)}>
                        {this.chatList()}
                    </div>
                    <div className='typing'>
                        {this.state.whosTyping !== [] && this.state.whosTyping.map((user, i) => {
                            return <p key={i}><b>{user}</b> is typing 
                            <div className="loading">
                                <div className="loading__circle"></div>
                                <div className="loading__circle"></div>
                                <div className="loading__circle"></div>
                            </div></p>
                        })}
                    </div>
                    <div className='scroll'>
                        {!this.state.bottom && <button onClick={this.scrollToBottom.bind(this, 10)}>&#8595;</button>}
                    </div>
                    <div className='chatbox'>
                        <label className="fileContainer">
                            &#x2295;
                            <input type="file" onChange={uploadHandler.bind(this)} accept="image/png,image/gif,image/jpeg" multiple/>
                        </label>
                        <input id='chatbox' type='text' placeholder='type here' onKeyPress={onKeyPress.bind(this)} onChange={onChange.bind(this)}/>
                        <img onClick={switchToAudio} src='https://img.icons8.com/material/24/000000/phone--v1.png' alt='audiocall'/>
                        <img onClick={switchToVideo} src='https://img.icons8.com/material/24/000000/video-call--v1.png' alt='videocall'/>
                    </div>
                </div>
            </div>
        )
        else 
        return (
            this.props.mobile 
            ? <div>
                <div id='chat' className='chatMobile' onScroll={onScroll.bind(this)}>
                    {this.chatList()}
                </div>
                <div className='typing'>
                    {this.state.whosTyping !== [] && this.state.whosTyping.map((user, i) => {
                        return <p key={i}><b>{user}</b> is typing
                        <div class="loading">
                            <div class="loading__circle"></div>
                            <div class="loading__circle"></div>
                            <div class="loading__circle"></div>
                        </div></p>
                    })}
                </div>
                <div className='scrollMobile'>
                    {!this.state.bottom && <button onClick={this.scrollToBottom.bind(this, 10)}>&#8595;</button>}
                </div>
                <div className='chatboxMobile'>
                    <label className="fileContainer">
                        &#x2295;
                        <input type="file" onChange={uploadHandler.bind(this)} accept="image/png,image/gif,image/jpeg" multiple/>
                    </label>
                    <input id='chatbox' type='text' placeholder='type here' onKeyPress={onKeyPress.bind(this)} onChange={onChange.bind(this)}/>
                </div>
            </div>
            :
            <div className={this.props.hide ? 'chat expand welcome' : 'chat welcome'}>
                <div id='chat' className='chatDesktop' onScroll={onScroll.bind(this)}>
                    <Chat sender='bot' message={'https://firebasestorage.googleapis.com/v0/b/wads-final-project.appspot.com/o/images%2Fgroups%2F5eb28952a2c4911527f3739b%2Fimage.png?alt=media&token=ba011bb8-c516-4ad3-8bf3-ffb169ae79a0'} recent={false} mobile={this.props.mobile}/>
                    <Chat sender='bot' message={'Greetings new user!'} recent={true} mobile={this.props.mobile}/>
                    <Chat sender='bot' message={''} recent={true} mobile={this.props.mobile}/>
                    <Chat sender='bot' message={'**What is YANTOO?**'} recent={true} mobile={this.props.mobile}/>
                    <Chat sender='bot' message={'YANTOO, which stands for "You Are Not The Only One", is a web chat application for helping people find a community.'} recent={true} mobile={this.props.mobile}/>
                    <Chat sender='bot' message={''} recent={true} mobile={this.props.mobile}/>
                    <Chat sender='bot' message={'**Get Started**'} recent={false} mobile={this.props.mobile} time={'Please help, I was forced to work here.'}/>
                    <Chat sender='bot' message={'Click the search icon on the left and start typing the community you are looking for!'} recent={true} mobile={this.props.mobile}/>
                    <Chat sender='bot' message={''} recent={true} mobile={this.props.mobile}/>
                    <Chat sender='bot' message={'**Tips & Tricks**'} recent={true} mobile={this.props.mobile}/>
                    <Chat sender='bot' message={'Click the community icon on the left to expand the chat.'} recent={true} mobile={this.props.mobile}/>
                    <Chat sender='bot' message={''} recent={true} mobile={this.props.mobile}/>
                    <Chat sender='bot' message={'<i>Italic</i> = &#42;text&#42;'} recent={true} mobile={this.props.mobile}/>
                    <Chat sender='bot' message={'<b>Bold</b> = &#42;&#42;text&#42;&#42;'} recent={true} mobile={this.props.mobile}/>
                    <Chat sender='bot' message={'<b><i>BoldItalic</i></b> = &#42;&#42;&#42;text&#42;&#42;&#42;'} recent={true} mobile={this.props.mobile}/>
                    <Chat sender='bot' message={'<del>Strikethrough</del> = &#126;&#126;text&#126;&#126;'} recent={true} mobile={this.props.mobile}/>
                    <Chat sender='bot' message={'<code>Monospace</code> = &#96;&#96;&#96;text&#96;&#96;&#96;'} recent={true} mobile={this.props.mobile}/>
                    <Chat sender='bot' message={''} recent={true} mobile={this.props.mobile}/>
                    <Chat sender='bot' message={'Click an image to enlarge.'} recent={true} mobile={this.props.mobile}/>
                    <Chat sender='bot' message={''} recent={true} mobile={this.props.mobile}/>
                    <Chat sender='bot' message={'You can drag & drop images/files into the chat.'} recent={true} mobile={this.props.mobile}/>
                    <Chat sender='bot' message={'**Project Source**'} recent={false} mobile={this.props.mobile} time={'Oh crap, he is here! *BLEEP BLOOP* Eris senpai is the best.'}/>
                    <Chat sender='bot' message={'https://github.com/GetLiberated/WADS-Final-Project'} recent={true} mobile={this.props.mobile}/>
                </div>
                <div className='scroll'>
                    {!this.state.bottom && <button onClick={this.scrollToBottom.bind(this, 10)}>&#8595;</button>}
                </div>
                <div className='chatbox'>
                    <input id='chatbox' type='text' placeholder='Read only.' style={{paddingLeft: 10}} disabled/>
                </div>
            </div>
        )
    }

    audioChat() {
        // const getMicrophone = async () => {
        //     const audio = await navigator.mediaDevices.getUserMedia({
        //       audio: true,
        //       video: false
        //     })
        //     .then(stream => {
        //         this.setState({ audio: stream });
        //     })
        // }
    
        // const stopMicrophone = () => {
        //     this.state.audio.getTracks().forEach(track => track.stop());
        //     this.setState({ audio: null });
        // }
    
        const toggleMicrophone = () => {
            let mic = this.state.audio.getTracks()[0]
            if (mic.enabled) {
                document.getElementById('mic').src = 'https://img.icons8.com/material/48/000000/no-microphone.png'
                document.getElementById('userStream').getElementsByTagName('div')[0].style.opacity = 0.2
                mic.enabled = false;
            }
            else {
                document.getElementById('mic').src = 'https://img.icons8.com/material-sharp/48/000000/microphone.png'
                document.getElementById('userStream').getElementsByTagName('div')[0].style.opacity = 1
                mic.enabled = true;
            }
        }

        const back = () => {
            this.state.peer.destroy()
            // if (this.state.streams.length === 0) {
            //     this.state.audio.getTracks().forEach(track => track.stop());
            //     this.setState({chat: 'text', peer: null, audio: null})
            // }
            // else 
            window.location.reload()
        }
        
        return (
            this.props.mobile ?
            <div style={{overflow: 'auto', webkitOverflowScrolling: 'touch', marginTop: 50}}>
                {this.state.streams}
                <div className='stream' id='userStream'>
                    <br/>
                    {this.state.audio && <AudioAnalyser audio={this.state.audio} />}
                    <div style={{opacity: 1}}>
                        <img onClick={toggleMicrophone} id='mic' src='https://img.icons8.com/material-sharp/48/000000/microphone.png' alt='mic'/>
                    </div>
                </div>
            </div>
            :
            <div style={{overflow: 'auto'}}>
                <button onClick={back} className='backButton'>&#10094; Back</button>
                <div style={{marginLeft: 120}}>
                    {this.state.streams}
                    {this.state.audio && <div className='stream' id='userStream'>
                        <br/>
                        <AudioAnalyser audio={this.state.audio} />
                        <div style={{opacity: 1}}>
                            <img onClick={toggleMicrophone} id='mic' src='https://img.icons8.com/material-sharp/48/000000/microphone.png' alt='mic'/>
                        </div>
                    </div>}
                </div>
            </div>
        );
    }

    disconnect = (e) => {
        e.preventDefault();
        if (this.state.chat !== 'text') this.state.peer.destroy()
    }

    requestPermission(type) {
        this.setState({ peer: new Peer(this.state.user._id, {
            host: window.PEER_URL,
            port: window.PEER_PORT,
            secure: window.PEER_PORT === 443 ? true : false,
            path: '/peer',
            // debug: 3
          })
        })
        let permission = {}
        if (type === 'video') permission = { video: true, audio: true }
        else permission = { video: false, audio: true }
        navigator.mediaDevices.getUserMedia(permission)
        .then(stream => {
            if (type === 'video') {
                this.setState({ video: stream })
                this.localVideo.srcObject = stream;
                if (!JSON.parse(localStorage.getItem('client')).hide) {
                    document.getElementById('clickMe').click()
                    document.getElementsByClassName('speech-bubble')[0].style.width = '150px'
                    document.getElementsByClassName('speech-bubble')[0].style.display = 'block'
                    document.getElementsByClassName('speech-bubble')[0].style.opacity = 1
                    document.getElementsByClassName('speech-bubble')[0].style.left = '92px'
                    document.getElementsByClassName('speech-bubble')[0].innerHTML = 'Click here to view list'
                    setTimeout(() => {
                        document.getElementsByClassName('speech-bubble')[0].style.opacity = 0
                        document.getElementsByClassName('speech-bubble')[0].style.left = '110px'
                        setTimeout(() => {
                            document.getElementsByClassName('speech-bubble')[0].style.display = 'none'      
                        }, 1000)
                    }, 5000)
                    
                }
            }
            else this.setState({ audio: stream })

            const socket = this.state.socket;
            const peer = this.state.peer
            const data = {
                _id: this.props.selected,
                user: this.state.user._id,
                name: this.state.user.name
            }
            if (type === 'video') {
                socket.emit('video', data)
                socket.on('video_'+this.props.selected, data => {
                    if (data.user !== this.state.user._id) {
                        const call = peer.call(data.user, this.state.video, { metadata: { name: this.state.user.name } })
                        call.on('stream', (remoteStream) => {
                            // Show stream in some <video> element.
                            // this.remoteVideo.srcObject = remoteStream;
                            if (!this.state.streams.find(stream => stream.key === data.user)) {
                                this.setState(prevState => ({
                                    streams: [...prevState.streams, <div key={data.user} className='videoStream' id={data.user}>
                                    <p >{data.name}</p>
                                    <video playsInline ref={video => { video.srcObject = remoteStream }} autoPlay id={data.user+'_video'}/>
                                    </div>]
                                }))
                            }
                            else {
                                document.getElementById(data.user).style.display = 'inline-block'
                                document.getElementById(data.user+'_video').srcObject = remoteStream
                            }
                        })
                        call.on('close', (remoteStream) => {
                            // let streams = [...this.state.streams];
                            // let index = 0
                            // streams.forEach((el, i) => {
                            //     if (!el.active) index = i
                            // })
                            // streams.splice(index, 1)
                            // this.setState({streams});

                            // // 1. Make a shallow copy of the items
                            // let streams = [...this.state.streams];
                            // // 2. Make a shallow copy of the item you want to mutate
                            // let index = streams.map( s => {return s.key}).indexOf(data)
                            // let stream = {...streams[index]};
                            // // 3. Replace the property you're intested in
                            // stream.props.height = 0
                            // stream.props.width = 0
                            // // 4. Put it back into our array. N.B. we *are* mutating the array here, but that's why we made a copy first
                            // streams[index] = stream;
                            // // 5. Set the state to our new copy
                            // this.setState({ streams });

                            // ternyata bisa pake ini doang :)
                            document.getElementById(data.user).style.display = 'none'
                        })
                    }
                });
            }
            else {
                socket.emit('audio', data)
                socket.on('audio_'+this.props.selected, data => {
                    if (data.user !== this.state.user._id) {
                        const call = peer.call(data.user, this.state.audio, { metadata: { name: this.state.user.name } })
                        call.on('stream', (remoteStream) => {
                            this.setState(prevState => ({
                                streams: [...prevState.streams, <div key={data.user} className='stream' id={data.user}>
                                    <p >{data.name}</p>
                                    <audio ref={audio => { audio.srcObject = remoteStream }} style={{display: 'none'}} controls volume="true" autoPlay/>
                                    <AudioAnalyser audio={remoteStream} />
                                    </div>
                                ]
                            }))
                        })
                        call.on('close', (remoteStream) => {
                            document.getElementById(data.user).style.display = 'none'
                        })
                    }
                })
            }

            peer.on('call', (call) => {
                if (type === 'video') call.answer(this.state.video);
                else call.answer(this.state.audio);
                call.on('stream', (remoteStream) => {
                    if (type === 'video') {
                        if (!this.state.streams.find(stream => stream.key === remoteStream.id)) {
                            this.setState(prevState => ({
                                streams: [...prevState.streams, <div className='videoStream' key={remoteStream.id} id={remoteStream.id}>
                                <p >{call.metadata.name}</p>
                                <video playsInline key={remoteStream.id} ref={video => { video.srcObject = remoteStream }} autoPlay id={remoteStream.id+'_video'}/>
                                </div>]
                            }))
                        }
                    }
                    else this.setState(prevState => ({
                        streams: [...prevState.streams, <div className='stream' key={remoteStream.id} id={remoteStream.id}>
                            <p >{call.metadata.name}</p>
                            <audio ref={audio => { audio.srcObject = remoteStream }} style={{display: 'none'}} controls volume="true" autoPlay id={remoteStream.id+'_audio'}/>
                            <AudioAnalyser audio={remoteStream} />
                            </div>]
                    }))
                });
                call.on('close', (remoteStream) => {
                    this.state.streams.forEach(stream => {
                        if (type === 'video') {
                            let video = document.getElementById(stream.key+'_video')
                            setTimeout(() => {
                                if (!video.srcObject.active) document.getElementById(stream.key).style.display = 'none'
                            }, 500)
                        }
                        else {
                            let audio = document.getElementById(stream.key+'_audio')
                            setTimeout(() => {
                                if (!audio.srcObject.active) document.getElementById(stream.key).style.display = 'none'
                            }, 500)
                        }
                    })
                })
            });
        })
        .catch(error => {
            console.warn(error.message);
        })
    }

    videoChat() {
        const toggleMicrophone = () => {
            let mic = this.state.video.getTracks()[this.state.video.getTracks().map(track => {return track.kind}).indexOf('audio')]
            if (mic.enabled) {
                document.getElementById('mic').src = 'https://img.icons8.com/material/48/000000/no-microphone.png'
                mic.enabled = false;
            }
            else {
                document.getElementById('mic').src = 'https://img.icons8.com/material-sharp/48/000000/microphone.png'
                mic.enabled = true;
            }
        }
        const toggleCamera = () => {
            let mic = this.state.video.getTracks()[this.state.video.getTracks().map(track => {return track.kind}).indexOf('video')]
            if (mic.enabled) {
                document.getElementById('cam').src = 'https://img.icons8.com/material/48/000000/no-video--v1.png'
                mic.enabled = false;
                // mic.stop()
            }
            else {
                document.getElementById('cam').src = 'https://img.icons8.com/material/48/000000/video-call--v1.png'
                mic.enabled = true;
                // navigator.mediaDevices.getUserMedia({video: true})
                // .then(stream => {
                //     this.setState({ video: stream })
                //     this.localVideo.srcObject = stream;
                // })
            }
        }
        const back = () => {
            this.state.peer.destroy()
            // if (this.state.streams.length === 0) {
            //     this.state.audio.getTracks().forEach(track => track.stop());
            //     this.setState({chat: 'text', peer: null, audio: null})
            // }
            // else 
            window.location.reload()
        }
        
        return (
            this.props.mobile ?
            <div style={{overflow: 'auto', webkitOverflowScrolling: 'touch', marginTop: 50}}>
                {this.state.streams}
                <div id='userStream'>
                    <br/>
                    <video playsInline muted ref={(ref) => {this.localVideo = ref}} autoPlay/>
                    <div>
                        <img onClick={toggleMicrophone} id='mic' src='https://img.icons8.com/material-sharp/48/000000/microphone.png' alt='mic'/>
                        <img onClick={toggleCamera} id='cam' src='https://img.icons8.com/material/48/000000/video-call--v1.png' alt='cam'/>
                    </div>
                </div>
            </div>
            :
            <div style={{overflow: 'auto'}}>
                <button onClick={back} className='backButton'>&#10094; Back</button>
                <div style={{marginLeft: 120}}>
                    {this.state.streams}
                    <div id='userStream'>
                        <br/>
                        <video playsInline muted ref={(ref) => {this.localVideo = ref}} autoPlay/>
                        <div>
                            <img onClick={toggleMicrophone} id='mic' src='https://img.icons8.com/material-sharp/48/000000/microphone.png' alt='mic'/>
                            <img onClick={toggleCamera} id='cam' src='https://img.icons8.com/material/48/000000/video-call--v1.png' alt='cam'/>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    render() {
        if (this.state.user !== undefined && this.state.rawChats !== undefined && this.state.members !== []) {
            return this.state.chat === 'text'
            ? this.chat()
            : this.state.chat === 'audio'
            ? this.audioChat()
            : this.state.chat === 'video'
            && this.videoChat()
        }
        else if (this.props.selected === 0) return this.chat()
        return null
    }
}