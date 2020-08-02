require("dotenv").config()

const jwt = require("jsonwebtoken")
const express = require("express")
const router = express.Router()

const authRoutes = require("./authentication")
const postsRoutes = require("./posts")

router.get("/", (req, res) => {
  res.render("index.ejs", { name: "Yuri" })
})

router.use("/", authRoutes)
router.use("/posts", authenticateToken, postsRoutes)

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

module.exports = router;