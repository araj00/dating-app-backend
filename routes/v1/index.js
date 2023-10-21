const express = require('express');
const router = express.Router();
const usersComponent = require('./user.route');
const invitationComponent = require('./invitation.route')
const chatComponent = require('./chat.route')
const cafeComponent = require('./cafe.route')
const bookingComponent = require('./booking.route')

/*
 ENDPOINTS: '/api/v1
*/

router.use('/users',usersComponent);
router.use('/invitation',invitationComponent)
router.use('/chats',chatComponent)
router.use('/cafes',cafeComponent)
router.use('/bookings',bookingComponent)

module.exports = router