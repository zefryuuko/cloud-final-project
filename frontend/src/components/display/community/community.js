import React from 'react'
import axios from 'axios';
import './styles.css'

import Chat from './chat'

export default class Community extends React.Component{
    constructor(props) {
        super(props);
    
        this.state = {
            user: undefined,
            unsortedChats: [],
            sortedChats : undefined
        }
    }

    loadChat() {
        if (parseInt(this.props.selected) > 3) {
            this.setState({
                unsortedChats: [],
                sortedChats : undefined
            })
            const currentUser = localStorage.getItem("userSession")
            if (currentUser)
            axios.post(process.env.REACT_APP_API_URL+'/user/token', JSON.parse(currentUser))
            .then(res => {
                this.setState({
                    user: res.data
                })
                axios.get(process.env.REACT_APP_API_URL+'/community/'+this.props.selected)
                .then(res => {
                    res.data.chat.map((x, index) => {
                        if (x.user !== '' && this.state.unsortedChats !== [])
                        axios.get(process.env.REACT_APP_API_URL+'/user/'+x.user)
                        .then(user => {
                            this.setState({
                                unsortedChats: [...this.state.unsortedChats, <Chat key={index} sender={x.user === this.state.user._id ? 'me' : 'other'} user={user.data} message={x.message} time={x.timestamp}/>]
                            })
                            this.setState({
                                sortedChats: this.state.unsortedChats.sort((a, b) => {
                                    var x = parseInt(a.key); var y = parseInt(b.key);
                                    return ((x > y) ? 1 : ((x < y) ? -1 : 0))
                                })
                            })
                            const bottom = document.getElementById('chat')
                            bottom.scrollTop = bottom.scrollHeight
                        })
                        else this.setState({
                            unsortedChats: [<Chat key={index} sender='' time={x.timestamp}/>],
                            sortedChats: [<Chat key={index} sender='' time={x.timestamp}/>]
                        })
                    })
                })
                .catch(err => console.log(err))
            })
            .catch(err => console.log(err))
        }
    }

    fetchChat() {
        if (parseInt(this.props.selected) > 3) {
            if (this.state.sortedChats !== undefined) {
                const lastChat = this.state.sortedChats[this.state.sortedChats.length -1]
                const obj = {
                    timestamp: lastChat.props.time
                }
                axios.post(process.env.REACT_APP_API_URL+'/community/chat/'+this.props.selected, obj)
                .then(res => {
                    if (res.data)
                    axios.get(process.env.REACT_APP_API_URL+'/user/'+res.data.user)
                    .then(user => {
                        this.setState({
                            sortedChats: [...this.state.sortedChats, <Chat key={parseInt(lastChat.key)+1} sender={res.data.user === this.state.user._id ? 'me' : 'other'} user={user.data} message={res.data.message} time={res.data.timestamp}/>]
                        })
                        const bottom = document.getElementById('chat')
                        bottom.scrollTop = bottom.scrollHeight
                    })
                })
                .catch(err => console.log(err))
            }
        }
    }
    
    componentDidMount() {
        this.loadChat()
        this.interval = setInterval(() => this.fetchChat(), 1000);
    }

    componentDidUpdate(prevProps) {
        if (this.props.selected !== prevProps.selected)
        this.loadChat()
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }
    
    sendChat(text) {
        const obj = {
            _id: this.props.selected,
            user: this.state.user._id,
            message: text,
            timestamp: new Date().toLocaleString()
        }
        axios.post(process.env.REACT_APP_API_URL+'/community/chat', obj)
        .then(() => this.fetchChat())
    }
    
    chat() {
        const onKeyPress = (e) => {
            if (e.charCode === 13) {
                if (e.target.value !== '')
                if (e.target.value.trim().length !== 0) {
                    this.sendChat(e.target.value)
                    e.target.value = ''
                }
            }
        }

        return (
            this.props.mobile ?
            <div>
                <div id='chat' style={{height: 'calc(100vh - 200px)', overflowY: 'scroll'}}>
                    {this.state.sortedChats}
                </div>
                <div className='chatboxMobile'>
                    <input type='text' placeholder='type here' onKeyPress={onKeyPress.bind(this)}></input>
                </div>
            </div>
            :
            <div>
                <div id='chat' style={{height: 'calc(100vh - 50px)', overflowY: 'scroll'}}>
                    {this.state.sortedChats}
                </div>
                <div className='chatbox'>
                    <input type='text' placeholder='type here' onKeyPress={onKeyPress.bind(this)}></input>
                </div>
            </div>
        )
    }

    render() {
        if (this.state.user !== undefined && this.state.unsortedChats !== []) {
            return this.chat()
        }
        return null
    }
}