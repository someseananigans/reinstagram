const router = require('express').Router()
const { User, Post } = require('../models')
const jwt = require('jsonwebtoken')
const passport = require('passport')

// only for testing purposes
router.get('/users', (req, res) => {
  User.find({})
    .then(users => res.json(users))
    .catch(err => console.log(err))
})

router.get('/users/:id', (req, res) => {
  User.findById(req.params.id)
  .populate(
    {
      path:'posts', 
      model: 'Post',
      populate: {
        path: 'user',
        model: 'User',
        select: 'username profile _id'
      }
    })
  .then(user => res.json(user))
  .catch(err => console.log(err))
})

router.get('/user', passport.authenticate('jwt'), (req, res) => {
  res.json(req.user)
})

router.post('/user/register', (req, res) => {
  const { name, email, username } = req.body
  User.register(new User({ name, email, username }), req.body.password, err => {
    if (err) { console.log(err) }
    res.sendStatus(200)
  })
})

router.post('/user/login', (req, res) => {
  User.authenticate()(req.body.username, req.body.password, (err, user) => {
    if (err) { console.log(err) }

    res.json(user ? jwt.sign({ id: user._id }, process.env.SECRET) : null)
  })
})

router.put('/user', passport.authenticate('jwt'), (req, res) => {
  User.findByIdAndUpdate(req.user.id, req.body)
    .then(() => res.sendStatus(200))
    .catch(err => console.log(err))
})

router.delete('/user', passport.authenticate('jwt'), (req, res) => {
  User.findByIdAndRemove(req.user.id)
    .then(() => res.sendStatus(200))
    .catch(err => console.log(err))
})

//  <------------------ Interacting with User ---------------------->

router.put('/user/interaction', passport.authenticate('jwt'), async (req, res) => {
  try {
    if (req.body.type === 'follow') {
      await User.findByIdAndUpdate(req.user.id, { $addToSet: { following: req.body.follow_user_id } }, { "new": true })
      await User.findByIdAndUpdate(req.body.follow_user_id, { $addToSet: { followers: req.user.id } }, { "new": true })
    }
    if (req.body.type === 'unfollow') {
      await User.findByIdAndUpdate(req.user.id, { $pull: { following: req.body.follow_user_id } }, { "new": true })
      await User.findByIdAndUpdate(req.body.follow_user_id, { $pull: { followers: req.user.id } }, { "new": true })
    }
    res.json({
      status: 200,
      message: `Successfully ${req.body.type}ed`
    })
  } catch (err) {
    res.send(err)
    return
  }
})


// <------------------ Interacting with Post ---------------------->

router.put('/post/interaction', passport.authenticate('jwt'), async (req, res) => {

  try {
    if (req.body.type === 'like') {
      await Post.findByIdAndUpdate(req.body.post_id, { $addToSet: { liked_by: req.user._id } }, { "new": true })
      await User.findByIdAndUpdate(req.user._id, { $addToSet: { liked_posts: req.body.post_id } }, { "new": true })
    }
    if (req.body.type === 'unlike') {
      await Post.findByIdAndUpdate(req.body.post_id, { $pull: { liked_by: req.user._id } }, { "new": true })
      await User.findByIdAndUpdate(req.user._id, { $pull: { liked_posts: req.body.post_id } }, { "new": true })
    }
    res.json({
      status: 200,
      message: `Successfully ${req.body.type}ed`
    })
  } catch (err) {
    res.send(err)
    return
  }
})

module.exports = router