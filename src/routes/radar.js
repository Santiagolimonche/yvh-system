const express = require('express')
const getProtocol = require('../middlewares/orders')

const router = express.Router()
router.post("/", getProtocol, (req, res) => {})

module.exports = router