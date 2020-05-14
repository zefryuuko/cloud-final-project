import React from 'react'
import './styles.css'

export default function Chat(args){
    let isImage = false
    const formatify = (text) => {
        // source: https://stackoverflow.com/questions/1500260/detect-urls-in-text-with-javascript
        var url = /((?:(http|https|Http|Https|rtsp|Rtsp):\/\/(?:(?:[a-zA-Z0-9\$\-\_\.\+\!\*\'\(\)\,\;\?\&\=]|(?:\%[a-fA-F0-9]{2})){1,64}(?:\:(?:[a-zA-Z0-9\$\-\_\.\+\!\*\'\(\)\,\;\?\&\=]|(?:\%[a-fA-F0-9]{2})){1,25})?\@)?)?((?:(?:[a-zA-Z0-9][a-zA-Z0-9\-]{0,64}\.)+(?:(?:aero|arpa|asia|a[cdefgilmnoqrstuwxz])|(?:biz|b[abdefghijmnorstvwyz])|(?:cat|com|coop|c[acdfghiklmnoruvxyz])|d[ejkmoz]|(?:edu|e[cegrstu])|f[ijkmor]|(?:gov|g[abdefghilmnpqrstuwy])|h[kmnrtu]|(?:info|int|i[delmnoqrst])|(?:jobs|j[emop])|k[eghimnrwyz]|l[abcikrstuvy]|(?:mil|mobi|museum|m[acdghklmnopqrstuvwxyz])|(?:name|net|n[acefgilopruz])|(?:org|om)|(?:pro|p[aefghklmnrstwy])|qa|r[eouw]|s[abcdeghijklmnortuvyz]|(?:tel|travel|t[cdfghjklmnoprtvwz])|u[agkmsyz]|v[aceginu]|w[fs]|y[etu]|z[amw]))|(?:(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[1-9])\.(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[1-9]|0)\.(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[1-9]|0)\.(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[0-9])))(?:\:\d{1,5})?)(\/(?:(?:[a-zA-Z0-9\;\/\?\:\@\&\=\#\~\-\.\+\!\*\'\(\)\,\_])|(?:\%[a-fA-F0-9]{2}))*)?(?:\b|$)/gi;
        var bold = /\*\*(.*?)\*\*/g
        var italic = /\*(.*?)\*/g
        var boldItalic = /\*\*\*(.*?)\*\*\*/g
        var strikethrough = /~~(.*?)~~/g
        var monospace = /```(.*?)```/g
        var newText = text
        newText = newText.replace(bold, '<strong>$1</strong>'); 
        newText = newText.replace(italic, '<em>$1</em>'); 
        newText = newText.replace(boldItalic, '<strong><em>$1</em></strong>'); 
        newText = newText.replace(strikethrough, '<del>$1</del>'); 
        newText = newText.replace(monospace, '<code>$1</code>');
        newText = newText.replace(url, url => {
            let realurl = url
            if (!url.includes('http://') && !url.includes('https://')) realurl = 'http://' + url
            if (url.match(/\.(jpeg|jpg|gif|png)/) != null) {
                isImage = true
                return '<img src=' + realurl + ' onerror="this.onerror=null; this.src=\'https://res.cloudinary.com/erizky/image/upload/c_scale,w_113/v1589474238/unknown_ivqfpo.png\'" alt="" loading="lazy">';
            }
            else return '<a href="' + realurl + '" target="_blank">' + url + '</a>';
        })
        if (newText.match(/<img .*>/g)) newText = newText.replace(/>\s+|\s+</g, '><br>')
        return {__html: newText}
    }
    const message = formatify(args.message)
    return args.sender === 'me' ? 
    <div className={args.recent ? isImage ? 'me' : 'me recent' : 'me'} id={args.top && 'newTop'}>
        <table style={{marginTop: 15, marginLeft: 15}}>
            <tbody>
                <tr>
                    <td>
                        <p className='time'>{args.time}</p>
                    </td>
                    <td>
                        <p className='name'>{args.user.name}</p>
                    </td>
                    <td rowSpan='2'>
                        <img src={args.user.picture} className="profilePic" loading="lazy"/>
                    </td>
                </tr>
                <tr>
                    <td colSpan='2'>
                        <p className='message' dangerouslySetInnerHTML={message}></p>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
    : args.sender === 'other' ? 
    <div className={args.recent ? isImage ? 'other' : 'other recent' : 'other'} id={args.top && 'newTop'}>
        <table style={{marginTop: 15, marginRight: 15}}>
            <tbody>
                <tr>
                    <td rowSpan='2'>
                        <img src={args.user.name === '' 
                        ? 'https://res.cloudinary.com/erizky/image/upload/v1588574095/profile_s89x7z.png' 
                        : args.user.picture} className="profilePic"
                        loading="lazy"/>
                    </td>
                    <td>
                        <p className='name'>{args.user.name === '' 
                        ? 'This user has deleted this account' 
                        : args.user.name}
                        </p>
                    </td>
                    <td>
                        <p className='time'>{args.time}</p>
                    </td>
                </tr>
                <tr>
                    <td colSpan='2'>
                        <p className='message' dangerouslySetInnerHTML={message}></p>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
    : null
}