const router = require('express').Router();
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');

let User = require('../models/user');

router.route('/login').post((req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    User.findOne({ email: email }, function(err, user) {
        if (user !== null)
    
        // test a matching password
        bcrypt.compare(password, user.password, function(err, result) {
            if (result) {
                const key = Math.random().toString(36).substr(2)
                const token = jwt.sign({ _id: user._id, password: user.password, key: key }, 'secret');
                user.key = key
                user.lockedSince = ''
                user.loginAttempts = 0
                user.save()
                const obj = {
                    token: token,
                    new: user.communities.length === 0 ? true : false
                }
                res.send(obj);
                // res.json('true') sends 'true'
                // res.send('true') sends true
            }
            else {
                if (user.loginAttempts + 1 == 3) {
                    user.lockedSince = new Date().toString()
                    user.loginAttempts++
                    user.save()
                    res.send('maxAttempt')
                }
                else if (user.loginAttempts + 1 > 3) {
                    if (((new Date() - new Date(user.lockedSince))/1000)/60 >= 1) {
                        user.lockedSince = ''
                        user.loginAttempts = 1
                        user.save()
                    }
                    res.send('maxAttempt')
                }
                else {
                    user.loginAttempts++
                    user.save()
                    res.send('invalidPass')
                }
            }
        });
        else res.send('invalidEmail')
    })
    .catch(err => res.status(400).json('Error: ' + err))
});

router.route('/register').post((req, res) => {
    const email = req.body.email;
    const plainPassword = req.body.password;
    const name = req.body.name;

    User.findOne({ email:email }, function(err, user) {
        if (user !== null)
            res.send('invalidEmail')
        else {
            // generate a salt
            SALT_WORK_FACTOR = 10;
            bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
              
                // hash the password along with our new salt
                bcrypt.hash(plainPassword, salt, function(err, hash) {
                  
                    const password = hash
                    const newUser = new User({email, password, name});
                    
                    newUser.save({}, function(err, result) {
                        if (err) console.log(err)
                        const key = Math.random().toString(36).substr(2)
                        const token = jwt.sign({ _id: result._id, password: result.password, key: key }, 'secret');
                        result.key = key
                        result.save()
                        const obj = {
                            token: token
                        }
                        res.send(obj);
                    })
                });
            })
        }
    })
    .catch(err => res.status(400).json('Error: ' + err))
});

router.route('/token').post((req, res) => {
    const token = req.body.token;
    let decoded = undefined;
    try {
        decoded = jwt.verify(token, 'secret');
    } catch(err) {
        res.send(false)
    }

    if (decoded !== undefined)
    User.findById(decoded._id, function(err, user) {
        if (user !== null)
            if (user.password === decoded.password && user.key && decoded.key)
                res.send(user)
            else res.send(false)
        else res.send(false)
    })
    .catch(err => res.status(400).json('Error: ' + err))
});

router.route('/update').post((req, res) => {
    const _id = req.body._id;

    User.findById({ _id })
        .then(user => {
            if (req.body.update === 'name') {
                user.name = req.body.name;
                user.save()
            }
            if (req.body.update === 'password') {
                bcrypt.genSalt(10, function(err, salt) {
                    bcrypt.hash(req.body.password, salt, function(err, hash) {
                        user.password = hash
                        user.save()
                    });
                })
            }
            if (req.body.update === 'picture') {
                user.picture = req.body.picture;
                user.pictureName = req.body.pictureName
                user.save()
            }
            if (req.body.update === 'community') {
                user.communities.push(req.body.community)
                user.save()
            }
            if (req.body.update === 'community leave') {
                user.communities.splice(user.communities.indexOf(req.body.community), 1)
                user.save()
            }
        })
        .catch(err => res.status(400).json('Error: ' + err))
    res.send(true)
});

router.route('/:_id').delete((req, res) => {
    const _id = req.params._id;

    User.findByIdAndDelete({ _id })
        .then(() => res.send(true))
        .catch(err => res.status(400).json('Error: ' + err))
});

router.route('/:_id').get((req, res) => {
    const _id = req.params._id;

    User.findById({ _id }, function(err, user) {
        if (user === null) {
            const obj = {
                name: '',
                picture: 'https://res.cloudinary.com/erizky/image/upload/v1588574095/profile_s89x7z.png'
            }
            res.send(obj);
        }
        else {
            const obj = {
                name: user.name,
                picture: user.picture
            }
            res.send(obj);
        }
    })
    .catch(err => res.status(400).json('Error: ' + err))
});

module.exports = router;
