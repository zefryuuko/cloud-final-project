import React from 'react'
import axios from 'axios'
import {storage} from "../../../firebase/firebase"
import './styles.css'
import smoothscroll from 'smoothscroll-polyfill';
 
import Chat from './chat'
import AudioAnalyser from './AudioVisualiser/AudioAnalyser';

// kick off the polyfill!
smoothscroll.polyfill();

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
            isTyping: false,
            whosTyping: [],
            bottom: false,
            top: false,
            chat: 'text',
            audio: null,
        }
    }
    
    async componentDidMount() {
        await this.loadChat()
        window.addEventListener("drop", this.dropImage);
        window.addEventListener('paste', this.pasteImage);
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
    }

    componentWillUnmount() {
        window.removeEventListener('drop', this.dropImage)
        window.removeEventListener('paste', this.pasteImage)
    }
    
    async loadChat() {
        if (parseInt(this.props.selected) > 3) {
            // Flush saved raw chat if any from previous column
            this.setState({
                rawChats: [],
                chatLoaded: 0,
                isTyping: false,
                whosTyping: []
            })
            const token = localStorage.getItem("token")
            const obj = {
                token: token
            }
            await axios.post(window.API_URL+'/user/token', obj)
            .then(res => {
                this.setState({
                    user: res.data
                })
            })
            this.getRawChat(true)
        }
    }

    async getRawChat(firstTime = false) {
        // Get raw chat
        await axios.get(window.API_URL+'/community/'+this.props.selected)
        .then(res => {
            if (firstTime) this.setState({ communityName: res.data.name })
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
            return axios.get(window.API_URL+'/user/'+userID)
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
            if (this.state.top && this.state.chatLoaded !== undefined) this.setState({ top: false })
            if (firstTime) this.scrollToBottom()
        })
    }
        
    fetchChat() {
        const socket = this.state.socket;
        socket.on('chat', data => {
            if (this.state.user !== undefined)
            if (data.user !== this.state.user._id)
            this.notificationChat(data.name + ' (' + data.community + ')',{
                icon: 'http://cdn.sstatic.net/stackexchange/img/logos/so/so-icon.png',
                body: data.message,
            })
            this.setState(prevState => ({ rawChats: [...prevState.rawChats, data]}))
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
        e.preventDefault();
        this.uploadImage(e.clipboardData.files)
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