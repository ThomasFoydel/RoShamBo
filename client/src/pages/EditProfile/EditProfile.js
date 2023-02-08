import axios from 'axios'
import { Link } from 'react-router-dom'
import { Close } from '@mui/icons-material'
import React, { useState, useEffect, useContext } from 'react'
import { Grid, Card, Avatar, Input, Button, Typography, IconButton } from '@mui/material'
import MessageNotification from 'components/MessageNotification/MessageNotification'
import ImageUpload from 'components/ImageUpload/ImageUpload'
import useClasses from 'customHooks/useClasses'
import { CTX } from 'context/Store'

const styles = (theme) => ({
  editProfile: {
    ...theme.centerHorizontal,
    width: '95vw',
    marginTop: '5em',
  },
  closeBtn: {
    top: '.25em',
    right: '.25em',
    position: 'absolute',
    svg: {
      fill: theme.palette.primary.dark,
      fontSize: '2rem',
    },
    '&:hover': {
      svg: {
        fill: theme.palette.primary.light,
      },
    },
  },
  profilePic: {
    ...theme.centerHorizontal,
    width: '30vw',
    height: '30vw',
    minWidth: '3em',
    fontSize: '6rem',
    minHeight: '3em',
    marginBottom: '.2em',
  },
  sectionOne: {
    padding: '2rem',
    textAlign: 'center',
  },
  sectionTwo: {
    padding: '2rem',
    textAlign: 'center',
  },
  heading: {
    color: theme.palette.primary.main,
    fontSize: '2rem',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  submitBtn: {
    color: 'white',
    fontWeight: 'bold',
    background: theme.palette.primary.main,
    '&:hover': {
      background: theme.palette.primary.dark,
    },
  },
})

const initMessageNotification = { sender: null, content: null, senderId: null }
const formDataInitialValues = { name: '', displayEmail: '', bio: '' }

const EditProfile = ({ props: { socketRef } }) => {
  const [{ user, auth }, updateState] = useContext(CTX)
  const { token } = auth
  const { id, bio, name, profilePic, displayEmail } = user
  const [profileImage, setProfileImage] = useState([])
  const [showProfileInput, setShowProfileInput] = useState(false)
  const [formData, setFormData] = useState(formDataInitialValues)
  const [messageNotification, setMessageNotification] = useState(initMessageNotification)
  const classes = useClasses(styles)

  const toggleProfile = () => setShowProfileInput((s) => !s)

  const handleProfileFile = ([file]) => file && setProfileImage(file)

  const handleImageSubmit = ([file]) => {
    if (profileImage) {
      const fd = new FormData()
      fd.append('image', file, file.name)
      axios
        .post('/api/image/upload/profilepic', fd, { headers: { 'x-auth-token': token } })
        .then(({ data }) => {
          setShowProfileInput(false)
          updateState({ type: 'CHANGE_PROFILE_PIC', payload: { profilePic: data } })
        })
        .catch((err) => console.error(err))
    }
  }

  const handleChange = ({ target: { id, value } }) => setFormData((f) => ({ ...f, [id]: value }))

  const handleSubmit = (e) => {
    e.preventDefault()

    const update = Object.fromEntries(Object.entries(formData).filter((e) => e[1].length > 0))

    axios
      .put('/api/user/profile', update, { headers: { 'x-auth-token': token } })
      .then(({ data }) => {
        setFormData(formDataInitialValues)
        updateState({ type: 'UPDATE_USER_INFO', payload: { update: data } })
      })
      .catch((err) => console.error(err))
  }

  useEffect(() => {
    let subscribed = true
    socketRef.current.on('chat-message-notification', (message) => {
      if (subscribed) {
        setMessageNotification({
          content: message.content,
          sender: message.sender.name,
          senderId: message.sender._id,
        })
      }
    })
    return () => {
      subscribed = false
      setMessageNotification(initMessageNotification)
      socketRef.current.off('chat-message-notification')
    }
  }, [])

  const closeMessageNotification = () => setMessageNotification(initMessageNotification)

  return (
    <>
      {user && (
        <Grid container className={classes.editProfile} component={Card} alignItems="center">
          <Link to={`/profile/${id}`} className={classes.closeBtn}>
            <IconButton>
              <Close />
            </IconButton>
          </Link>
          <Grid
            item
            xl={12}
            lg={12}
            md={12}
            sm={12}
            xs={12}
            component={Typography}
            className={classes.heading}
          >
            Edit Profile
          </Grid>
          <Grid item xl={6} lg={6} md={6} sm={12} xs={12} className={classes.sectionOne}>
            <Avatar
              alt="your profile"
              onClick={toggleProfile}
              className={classes.profilePic}
              src={`/api/image/${profilePic}`}
            >
              {name && name[0] && name[0].toUpperCase()}
            </Avatar>
            <ImageUpload
              props={{
                toggle: toggleProfile,
                show: showProfileInput,
                text: 'New profile pic',
                btnClass: classes.submitBtn,
                handleFile: handleProfileFile,
                handleSubmit: handleImageSubmit,
                buttonText: 'Upload New Profile Picture',
                handleDelete: () => setProfileImage(null),
              }}
            />
          </Grid>
          <Grid item xl={6} lg={6} md={6} sm={12} xs={12} className={classes.sectionTwo}>
            <Grid
              container
              spacing={3}
              component="form"
              justify="center"
              direction="column"
              alignItems="center"
              onSubmit={handleSubmit}
            >
              <Grid item>
                <Typography>name: {name}</Typography>
                <Input
                  id="name"
                  value={formData.name}
                  placeholder="edit name"
                  onChange={handleChange}
                />
              </Grid>
              <Grid item>
                <Typography>display email:{displayEmail}</Typography>
                <Input
                  id="displayEmail"
                  onChange={handleChange}
                  value={formData.displayEmail}
                  placeholder="edit display email"
                />
              </Grid>

              <Grid item>
                <Typography>bio: {bio}</Typography>
                <Input
                  id="bio"
                  value={formData.bio}
                  placeholder="edit bio"
                  onChange={handleChange}
                />
              </Grid>
              <Grid item>
                <Button className={classes.submitBtn} type="submit">
                  submit
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      )}
      <MessageNotification
        props={{ severity: 'info', message: messageNotification, close: closeMessageNotification }}
      />
    </>
  )
}

export default EditProfile
