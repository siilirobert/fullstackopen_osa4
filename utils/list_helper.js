const _ = require('lodash')
const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  const reducer = (sum, item) => {
    return sum + item.likes
  }

  return blogs.length === 0
    ? 0
    : blogs.reduce(reducer, 0)
}

const favoriteBlog = (blogs) => {
  let maxLikes = 0
  let currentFavorite = undefined

  blogs.forEach((blog) => {
    if (blog.likes > maxLikes) {
      maxLikes = blog.likes
      currentFavorite = blog
    }
  })

  if (currentFavorite) {
    return {
      title: currentFavorite.title,
      author: currentFavorite.author,
      likes: currentFavorite.likes
    }
  } else {
    return undefined
  }
}

const mostBlogs = (blogs) => {
  if (blogs.length === 0) {
    return undefined
  }

  const reduced = _.reduce(blogs, (result, value) => {
    console.log(result[value.author])
    currentAmount = result[value.author] || 0
    result[value.author] = (currentAmount + 1)
    return result 
  }, {})

  const entries = Object.entries(reduced)

  const max = _.maxBy(entries, (entry) => {
    return entry[1]
  })

  return {
    author: max[0],
    blogs: max[1]
  }
}

const mostLikes = (blogs) => {
  if (blogs.length === 0) {
    return undefined
  }

  const reduced = _.reduce(blogs, (result, value) => {
    console.log(result[value.author])
    currentAmount = result[value.author] || 0
    result[value.author] = (currentAmount + value.likes)
    return result 
  }, {})

  const entries = Object.entries(reduced)

  const max = _.maxBy(entries, (entry) => {
    return entry[1]
  })

  return {
    author: max[0],
    likes: max[1]
  }
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}
