import React from 'react'

import SubList from './sublist'
import Display from '../display/display'
import axios from 'axios';

import Back from '../display/back'

export default class List extends React.Component{
    constructor(props) {
        super(props);
        
        this.state = {
            selected: '',
            communitiesList: [],
            searchResult: [],
            viewMode: false,
            title: undefined
        }
    }

    // Change selected column on load
    componentWillReceiveProps(nextProps) {
        this.setState({
            selected: localStorage.getItem('index'),
            viewMode: false
        });
        const searchQuery = nextProps.search
        if (searchQuery !== '')
        axios.get(process.env.REACT_APP_API_URL+'/community/search/'+searchQuery)
        .then(res => {
            this.setState({
                searchResult: res.data
            });
        })
        .catch(err => console.log(err))
        else this.setState({
            searchResult: []
        });
    }
    
    componentDidMount() {
        this.interval = setInterval(() => this.fetchCommunity(), 1000);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }
    
    // Change display when clicking column
    callback = (childData, name) => {
        this.setState({
            selected: childData,
            viewMode: true,
            title: name
        })
        localStorage.setItem('index', childData)
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
                name: 'Profile'
            },
            {
                id: 2,
                name: 'Account'
            },
            {
                id: 3,
                name: 'Setting'
            }
        ]
        const profileList = profileData.map(x => {
            return (
                <SubList mode='profile' name={x.name} id={x.id} selected={parseInt(this.state.selected) === x.id ? 'yes' : 'no'} callback={this.callback} mobile={this.props.mobile}/>
            )
        })
        return profileList
    }

    fetchCommunity() {
        if (this.props.mode === 'community') {
            const currentUser = localStorage.getItem("userSession")
            if (currentUser)
            axios.post(process.env.REACT_APP_API_URL+'/user/token', JSON.parse(currentUser))
            .then(user => {
                user.data.communities.map((id, index) => {
                    axios.get(process.env.REACT_APP_API_URL+'/community/'+id)
                    .then(community => {
                        if (this.state.communitiesList[index] === undefined)
                        this.setState({
                            communitiesList: [...this.state.communitiesList, community]
                        })
                        else if (this.state.communitiesList[index].data !== community.data) {
                            let temp = this.state.communitiesList
                            temp[index] = community
                            this.setState({
                                communitiesList: temp
                            })
                        }
                    })
                    .catch(err => console.log(err))
                })
            })
        }
    }

    community() {
        return this.state.communitiesList.sort((a, b) => {
            return new Date(b.data.chat[b.data.chat.length - 1].timestamp) - new Date(a.data.chat[a.data.chat.length - 1].timestamp);
        }).map(community => {
            return <SubList mode='community' community={community.data} selected={this.state.selected === community.data._id ? 'yes' : 'no'} callback={this.callback} mobile={this.props.mobile}/>
        })
    }
    
    search() {
        const onChange = (e) => {
            this.props.searchCallback(e.target.value)
        }
        const searchResult = this.state.searchResult.map(x => {
            return <SubList mode='search' name={x.name} id={x._id} picture={x.picture} selected={this.state.selected === x._id ? 'yes' : 'no'} callback={this.callback} mobile={this.props.mobile}/>
        })
        return (
            <div>
                <input className="form-control" type="text" placeholder=" &#128269; Search community" onChange={onChange.bind(this)}/>
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
            marginLeft: 80,
            borderRight: '1px solid',
            borderColor: 'rgb(200, 200, 200)',
            overflowY: 'scroll'
        }

        const styleMobile = {
            height: 'calc(100vh - 80px)',
            overflowY: 'scroll'
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
                <Display mode={this.props.mode} selected={this.state.selected} mobile={false}/>
            </div>
        )
    }
}