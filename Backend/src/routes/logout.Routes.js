const express = require('express')
const router = express.Router()

const { logout } = require('../controllers/logout.Controller')

router.post('/logout', logout)

module.exports = router