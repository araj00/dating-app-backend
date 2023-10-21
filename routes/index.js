const express = require('express');
const router = express.Router();
const routerV1 = require('./v1')

/*
 ENDPOINTS: '/api/v1
*/

router.get('/',(req,res) => {
    res.send("KINDER API is running!!!");
})

router.use('/api/v1',routerV1);

module.exports = router;