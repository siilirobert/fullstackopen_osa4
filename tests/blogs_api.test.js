const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')
const User = require('../models/user')
const helper = require('./test_helper')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
let authorizationToken
let userId

beforeAll(async () => {
  const passwordHash = await bcrypt.hash('sekret', 10)
  const user = new User({ username: 'userforsavetesting', passwordHash })
  const savedUser = await user.save()

  const userForToken = {
    username: savedUser.username,
    id: savedUser._id
  }

  const token = jwt.sign(userForToken, process.env.SECRET)
  authorizationToken = `Bearer ${token}`
  userId = savedUser._id
})

describe('when there is initally some blogs saved', () => {
  beforeEach(async () => {
    await Blog.deleteMany({})
    const blogsToInsert = helper.initialBlogs.map(blog => {
      blog.user = userId
      return blog
    })
    await Blog.insertMany(blogsToInsert)
  })

  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('blogs returned have an id field', async () => {
    const blogs = await helper.blogsInDb()
    expect(blogs[0].id).toBeDefined()
  })

  describe('adding a new blog', () => {
    test('with valid data succeeds', async () => {
      const blog = {
        title: 'some blog to add',
        author: 'unknown author',
        url: 'bloggers.com',
        likes: 32
      }

      await api
        .post('/api/blogs')
        .set('Authorization', authorizationToken)
        .send(blog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const blogsAfterAddition = await helper.blogsInDb()
      expect(blogsAfterAddition).toHaveLength(helper.initialBlogs.length + 1)

      const titles = blogsAfterAddition.map(blog => blog.title)
      expect(titles).toContain('some blog to add')
    })

    test('without likes attribute has zero likes', async () => {
      const blog = {
        title: 'blog with no likes',
        author: 'some bad author',
        url: 'badblog.com'
      }

      await api
        .post('/api/blogs')
        .set('Authorization', authorizationToken)
        .send(blog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const blogsAfterAddition = await helper.blogsInDb()
      const addedBlog = blogsAfterAddition.find(b => b.title === blog.title)

      expect(addedBlog.likes).toBe(0)
    })

    test('without url or title should fail with status 400', async () => {
      let blog = {
        title: 'blog with no url',
        author: 'internetless man',
        likes: 43
      }

      await api
        .post('/api/blogs')
        .set('Authorization', authorizationToken)
        .send(blog)
        .expect(400)

      blog = {
        author: 'titleless man',
        url: 'notitle.com',
        likes: 235
      }

      await api
        .post('/api/blogs')
        .set('Authorization', authorizationToken)
        .send(blog)
        .expect(400)
    })

    test('without authorization token should fail with status 401', async () => {
      const blog = {
        title: 'some blog to add',
        author: 'unknown author',
        url: 'bloggers.com',
        likes: 32
      }

      await api
        .post('/api/blogs')
        .send(blog)
        .expect(401)
    })
  })

  describe('deletion of a note', () => {
    test('succeeds if id is valid', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const blogToDelete = blogsAtStart[0]

      await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .set('Authorization', authorizationToken)
        .expect(204)

      const blogsAtEnd = await helper.blogsInDb()
      expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length - 1)

      const titles = blogsAtEnd.map(b => b.title)
      expect(titles).not.toContain(blogToDelete.title)
    })
  })

  describe('updating a note', () => {
    test('succeeds with valid data', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const blogToUpdate = blogsAtStart[0]

      updatedBlogObject = { ...blogToUpdate, likes: 9000 }

      const result = await api
        .put(`/api/blogs/${blogToUpdate.id}`)
        .send(updatedBlogObject)
        .expect(200)

      expect(result.body.likes).toBe(9000)
    })
  })
})

afterAll(async () => {
  await Blog.deleteMany({})
  await User.deleteMany({})
  await mongoose.connection.close()
})