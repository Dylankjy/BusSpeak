const express = require('express')
const router = express.Router()

router.get('/', (req, res) => {
    return res.json('Hello World!')
})

router.get('*', (req, res) => {
    return res.json({
        'code': 404,
        'name': 'Not Found',
        'message': 'The requested URL was not found on the server. If you entered the URL manually please check your spelling and try again.'
    })
})

module.exports = router
