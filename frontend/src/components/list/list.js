import React from 'react'
import axios from 'axios'

import SubList from './sublist'
import Display from '../display/display'
import Back from '../display/back'

export default class List extends React.Component{
    constructor(props) {
        super(props);
        
        this.state = {
            selected: '',
            communities: [],
            searchResult: [],
            viewMode: false,
            title: undefined,
            socket: window.SOCKET,
        }
    }

    // Change selected column on load
    componentWillReceiveProps(nextProps) {
        this.setState({
            selected: JSON.parse(localStorage.getItem('client')).index,
            viewMode: false
        });
        const searchQuery = nextProps.search
        if (searchQuery !== '') {
            if (nextProps.mode === 'search') {
                axios.get(window.COMMUNITY_URL+'/community/search/'+searchQuery)
                .then(res => {
                    this.setState({
                        searchResult: res.data
                    });
                })
                .catch(err => console.log(err))
            }
            if (nextProps.mode === 'community') {
                let communities = [];
                let regexp = undefined
                for (let i = 0; i < this.state.communities.length; i++) 
                {
                    regexp = new RegExp('.*' + searchQuery + '.*','i');
                    if (regexp.test(this.state.communities[i].name)) communities.push(this.state.communities[i])
                }
                this.setState({searchResult: communities})
            }
        }
        else if (nextProps.mode !== this.props.mode) {
            this.setState({
                searchResult: [],
                communities: []
            });
            this.loadCommunity()
        }
    }
    
    // componentDidMount() {
    //     this.interval = setInterval(() => this.fetchCommunity(), 1000);
    // }

    // componentWillUnmount() {
    //     clearInterval(this.interval);
    // }
    
    // Change display when clicking column
    callback = (childData, name) => {
        this.setState({
            selected: childData,
            viewMode: true,
            title: name
        })
        const client = {
            "mode": this.props.mode,
            "index": childData
        }
        localStorage.setItem("client", JSON.stringify(client))
    }

    back = () => {
        this.setState({
            viewMode: false
        })
    }

    // Create profile mode list
    profile() {
        const profileData = [
            {
                id: 1,
                name: 'View Profile'
            },
            {
                id: 2,
                name: 'My Community'
            },
            {
                id: 3,
                name: 'System Preferences'
            }
        ]
        const profileList = profileData.map(x => {
            return (
                <SubList mode='profile' name={x.name} id={x.id} selected={parseInt(this.state.selected) === x.id ? 'yes' : 'no'} callback={this.callback} mobile={this.props.mobile}/>
            )
        })
        return (
            <div className='profileWrapper' style={{paddingTop: this.props.mobile ? '' : '30px'}}>
                {profileList}
            </div>
        )
    }

