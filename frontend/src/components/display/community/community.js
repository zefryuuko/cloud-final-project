import React from 'react'
import axios from 'axios'
import {storage} from "../../../firebase/firebase"
import './styles.css'

import Chat from './chat'
import AudioAnalyser from './AudioVisualiser/AudioAnalyser';

export default class Community extends React.Component{
    constructor(props) {
        super(props);
    
        this.state = {
            user: undefined,
            socket: window.SOCKET,
            rawChats: undefined,
            users: [],
            chats: [],
            chat: 'text',
            audio: null,
            isTyping: false,
            whosTyping: [],
            bottom: true,
            top: false,
            communityName: undefined,
            chatLoaded: 0
        }
    }
    
    componentDidMount() {
        this.loadChat()
    }

    async componentDidUpdate(prevProps, prevState) {
        if (this.props.selected !== prevProps.selected) {
            await this.loadChat()
            if (parseInt(prevProps.selected) > 3) {
                const data = {
                    _id: prevProps.selected,
                    user: this.state.users[this.state.users.map( u => {return u._id}).indexOf(this.state.user)].name
                }
                const socket = this.state.socket;
                socket.emit('typing', false, data)
            }
        }
        if (this.state.isTyping !== prevState.isTyping) {
            const data = {
                _id: this.props.selected,
                user: this.state.users[this.state.users.map( u => {return u._id}).indexOf(this.state.user)].name
            }
            const socket = this.state.socket;
            if (this.state.isTyping) {
                socket.emit('typing', true, data)
            }
            else {
                socket.emit('typing', false, data)
            }
        }
        if (this.state.chats !== prevState.chats) {
            if (this.state.chats.length > 1) {
                const top = document.getElementById('newTop')
                if (top) top.scrollIntoView()
            }
            else if (this.state.chats.length === 1) {
                document.getElementById('newTop').id = 'top'
            }
        }
    }

    dragImage() {
        window.addEventListener("drop", (e) => {
            e.preventDefault();
            this.uploadImage(e.dataTransfer.files[0])
        }, false);
    }

