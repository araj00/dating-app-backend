const express = require('express');
const { checkChatActiveSession, verifyJwt } = require('../../middleware/auth');
const { getAllCafeVenues, getCafeById } = require('../../controllers/cafe.controller');

const router = express.Router();

//=================================
// ENDPOINTS: '/api/v1/cafes'
//=================================

// checkChatActiveSession middleware check for the activesession then only exposes the api of cafe endpoints.
router.get('/', verifyJwt, checkChatActiveSession, getAllCafeVenues)
router.get('/:id', verifyJwt, checkChatActiveSession, getCafeById)

module.exports = router;