import React from 'react'
import axios from 'axios'
import './styles.css'

import Chat from './chat'
import AudioAnalyser from './AudioVisualiser/AudioAnalyser';

export default class Community extends React.Component{
    constructor(props) {
        super(props);
    
        this.state = {
            user: undefined,
            // unsortedChats: [],
            // sortedChats : undefined,
            socket: window.SOCKET,
            rawChats: undefined,
            users: [],
            chats: [],
            chat: 'text',
            audio: null,
            isTyping: false,
            whosTyping: [],
            bottom: true,
            communityName: undefined
        }
    }
    
    componentDidMount() {
        this.loadChat()
        // this.interval = setInterval(() => this.fetchChat(), 1000);
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
    }

    // componentWillUnmount() {
    //     clearInterval(this.interval);
    // }

    async loadChat() {
        if (parseInt(this.props.selected) > 3) {
            this.setState({
                rawChats: undefined,
                chats: []
            })
            const token = JSON.parse(localStorage.getItem("JSONWebToken"))
            this.setState({
                user: token._id
            })
            await axios.get(window.API_URL+'/community/'+this.props.selected)
            .then(res => {
                this.setState({
                    rawChats: res.data.chat,
                    communityName: res.data.name
                })
            })
            const promises = this.state.rawChats.map(chat => {
                if (chat.user !==  '')
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
                this.fetchChat()
                this.typingChat()
                this.fetchUser()
            })
        }
        // console.log(this.state.rawChats)
        // if (parseInt(this.props.selected) > 3) {
        //     this.setState({
        //         unsortedChats: [],
        //         sortedChats : undefined
        //     })
        //     const currentUser = localStorage.getItem("userSession")
        //     if (currentUser)
        //     axios.post(window.API_URL+'/user/token', JSON.parse(currentUser))
        //     .then(res => {
        //         this.setState({
        //             user: res.data
        //         })
        //         axios.get(window.API_URL+'/community/'+this.props.selected)
        //         .then(res => {
        //             res.data.chat.map((x, index) => {
        //                 if (x.user !== '' && this.state.unsortedChats !== [])
        //                 axios.get(window.API_URL+'/user/'+x.user)
        //                 .then(user => {
        //                     this.setState({
        //                         unsortedChats: [...this.state.unsortedChats, <Chat key={index} sender={x.user === this.state.user._id ? 'me' : 'other'} user={user.data} message={x.message} time={x.timestamp}/>]
        //                     })
        //                     this.setState({
        //                         sortedChats: this.state.unsortedChats.sort((a, b) => {
        //                             var x = parseInt(a.key); var y = parseInt(b.key);
        //                             return ((x > y) ? 1 : ((x < y) ? -1 : 0))
        //                         })
        //                     })
        //                     const bottom = document.getElementById('chat')
        //                     bottom.scrollTop = bottom.scrollHeight
        //                 })
        //                 else this.setState({
        //                     unsortedChats: [<Chat key={index} sender='' time={x.timestamp}/>],
        //                     sortedChats: [<Chat key={index} sender='' time={x.timestamp}/>]
        //                 })
        //             })
        //         })
        //         .catch(err => console.log(err))
        //     })
        //     .catch(err => console.log(err))
        //     }
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
                rawChats: [...this.state.rawChats, data]
            })
            this.processChat()
        });
        // if (parseInt(this.props.selected) > 3) {
        //     if (this.state.sortedChats !== undefined) {
        //         const lastChat = this.state.sortedChats[this.state.sortedChats.length -1]
        //         const obj = {
        //             timestamp: lastChat.props.time
        //         }
        //         axios.post(window.API_URL+'/community/chat/'+this.props.selected, obj)
        //         .then(res => {
        //             if (res.data)
        //             axios.get(window.API_URL+'/user/'+res.data.user)
        //             .then(user => {
        //                 this.setState({
        //                     sortedChats: [...this.state.sortedChats, <Chat key={parseInt(lastChat.key)+1} sender={res.data.user === this.state.user._id ? 'me' : 'other'} user={user.data} message={res.data.message} time={res.data.timestamp}/>]
        //                 })
        //                 const bottom = document.getElementById('chat')
        //                 bottom.scrollTop = bottom.scrollHeight
        //             })
        //         })
        //         .catch(err => console.log(err))
        //     }
        // }
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
    
    processChat() {
        this.state.rawChats.slice(this.state.chats.length, this.state.rawChats.length).map((chat, index, array) => {
            const user = this.state.users[this.state.users.map( u => {return u._id}).indexOf(chat.user)]
            if (index !== 0)
            if (new Date(array[index - 1].timestamp).getMinutes() === new Date(chat.timestamp).getMinutes() && array[index - 1].user === chat.user) {
                // let chats = [...this.state.chats];
                // let prevChat = {...chats[chats.length - 1]};
                // // prevChat.props.message+='lol'
                // console.log(prevChat)
                this.setState({
                    chats: [...this.state.chats, <Chat key={index} sender={user === undefined ? '' : chat.user === this.state.user ? 'me' : 'other'} user={user} message={chat.message} time={chat.timestamp} recent={true}/>]
                })
            }
            else this.setState({
                chats: [...this.state.chats, <Chat key={index} sender={user === undefined ? '' : chat.user === this.state.user ? 'me' : 'other'} user={user} message={chat.message} time={chat.timestamp} recent={false}/>]
            })
        })
        this.scrollChat()
    }

    scrollChat() {
        const bottom = document.getElementById('chat')
        bottom.scrollTop = bottom.scrollHeight
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
        // axios.post(window.API_URL+'/community/chat', obj)
        // .then(() => this.fetchChat())
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
            else {
                if (this.state.bottom)
                this.setState({
                    bottom: false
                })
            }
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
                    {/* {this.state.sortedChats} */}
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
                <div id='chat' style={{height: 'calc(100vh - 50px)', overflowY: 'scroll'}} onScroll={onScroll.bind(this)}>
                    {/* {this.state.sortedChats} */}
                    {this.state.chats}
                </div>
                <div className='typing'>
                    {this.state.whosTyping !== [] && this.state.whosTyping.map((user, i) => {
                        return <p key={i}><b>{user}</b> is typing...</p>
                    })}
                </div>
                <div className='scroll'>
                    {!this.state.bottom && <button onClick={this.scrollChat.bind(this)}>&#8595;</button>}
                </div>
                <div className='chatbox'>
                    <input type='text' placeholder='type here' onKeyPress={onKeyPress.bind(this)} onChange={onChange.bind(this)}/>
                    <button onClick={switchToAudio.bind(this)}>Audio chat</button>
                    <button onClick={switchToVideo.bind(this)}>Video chat</button>
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
        // if (this.state.user !== undefined && this.state.unsortedChats !== []) {
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