import { React, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles';
import {
  Card, CardHeader, CardContent, CardActions, IconButton,
  Button, TextField, Avatar, Typography, Box, Checkbox
} from '@material-ui/core';
import ChatIcon from '@material-ui/icons/ChatBubbleOutline';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import InsertEmoticon from '@material-ui/icons/InsertEmoticon'
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Favorite from '@material-ui/icons/Favorite';
import FavoriteBorder from '@material-ui/icons/FavoriteBorder';
import User from '../utils/User'
import { Comment, Post } from '../utils'




const useStyles = makeStyles((theme) => ({
  root: {
    maxWidth: 800,
    marginBottom: 20,
    height: "100%"
  },
  media: {
    width: "100%",
    // paddingTop: '56.25%', // 16:9
  },
  expandOpen: {
    transform: 'rotate(180deg)',
  },
  un: {
    display: 'inline-flex',
    paddingRight: 5,
    color: 'black',
  },
  cap: {
    display: 'inline-flex'
  },
  imageWrapper: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    position: "relative",
    justifyContent: "center"
  },
  button: {
    padding: 0,
    margin: 0
  }
}));



const Posts = () => {

  const classes = useStyles()
  const [postState, setPostState] = useState({
    posts: [],
    user: {}
  })
  const [comment, setComment] = useState({
    body: '',
    post_id: ''
  })

  useEffect(async () => {
    await Post.getAll()
      .then(({ data: grams }) => {
        User.profile()
          .then(({ data }) => {
            setPostState({ ...postState, posts: grams, user: data })
            console.log(grams[0].user.profile)
          })
      })
      .catch(err => {
        console.error(err)
      })
  }, [])
  const [likeState, setLikeState] = useState({
    likes: 0
  })
  const handleLikeChange = ({ target }) => {
    setLikeState({ ...likeState, likes: target.value, id: target.id })
  }

  const handleLike = post_id => {
    let type = 'like'
    postState.posts.forEach(post => {
      if (post._id === post_id) {
        post.liked_by.forEach(like => {
          if (like === postState.user._id) {
            type = 'unlike'
          }
        })
      }
    })
    User.touchPost({
      type,
      user_id: postState.user._id,
      post_id
    })
      .then(data => {
        Post.getAll()
          .then(({ data: grams }) => {
            console.log(grams)
            setPostState({ ...postState, posts: grams })
          })
          .catch(err => {
            console.error(err)
          })
      })
      .catch(err => console.log(err))
    console.log(likeState)
  }

  const handleCommentInput = ({ target }) => {
    setComment({...comment, body: target.value, post_id: target.id})
    console.log(comment) 
  }
  
  const handleComment = () => {
    Comment.create({
      comment: comment.body, 
      post_id: comment.post_id
    })
      .then(({ data: cmnt }) => {
        console.log(cmnt)
        setComment({body: '', post_id: ''})
        console.log(comment)
      })
      .catch(err => console.error(err))
  }

  return (

    <Box xs={12} xl={12} lg={12} md={12} >
      {
        postState.posts.length
          ? postState.posts.map(post => (
            <Card className={classes.root} key={post._id}>
              <CardHeader
                avatar={
                  <Avatar aria-label="userAvatar" className={classes.avatar} src={post.user.profile}>
                  </Avatar>
                }
                action={
                  <IconButton aria-label="settings">
                    <MoreVertIcon />
                  </IconButton>
                }
                title={
                <Link to={`/user/${post.user._id}`} style={{ textDecoration: 'none', color: 'black' }}>
                  {post.user.username}
                </Link>
                }
              />
              <div className={classes.imageWrapper}>
                <img
                  className={classes.media}
                  src={post.image}
                  alt={post.body}
                />
              </div>
              <CardContent>
                <CardActions disableSpacing className={classes.button}>
                  <IconButton aria-label="like" color="danger" className={classes.button}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          icon={<FavoriteBorder className={classes.button} />}
                          checkedIcon={<Favorite className={classes.button} />}
                          name="checkedH"
                          onClick={() => handleLike(post._id)}
                          checked={post.liked_by.indexOf(postState.user._id) !== -1}
                        />}
                    />{post.liked_by.length}
                  </IconButton>
                  <IconButton aria-label="comment">
                    <ChatIcon className={classes.button} />
                  </IconButton>
                </CardActions>

                <Typography variant="body2" color="textSecondary" component="p">
                  <div className={classes.un}>
                    <Link to={`/user/${post.user._id}`} style={{ textDecoration: 'none', color: 'black' }} >
                    {post.user.username}
                    </Link>
                  </div>
                  <div className={classes.cap}>
                    {post.body}
                  </div>
                </Typography>
                <Typography variant="body2" color="textSecondary" component="p">
                  {/* {post.comments.length && post.comments[0].comment} */}
                </Typography>
              </CardContent>
              <CardContent>
                <IconButton aria-label="comment">
                  <InsertEmoticon />
                </IconButton>
                <TextField
                  id={post._id}
                  label="Add a comment..."
                  type="comment"
                  value={comment.post_id == post._id ? comment.body : ""}
                  onChange={handleCommentInput}
                />
                <Button onClick={handleComment}>Post</Button>

              </CardContent>
            </Card>
          ))
          : null
      }
    </Box>
  )

}

export default Posts