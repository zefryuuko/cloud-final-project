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
            if (user.password === decoded.password && user.key === decoded.key && user.admin)
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
            if (user.password === decoded.password && user.key === decoded.key && user.admin)
            Community.find()
            .then(communities => {
                res.send(communities)
            })
            else res.status(401).send(false)
        else res.status(401).send(false)
    })
    .catch(err => res.status(400).json('Error: ' + err))
});

router.route('/users').post((req, res) => {
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
            if (user.password === decoded.password && user.key === decoded.key && user.admin)
            User.findById(req.body.id)
            .then(u => {
                if (req.body.update === 'name') {
                    u.name = req.body.value;
                    u.save()
                }
                if (req.body.update === 'email') {
                    u.email = req.body.value;
                    u.save()
                }
                if (req.body.update === 'picture') {
                    u.picture = req.body.value;
                    u.pictureName = req.body.pictureName
                    u.save()
                }
            })
            else res.status(401).send(false)
        else res.status(401).send(false)
    })
    .catch(err => res.status(400).json('Error: ' + err))
});

router.route('/communities').post((req, res) => {
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
            if (user.password === decoded.password && user.key === decoded.key && user.admin)
            Community.findById(req.body.id)
            .then(c => {
                if (req.body.update === 'name') {
                    c.name = req.body.value;
                    c.save()
                }
                if (req.body.update === 'description') {
                    c.description = req.body.value;
                    c.save()
                }
                if (req.body.update === 'picture') {
                    c.picture = req.body.value;
                    c.save()
                }
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
            if (user.password === decoded.password && user.key === decoded.key && user.admin)
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
            if (user.password === decoded.password && user.key === decoded.key && user.admin)
            Community.findByIdAndDelete({ _id })
                .then(() => res.send(true))
                .catch(err => res.status(400).json('Error: ' + err))
            else res.status(401).send(false)
        else res.status(401).send(false)
    })
    .catch(err => res.status(400).json('Error: ' + err))
});

module.exports = router;
