const jwt = require('jsonwebtoken')
const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const Comment = require('../models/comment')
const { userExtractor } = require('../utils/middleware')

blogsRouter.get('/', async (req, res) => {
  const blogs = await Blog.find({})
    .populate('user', { username: 1, name: 1 })
    .populate('comments', { content: 1 })
  res.json(blogs)
})

blogsRouter.post('/', userExtractor, async (req, res) => {
  const body = req.body

  if (!body.title || !body.url) {
    return res.status(400).end()
  }

  const user = req.user

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes || 0,
    user: user._id
  })

  await blog.populate('user', { username: 1, name: 1 })
  await blog.populate('comments', { content: 1 })
  const result = await blog.save()
  user.blogs = user.blogs.concat(result._id)
  await user.save()
  res.status(201).json(result)
})

blogsRouter.delete('/:id', userExtractor, async (req, res) => {
  const blog = await Blog.findById(req.params.id)
  if (!blog) {
    return res.status(204).end()
  }
  const user = req.user
  if (blog.user.toString() !== user._id.toString()) {
    return res.status(401).json({
      error: 'can\'t delete note created by someone else'
    })
  }
  await blog.deleteOne()
  res.status(204).end()
})

blogsRouter.put('/:id', async (req, res) => {
  const updatedBlog = await Blog.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  )
  await updatedBlog.populate('user', { username: 1, name: 1 })
  await updatedBlog.populate('comments', { content: 1 })
  if (updatedBlog) {
    return res.json(updatedBlog)
  } else {
    return res.status(404).end()
  }
})

blogsRouter.post('/:id/comments', async (req, res) => {
  const blog = await Blog.findById(req.params.id)
  if (!blog) {
    res.status(404).end()
  } 
  
  const body = req.body

  const comment = new Comment({
    content: body.content
  })

  const result = await comment.save()

  console.log(result)

  blog.comments = blog.comments.concat(result._id)
  const updatedBlog = await blog.save()
  console.log(updatedBlog)
  await updatedBlog.populate('comments', { content: 1 })
  return res.status(201).json(updatedBlog)
})

module.exports = blogsRouter
