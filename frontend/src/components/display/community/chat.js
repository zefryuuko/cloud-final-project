import React from 'react'
import './styles.css'

export default function Chat(args){
    return args.sender === 'me' ? 
    <div className='me'>
        <table style={{marginTop: 15, marginLeft: 15}}>
            <tr>
                <td>
                    <p className='time'>{args.time}</p>
                </td>
                <td>
                    <p className='name'>{args.user.name}</p>
                </td>
                <td rowSpan='2'>
                    <img src={args.user.picture} />
                </td>
            </tr>
            <tr>
                <td colSpan='2'>
                    <p className='message'>{args.message}</p>
                </td>
            </tr>
        </table>
    </div>
    : args.sender === 'other' ? 
    <div className='other'>
        <table style={{marginTop: 15, marginRight: 15}}>
            <tr>
                <td rowSpan='2'>
                    <img src={args.user.picture} />
                </td>
                <td>
                    <p className='name'>{args.user.name === '' ? 'This user has deleted this account' : args.user.name}</p>
                </td>
                <td>
                    <p className='time'>{args.time}</p>
                </td>
            </tr>
            <tr>
                <td colSpan='2'>
                    <p className='message'>{args.message}</p>
                </td>
            </tr>
        </table>
    </div>
    : null
}