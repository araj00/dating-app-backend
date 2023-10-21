const express = require('express');

const {verifyJwt} = require('../../middleware/auth');

const { getAllChats,
    getChatById,
    sendMessage,
} = require('../../controllers/chat.controller');

const router = express.Router();

//=================================
// ENDPOINTS: '/api/v1/chats'
//=================================

router.use(verifyJwt)
router.get('/', getAllChats)
router.get('/:id',getChatById)
router.patch('/send/:id',sendMessage)



module.exports = router;