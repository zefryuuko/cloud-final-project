const router = require('express').Router();
const jwt = require('jsonwebtoken');

let User = require('../models/user');
let Community = require('../models/community');

router.route('/').post((req, res) => {
    const _id = req.body._id;
    const senderID = req.body.user
    const message = req.body.message
    const timestamp = req.body.timestamp
    const token = req.body.token
    let decoded = undefined;
    try {
        decoded = jwt.verify(token, 'secret');
    } catch(err) {
        res.status(401).send(false)
    }

    if (decoded !== undefined)
    User.findById(decoded._id, function(err, user) {
        if (user !== null)
            if (user.password === decoded.password && user.key === decoded.key)
            Community.findById(_id)
                .then(c => {
                    c.chat.push({
                        'timestamp': timestamp,
                        'user': senderID === '' ? senderID : decoded._id,
                        'message': message
                    })
                    c.save()
                })
                .catch(err => res.status(400).json('Error: ' + err))
            else res.status(401).send(false)
        else res.status(401).send(false)
    })
    .catch(err => res.status(400).json('Error: ' + err))
});

module.exports = router;
