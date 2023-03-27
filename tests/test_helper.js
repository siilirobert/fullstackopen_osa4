const Blog = require('../models/blog')
const User = require('../models/user')

const initialBlogs = [
  {
		"title": "some fancy blog",
		"author": "me ofcourse",
		"url": "robbanblog.com",
		"likes": 9001
	},
	{
		"title": "blog about boats",
		"author": "also",
		"url": "robbanblog.com/boats",
		"likes": 5
	}
]

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(blog => blog.toJSON())
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(user => user.toJSON())
}

module.exports = {
  initialBlogs,
  blogsInDb,
  usersInDb
}
