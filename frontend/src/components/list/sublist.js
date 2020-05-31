import React from 'react'
import './sublist.css'

export default function SubList(args){
    return (
        <div>
            {
                args.mode === 'profile' ? (
                    <div
                    className={args.mobile ? 'profileStyle mobile' : args.selected === 'yes' ? 'profileStyle selected' : 'profileStyle'}
                    onClick={() => args.callback(args.id, args.name)}>
                        <p>{args.name}</p>
                    </div>
                ) : null
            }
            {
                args.mode === 'community' ? (
                    <div
                    className={args.mobile ? 'communityStyle mobile' : args.selected === 'yes' ? 'communityStyle selected' : 'communityStyle'}
                    onClick={() => args.callback(args.community._id, args.community.name)}>
                        <div>
                            <img src={args.community.picture} />
                        </div>
                        <div style={{margin: args.mobile ? '10px 0px 10px 15px' : '15px 0px 0px 15px'}}>
                            <div className='row'>
                                <div className='column'>
                                    <p className='name'>{args.community.name}</p>
                                    <p className='preview'>{args.community.preview}</p>
                                </div>
                                <p className='date'>
                                    {new Date().toLocaleString().split(',')[0] === args.community.timestamp.split(',')[0]
                                    ? args.community.timestamp.split(',')[1].split(':')[0] + ':' + 
                                      args.community.timestamp.split(',')[1].split(':')[1] + ' ' +
                                      args.community.timestamp.split(',')[1].split(':')[2].split(' ')[1]
                                    : args.community.timestamp.split(',')[0]}
                                </p>
                            </div>
                        </div>
                    </div>
                ) : null
            }
            {
                args.mode === 'welcome' && (
                    <div
                    className={args.mobile ? 'communityStyle mobile' : args.selected === 'yes' ? 'communityStyle selected' : 'communityStyle'}
                    onClick={() => args.callback(0, 'Welcome')}>
                        <div>
                            <img src='https://res.cloudinary.com/erizky/image/upload/v1588573978/community_mgshrs.png' />
                        </div>
                        <div style={{margin: args.mobile ? '10px 0px 10px 15px' : '15px 0px 0px 15px'}}>
                            <div className='row'>
                                <div className='column'>
                                    <p className='name'>Welcome</p>
                                    <p className='preview'>Click me!</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
            {
                args.mode === 'search' && (
                    <div 
                    className={args.mobile ? 'searchStyle mobile' : args.selected === 'yes' ? 'searchStyle selected' : 'searchStyle'}
                    onClick={() => args.callback(args.id, args.name)}>
                        <img className={args.id === 0 ? 'createIMG' : undefined} src={args.picture} />
                        <p className={args.id === 0 ? 'create' : undefined}>{args.name}</p>
                        {args.id === 0 ? (<p className='arrow2'>&#8853;</p>) : (<p className='arrow'>&#10095;</p>)}
                    </div>
                )
            }
        </div>
    )
}