const User = require('../models/user')
const jwt = require('jsonwebtoken')

const errorHandler = (error, req, res, next) => {
  console.log(error.message)

  if (error.name === 'CastError') {
    return res.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return res.status(400).json({ error: error.message })
  } else if (error.name === 'JsonWebTokenError') {
    return res.status(400).json({ error: 'token missing or invalid' })
  }

  next(error)
}

const tokenExtractor = (req, res, next) => {
  const authorization = req.get('authorization')
  if (authorization && authorization.startsWith('Bearer ')) {
    req.token = authorization.replace('Bearer ', '')
  }
  next()
}

const userExtractor = async (req, res, next) => {
  const authorization = req.get('authorization')
  if (authorization && authorization.startsWith('Bearer ')) {
    const token = authorization.replace('Bearer ', '')
    const decodedToken = jwt.verify(token, process.env.SECRET)
    if (decodedToken.id) {
      const user = await User.findById(decodedToken.id)
      req.user = user
      return next()
    }
  } else {
    return res.status(401).json({
      error: 'token invalid'
    })
  }
}

module.exports = {
  errorHandler,
  tokenExtractor,
  userExtractor
}