    uploadImage(selectedFile) {
        const uploadTask = storage.ref(`/images/`+this.props.selected+`/${selectedFile.name}`).put(selectedFile)
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
            storage.ref('images/'+this.props.selected).child(selectedFile.name).getDownloadURL()
            .then(fireBaseUrl => {
                this.sendChat(fireBaseUrl)
            })
        })
    }

    async loadRawChat(firstTime = false) {
        await axios.get(window.API_URL+'/community/'+this.props.selected)
        .then(res => {
            if (firstTime) this.setState({
                communityName: res.data.name,
                chatLoaded: 0
            })
            const increment = 30
            const index = this.state.chatLoaded + increment
            this.setState({
                rawChats: res.data.chat.length > this.state.chatLoaded + increment ? res.data.chat.slice(res.data.chat.length - index, res.data.chat.length - this.state.chatLoaded) : res.data.chat.slice(0, res.data.chat.length - this.state.chatLoaded),
                chatLoaded: res.data.chat.length > this.state.chatLoaded + increment ? index : undefined
            })
        })
        const promises = this.state.rawChats.map(chat => {
            if (chat.user !==  '')
            // if (this.state.users.length !== 0)
            return axios.get(window.API_URL+'/user/'+chat.user) // Optimize this
            .then(user => {
                if (!this.state.users.map( u => {return u._id}).includes(chat.user)) {
                    const data = {
                        _id: chat.user,
                        name: user.data.name,
                        picture: user.data.picture
                    }
                    this.setState({
                        users: [...this.state.users, data]
                    })
                }
            })
        })
        Promise.all(promises)
        .then(() => {
            this.processChat()
            if (firstTime) {
                this.fetchChat()
                this.typingChat()
                this.fetchUser()
                this.dragImage()
                this.scrollChat(500)
            }
        })
    }

    async loadChat() {
        if (parseInt(this.props.selected) > 3) {
            this.setState({
                rawChats: undefined,
                chats: []
            })
            const token = localStorage.getItem("token")
            const obj = {
                token: token
            }
            await axios.post(window.API_URL+'/user/token', obj)
            .then(res => {
                this.setState({
                    user: res.data._id
                })
            })
            this.loadRawChat(true)
        }
    }
        
    fetchChat() {
        const socket = this.state.socket;
        socket.off('chat');
        socket.on('chat', data => {
            if (data.user !== this.state.user)
            this.notificationChat(data.name + ' (' + data.community + ')',{
                icon: 'http://cdn.sstatic.net/stackexchange/img/logos/so/so-icon.png',
                body: data.message,
            })
            this.setState({
                rawChats: [data]
            })
            this.processChat(true)
        });
    }

    fetchUser() {
        const socket = this.state.socket;
        socket.off('update');
        socket.on('update', data => {
            // 1. Make a shallow copy of the items
            let users = [...this.state.users];
            // 2. Make a shallow copy of the item you want to mutate
            let index = this.state.users.map( u => {return u._id}).indexOf(data._id)
            let user = {...users[index]};
            // 3. Replace the property you're intested in
            user.name = data.name
            // 4. Put it back into our array. N.B. we *are* mutating the array here, but that's why we made a copy first
            users[index] = user;
            // 5. Set the state to our new copy
            this.setState({users});
            this.setState({
                chats: []
            })
            this.processChat()
        })
    }
    
    async processChat(newChat = false) {
        let chats = []
        await this.state.rawChats.map((chat, index, array) => {
            const user = this.state.users[this.state.users.map( u => {return u._id}).indexOf(chat.user)]
            if (index !== 0 && new Date(array[index - 1].timestamp).getMinutes() === new Date(chat.timestamp).getMinutes() && array[index - 1].user === chat.user) {
                chats.push(<Chat key={index} sender={user === undefined ? '' : chat.user === this.state.user ? 'me' : 'other'} user={user} message={chat.message} time={chat.timestamp} recent={true} top={index === 0 && !newChat ? true : false}/>)
            }
            else {
                chats.push(<Chat key={index} sender={user === undefined ? '' : chat.user === this.state.user ? 'me' : 'other'} user={user} message={chat.message} time={chat.timestamp} recent={false} top={index === 0 && !newChat ? true : false}/>)
            }
        })
        this.setState(prevState => ({
            chats: newChat ? [...prevState.chats, chats] : [chats, ...prevState.chats]
        }))
        if (this.state.top && this.state.chatLoaded !== undefined) this.setState({ top: false })
        if (newChat) this.scrollChat(500)
    }

    scrollChat(interval = 0) {
        const scrollToBottom = () => {const bottom = document.getElementById('chat')
        bottom.scrollTop = bottom.scrollHeight}
        const stop = () => { clearInterval(stayAtBottom) }
        const stayAtBottom = setInterval(scrollToBottom, 10)
        setTimeout(stop, interval);
    }
    
    sendChat(text) {
        const data = {
            _id: this.props.selected,
            user: this.state.user,
            message: text,
            timestamp: new Date().toLocaleString(),
            name: this.state.users[this.state.users.map( u => {return u._id}).indexOf(this.state.user)].name,
            community: this.state.communityName
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

    typingChat() {
        const socket = this.state.socket;
        socket.off('typing');
        socket.on('typing', (isTyping, data) => {
            if (isTyping) {
                // if (data !== this.state.user)
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
            if (element.target.scrollHeight - element.target.scrollTop <= element.target.clientHeight) this.setState({
                bottom: true
            })
            else if (element.target.scrollTop <= 0 && !this.state.top) {
                this.loadRawChat()
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
            const selectedFile = e.target.files[0]
            this.uploadImage(selectedFile)
        }

        const switchToAudio = () => {
            this.setState({chat: 'audio'})
        }
        const switchToVideo = () => {
            this.setState({chat: 'video'})
        }

        return (
            this.props.mobile 
            ? <div>
                <div id='chat' style={{height: 'calc(100vh - 200px)', overflowY: 'scroll'}}>
                    {this.state.chats}
                </div>
                <div className='typing'>
                    {this.state.whosTyping !== [] && this.state.whosTyping.map((user, i) => {
                        return <p key={i}><b>{user}</b> is typing...</p>
                    })}
                </div>
                <div className='chatboxMobile'>
                <input type='text' placeholder='type here' onKeyPress={onKeyPress.bind(this)} onChange={onChange.bind(this)}/>
                </div>
            </div>
            :
            <div>
                <div id='dragZone'>
                    Drag and drop image here
                </div>
                <div id='chat' style={{height: 'calc(100vh - 50px)', overflowY: 'scroll'}} onScroll={onScroll.bind(this)}>
                    {this.state.chats}
                </div>
                <div className='typing'>
                    {this.state.whosTyping !== [] && this.state.whosTyping.map((user, i) => {
                        return <p key={i}><b>{user}</b> is typing...</p>
                    })}
                </div>
                <div className='scroll'>
                    {!this.state.bottom && <button onClick={this.scrollChat.bind(this, 10)}>&#8595;</button>}
                </div>
                <div className='chatbox'>
                    <label class="fileContainer">
                        &#x2295;
                        <input type="file" onChange={uploadHandler.bind(this)} accept="image/png,image/gif,image/jpeg"/>
                    </label>
                    <input type='text' placeholder='type here' onKeyPress={onKeyPress.bind(this)} onChange={onChange.bind(this)}  class="inputBox"/>
                    {/* <button onClick={switchToAudio.bind(this)}>Audio chat</button>
                    <button onClick={switchToVideo.bind(this)}>Video chat</button> */}
                </div>
            </div>
        )
    }

    audioChat() {
        const getMicrophone = async () => {
            const audio = await navigator.mediaDevices.getUserMedia({
              audio: true,
              video: false
            });
            this.setState({ audio });
        }
    
        const stopMicrophone = () => {
            this.state.audio.getTracks().forEach(track => track.stop());
            this.setState({ audio: null });
        }
    
        const toggleMicrophone = () => {
            if (this.state.audio) stopMicrophone();
            else getMicrophone();
        }
        
        return (
            <div>
                <div className="controls">
                    <button onClick={toggleMicrophone}>
                        {this.state.audio ? 'Stop microphone' : 'Get microphone input'}
                    </button>
                </div>
                {this.state.audio ? <AudioAnalyser audio={this.state.audio} /> : ''}
            </div>
        );
    }

    videoChat() {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(stream => {
            this.localVideo.srcObject = stream;
            this.localVideo.play()
        })
        .catch(error => {
            console.warn(error.message);
        })
        
        return (
            <div>
                <video ref={(ref) => {this.remoteVideo = ref}}></video>
                <video ref={(ref) => {this.localVideo = ref}}></video>
            </div>
        )
    }

    render() {
        if (this.state.user !== undefined && this.state.rawChats !== undefined) {
            return this.state.chat === 'text'
            ? this.chat()
            : this.state.chat === 'audio'
            ? this.audioChat()
            : this.state.chat === 'video'
            && this.videoChat()
        }
        return null
    }
}