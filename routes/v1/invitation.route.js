const express = require('express');
const {verifyJwt} = require('../../middleware/auth');
const { createInvitation, getAllInvitations, getInvitationById, updateInvitation, deleteInvitation,
} = require('../../controllers/invitation.controller');
const router = express.Router();

//=================================
// ENDPOINTS: '/api/v1/invitation'
//=================================

router.route('/')
      .post(verifyJwt,createInvitation)
      .get(verifyJwt,getAllInvitations)

router.route('/:id')
      .get(getInvitationById)
      .patch(verifyJwt,updateInvitation) // reject or accept invitation
      .delete(verifyJwt,deleteInvitation)


module.exports = router;