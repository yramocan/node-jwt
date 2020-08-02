require("dotenv").config()

const jwt = require("jsonwebtoken")
const express = require("express")
const app = express()

app.use(express.json())

let refreshTokens = []

app.post("/token", (req, res) => {
  const refreshToken = req.body.token
  if (refreshToken == null) return res.sendStatus(401)

  if (!refreshTokenIsValid()) {
    removeRefreshToken(refreshToken)
    return res.sendStatus(403)
  }
    
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403)
    const accessToken = generateAccessToken({ name: user.name })
    res.json({ accessToken: accessToken })
  })
})

app.post("/login", (req, res) => {
  const user = { name: req.body.username }
  const accessToken = generateAccessToken(user)
  
  const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET)
  storeRefreshToken(refreshToken, user)

  res.json({ 
    accessToken: accessToken, 
    refreshToken: refreshToken 
  })
})

app.delete("/logout", (req, res) => {
  removeRefreshToken(req.body.token)
  res.sendStatus(204)
})

function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15s" })
}

function refreshTokenIsValid(refreshToken) {
  return refreshTokens.includes(refreshToken)
}

function removeRefreshToken(refreshToken) {
  refreshTokens = refreshTokens.filter(token => token !== refreshToken)
}

function storeRefreshToken(refreshToken, user) {
  refreshTokens.push(refreshToken)
}

app.listen(4000)