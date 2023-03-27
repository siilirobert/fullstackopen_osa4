const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.get('/', async (req, res) => {
  const users = await User.find({})
    .populate('blogs', { url: 1, title: 1, author: 1 })
  res.status(200).json(users)
})

usersRouter.post('/', async (req, res) => {
  const { username, name, password } = req.body

  if (!password) {
    return res.status(400).send({ error: 'password is missing and is required' })
  }

  if (password.length < 3) {
    return res.status(400).send({ error: 'password is too short' })
  }

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  const user = new User({
    username,
    name,
    passwordHash
  })

  const savedUser = await user.save()

  res.status(201).json(savedUser)
})

module.exports = usersRouter
