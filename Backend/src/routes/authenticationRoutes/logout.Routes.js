const express = require('express')
const router = express.Router()

const { logout } = require('../../controllers/authentication/logout.Controller')

router.post('/logout', logout)

module.exports = router