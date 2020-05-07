const router = require('express').Router();

let Community = require('../models/community');

router.route('/create').post((req, res) => {
    const name = req.body.name;
    const description = req.body.description;
    const picture = req.body.picture;

    const newCommunity = new Community({name, description, picture});
    
    newCommunity.save({}, function(err, result) {
        if (err) return res.send(err);
        return res.send(result);
    })
});

router.route('/update').post((req, res) => {
    const _id = req.body._id;

    Community.findById({ _id })
        .then(c => {
            if (req.body.update === 'name') {
                c.name = req.body.name;
                c.save()
            }
            if (req.body.update === 'description') {
                c.description = req.body.description;
                c.save()
            }
            if (req.body.update === 'picture') {
                c.picture = req.body.picture;
                c.save()
            }
        })
        .catch(err => res.send(err))
    res.send(true)
});

router.route('/:_id').delete((req, res) => {
    const _id = req.params._id;

    Community.findByIdAndDelete({ _id })
        .then(() => res.send(true))
});

router.route('/:_id').get((req, res) => {
    const _id = req.params._id;

    Community.findById(_id)
    .then(c => res.send(c))
    .catch(err => res.send(err))
});

router.route('/chat').post((req, res) => {
    const _id = req.body._id;
    const user = req.body.user
    const message = req.body.message
    const timestamp = req.body.timestamp

    Community.findById(_id)
    .then(c => {
        c.chat.push({
            'timestamp': timestamp,
            'user': user,
            'message': message
        })
        c.save()
    })
    .catch(err => res.send(err))
});

router.route('/chat/:_id').post((req, res) => {
    const _id = req.params._id;
    const timestamp = req.body.timestamp

    Community.findById(_id)
    .slice('chat', -1)
    .then(c => {
        if (timestamp !== c.chat[0].timestamp || timestamp === '')
        res.send(c.chat[0])
        else res.send(false)
    })
    .catch(err => res.send(err))
});

router.route('/search/:name').get((req, res) => {
    const name = req.params.name;

    Community.find({name: {$regex: name, $options: 'i'}})
    .then(c => res.send(c))
    .catch(err => res.send(err))
});

module.exports = router;