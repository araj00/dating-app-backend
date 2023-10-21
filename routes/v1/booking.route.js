const express = require('express');
const router = express.Router();

const { verifyJwt, checkChatActiveSession } = require('../../middleware/auth');
const { getAllBookings, getBookingById, bookReservation, updateReservation } = require('../../controllers/booking.controller');

//=================================
// ENDPOINTS: '/api/v1/bookings'
//=================================

router.use(verifyJwt)
router.get('/', getAllBookings)
router.get('/:id', getBookingById)
router.post('/bookReservation',checkChatActiveSession, bookReservation)
router.patch('/updateReservation/:id', updateReservation) // for canceling the reservation or undoing it.

module.exports = router;