const posts = [
  {
    username: "Yuri",
    title: "Post 1",
  },
  {
    username: "Maya",
    title: "Post 2",
  },
]

exports.list = function(req, res) {
  res.json(posts.filter(post => post.username === req.user.name))
}