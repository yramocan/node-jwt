require("dotenv").config()

const jwt = require("jsonwebtoken")
const express = require("express")
const app = express()

app.use(express.json())

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

app.get("/posts", authenticateToken, (req, res) => {
  res.json(posts.filter(post => post.username === req.user.name))
})

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]

  if (token == null) res.sendStatus(401)

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403)
    req.user = user
    next()
  })
}

app.listen(3000)