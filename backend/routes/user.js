const router = require('express').Router();
const bcrypt = require('bcrypt')

let User = require('../models/user');

router.route('/login').post((req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    User.findOne({ email: email }, function(err, user) {
        if (user !== null)
    
        // test a matching password
        bcrypt.compare(password, user.password, function(err, result) {
            if (result) {
                const obj = {
                    _id: user._id,
                    password: user.password
                }
                res.send(obj);
                // res.json('true') sends 'true'
                // res.send('true') sends true
            }
            else res.send('invalidPass')
        });
        else res.send('invalidEmail')
    })
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
                        if (err) return res.send(err);
                        return res.send(result);
                    })
                });
            })
        }
    })
    
});

router.route('/token').post((req, res) => {
    const _id = req.body._id;
    const password = req.body.password;

    if (_id !== undefined && password !== undefined)
    User.findById({ _id }, function(err, user) {
        if (user !== null)
            if (user.password === password)
                res.send(user)
            else res.send(false)
        else res.send(false)
    })
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
                        console.log(req.body.password)
                        user.password = hash
                        user.save()
                    });
                })
            }
            if (req.body.update === 'community') {
                user.communities.push(req.body.community)
                user.save()
            }
        })
    res.send(true)
});

router.route('/:_id').delete((req, res) => {
    const _id = req.params._id;

    User.findByIdAndDelete({ _id })
        .then(() => res.send(true))
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
});

module.exports = router;