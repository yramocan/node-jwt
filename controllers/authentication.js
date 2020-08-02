require("dotenv").config()

const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

let refreshTokens = []
let users = []

exports.login = function(req, res) {
  const user = users.find(user => user.email === req.body.email)

  if (user == null) {
    return res.sendStatus(401)
  }

  checkPassword(req.body.password, user)
  .then((isCorrect) => {
    if (!isCorrect) return res.status(401).send({ message: "Incorrect password." })

    const { password, ...usr } = user
    
    res.json({
      ...usr,
      accessToken: generateAccessToken(usr), 
      refreshToken: generateRefreshToken(usr) 
    })
  }).catch((err) => {
    return res.status(500).send(err)
  })
}

exports.logout = function(req, res) {
  removeRefreshToken(req.body.token)
  res.sendStatus(204)
}

exports.register = function(req, res) {
  hashPassword(req.body.password).then((password) => {
    const user = addUser(req.body.name, req.body.email, password)

    res.status(201).send({ 
      ...user,
      accessToken: generateAccessToken(user),
      refreshToken: generateRefreshToken(user)
    })
  }).catch((err) => {
    console.log(err.message)
    res.sendStatus(500, err.message)
  })
}

exports.token = function(req, res) {
  const refreshToken = req.body.token
  if (refreshToken == null) return res.sendStatus(401)

  if (!refreshTokenIsValid(refreshToken)) {
    removeRefreshToken(refreshToken)
    return res.sendStatus(403)
  }
    
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403)
    const accessToken = generateAccessToken({ name: user.name })
    res.json({ accessToken: accessToken })
  })
}

/* 
  Helper Functions
*/

function addUser(name, email, password) {
  const user = {
    id: Date.now().toString(),
    name: name,
    email: email,
    password: password
  }

  users.push(user)

  return {
    id: Date.now().toString(),
    name: name,
    email: email
  }
}

async function checkPassword(password, user) {
  try {
    return await bcrypt.compare(password, user.password)
  } catch {
    throw new Error("An error occurred while verifying the password.")
  }
}

function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1m" })
}

function generateRefreshToken(user) {
  const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET)
  storeRefreshToken(refreshToken, user)
  return refreshToken
}

async function hashPassword(password) {
  try {
    const hashedPassword = await bcrypt.hash(password, 10)
    return hashedPassword
  } catch(err) {
    throw new Error(err.message)
  }
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