    loadCommunity() {
        if (this.props.mode === 'community') {
            const token = localStorage.getItem("token")
            const obj = {
                token: token
            }
            axios.post(window.USER_URL+'/user/token', obj)
            .then(user => {
                const promises = user.data.communities.map(id => {
                    return axios.get(window.COMMUNITY_URL+'/community/'+id)
                    .then(community => {
                        if (!this.state.communities.map( c => {return c._id}).includes(id)) {// Optimize this
                            const data = {
                                _id: community.data._id,
                                name: community.data.name,
                                picture: community.data.picture,
                                preview: community.data.chat.length === 1 ? '' : community.data.chat[community.data.chat.length - 1].message,
                                timestamp: community.data.chat[community.data.chat.length - 1].timestamp
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
                .then(() => {
                    const sortedCommunities = this.state.communities.sort((a, b) => {
                        return new Date(b.timestamp) - new Date(a.timestamp);
                    })
                    this.setState({
                        communities: sortedCommunities
                    })
                    this.fetchCommunity()
                })
            })
        }
    }

    fetchCommunity() {
        const socket = this.state.socket;
        socket.on('list', data => {
        const index = this.state.communities.map( c => {return c._id}).indexOf(data._id)
        // 1. Make a shallow copy of the items
        let communities = [...this.state.communities];
        // 2. Make a shallow copy of the item you want to mutate
        let community = {...communities[index]};
        // 3. Replace the property you're intested in
        community.timestamp = data.timestamp
        community.preview = data.message
        // 4. Put it back into our array. N.B. we *are* mutating the array here, but that's why we made a copy first
        // communities[index] = community;
        communities.splice(index, 1)
        communities.splice(0, 0, community)
        // 5. Set the state to our new copy
        this.setState({communities});
    });
    }

    community() {
        if (this.state.communities.length === 0) this.loadCommunity()
        const onChange = (e) => {
            this.props.searchCallback(e.target.value)
        }
        // setTimeout(() => {
        //     const socket = this.state.socket;
        //     if (!socket.connected) {
        //         throw new Error('some error')
        //     }
        // }, 5000)
        let communities = undefined
        if (this.props.search === '') {
            communities = this.state.communities.map(community => {
                return <SubList mode='community' community={community} selected={this.state.selected === community._id ? 'yes' : 'no'} callback={this.callback} mobile={this.props.mobile}/>
            })
            communities.push(<SubList mode='welcome' selected={this.state.selected === 0 ? 'yes' : 'no'} callback={this.callback} mobile={this.props.mobile}/>)
        }
        else communities = this.state.searchResult.map(community => {
            return <SubList mode='community' community={community} selected={this.state.selected === community._id ? 'yes' : 'no'} callback={this.callback} mobile={this.props.mobile}/>
        })
        return (
            <div style={{animation: 'fadein 0.4s'}}>
                <input className="searchBox" type="text" placeholder="&#128269; Find my community" onChange={onChange.bind(this)}/>
                <div className='communityWrapper'>
                    {communities}
                </div>
            </div>
        ) 
    }
    
    search() {
        const onChange = (e) => {
            this.props.searchCallback(e.target.value)
        }
        const searchResult = this.state.searchResult.map(x => {
            return <SubList mode='search' name={x.name} id={x._id} picture={x.picture} selected={this.state.selected === x._id ? 'yes' : 'no'} callback={this.callback} mobile={this.props.mobile}/>
        })
        return (
            <div style={{animation: 'fadein 0.4s'}}>
                <input className="searchBox" type="text" placeholder="&#128269; Search community" onChange={onChange.bind(this)}/>
                {searchResult}
                <SubList mode='search' id={0} name={'Create a new community'} selected={parseInt(this.state.selected) === 0 ? 'yes' : 'no'} callback={this.callback} mobile={this.props.mobile}/>
            </div>
        ) 
    }

    render() {
        const style = {
            height: '100%',
            width: 500,
            position: 'fixed',
            top: 0,
            left: 0,
            // backgroundColor: 'rgb(240, 240, 240)',
            marginLeft: this.props.hide ? -580 : 80,
            overflowY: 'scroll',
            // opacity: this.props.hide ? 0 : 1,
            transition: 'all 0.4s ease'
        }

        const styleMobile = {
            height: 'calc((var(--vh, 1vh) * 100) - 60px)',
            overflowY: 'scroll',
            transition: 'all 0.4s ease',
            overflowX: 'hidden'
        }
        
        return (
            this.props.mobile ? 
            <div style={styleMobile}>
                {this.state.viewMode ?
                    <React.Fragment>
                        <Back name={this.state.title} callback={this.back}/>
                        <Display mode={this.props.mode} selected={this.state.selected} mobile={true}/> 
                    </React.Fragment>
                    : 
                    <div>
                        {this.props.mode === 'profile' && this.profile()}
                        {this.props.mode === 'community' && this.community()}
                        {this.props.mode === 'search' && this.search()}
                    </div>
                }
            </div>
            : 
            <div>
                <div style={style}>
                    {this.props.mode === 'profile' && this.profile()}
                    {this.props.mode === 'community' && this.community()}
                    {this.props.mode === 'search' && this.search()}
                </div>
                <Display mode={this.props.mode} selected={this.state.selected} mobile={false} hide={this.props.hide}/>
            </div>
        )
    }
}