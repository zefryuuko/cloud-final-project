const router = require('express').Router();
const jwt = require('jsonwebtoken');

let User = require('../models/user');
let Community = require('../models/community');

router.route('/users').get((req, res) => {
    const token = req.headers.token;
    let decoded = undefined;
    try {
        decoded = jwt.verify(token, 'secret');
    } catch(err) {
        res.status(401).send(false)
    }

    if (decoded !== undefined)
    User.findById(decoded._id, function(err, user) {
        if (user !== null)
            if (user.password === decoded.password && user.key && decoded.key && user.admin)
            User.find()
            .then(users => {
                res.send(users)
            })
            else res.status(401).send(false)
        else res.status(401).send(false)
    })
    .catch(err => res.status(400).json('Error: ' + err))
});

router.route('/communities').get((req, res) => {
    const token = req.headers.token;
    let decoded = undefined;
    try {
        decoded = jwt.verify(token, 'secret');
    } catch(err) {
        res.status(401).send(false)
    }

    if (decoded !== undefined)
    User.findById(decoded._id, function(err, user) {
        if (user !== null)
            if (user.password === decoded.password && user.key && decoded.key && user.admin)
            Community.find()
            .then(communities => {
                res.send(communities)
            })
            else res.status(401).send(false)
        else res.status(401).send(false)
    })
    .catch(err => res.status(400).json('Error: ' + err))
});

router.route('/users/:_id').delete((req, res) => {
    const _id = req.params._id;
    const token = req.headers.token;
    let decoded = undefined;
    try {
        decoded = jwt.verify(token, 'secret');
    } catch(err) {
        res.status(401).send(false)
    }

    if (decoded !== undefined)
    User.findById(decoded._id, function(err, user) {
        if (user !== null)
            if (user.password === decoded.password && user.key && decoded.key && user.admin)
            User.findByIdAndDelete({ _id })
                .then(() => res.send(true))
                .catch(err => res.status(400).json('Error: ' + err))
            else res.status(401).send(false)
        else res.status(401).send(false)
    })
    .catch(err => res.status(400).json('Error: ' + err))
});

router.route('/communities/:_id').delete((req, res) => {
    const _id = req.params._id;
    const token = req.headers.token;
    let decoded = undefined;
    try {
        decoded = jwt.verify(token, 'secret');
    } catch(err) {
        res.status(401).send(false)
    }

    if (decoded !== undefined)
    User.findById(decoded._id, function(err, user) {
        if (user !== null)
            if (user.password === decoded.password && user.key && decoded.key && user.admin)
            Community.findByIdAndDelete({ _id })
                .then(() => res.send(true))
                .catch(err => res.status(400).json('Error: ' + err))
            else res.status(401).send(false)
        else res.status(401).send(false)
    })
    .catch(err => res.status(400).json('Error: ' + err))
});

module.exports = router;
