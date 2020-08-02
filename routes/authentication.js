const express = require("express")
const router = express.Router();
const auth = require("../controllers/authentication")

router.get("/login", (req, res) => {
  res.render("login.ejs")
})

router.get("/register", (req, res) => {
  res.render("register.ejs")
})

router.post("/login", auth.login)
router.delete("/logout", auth.logout)
router.post("/register", auth.register)
router.post("/token", auth.token)

module.exports = router;