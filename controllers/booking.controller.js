const Booking = require("../models/booking");

const getAllBookings = async (req, res) => {
    try {
        const allBookings = await Booking.find({ user: req.login._id }).catch(err => {
            throw new Error(err);
        })

        return res.status(200).json(
            {
                success: true,
                message: 'all bookings fetched successfully',
                data: allBookings
            }
        )
    }
    catch (err) {
        return res.status(400).json(
            {
                message: err.message
            }
        )
    }
}

const getBookingById = async (req, res) => {
    try {
        const { id } = req.params;
        const booking = await Booking.findById(id).catch(err => {
            throw new Error(err);
        })

        if (!booking) {
            return res.status(404).json(
                {
                    message: 'no such booking found'
                }
            )
        }

        return res.status(200).json(
            {
                success: true,
                message: 'booking fetched successfully',
                data: booking
            }
        )
    }
    catch (err) {
        return res.status(400).json(
            {
                message: err.message
            }
        )
    }
}

const bookReservation = async (req, res) => {
    try {
        const { _id } = req.login;
        const { cafeId, startTime, endTime } = req.body;

        const existingBooking = await Booking.findOne({ user: _id, cafe: cafeId }).catch(err => {
            throw new Error(err);
        })

        if (existingBooking) {
            return res.status(400).json(
                {
                    message: 'booking already done.'
                }
            )
        }

        const newBooking = new Booking({
            user: _id,
            cafe: cafeId,
            startTime,
            endTime
        })
        await newBooking.save();

        return res.status(201).json(
            {
                success: true,
                message: 'booking done successfully.',
                data: newBooking
            }
        )
    }
    catch (err) {
        return res.status(400).json(
            {
                message: err.message
            }
        )
    }
}

const updateReservation = async (req, res) => {
    try {
        const { _id:loggedInUserId } = req.login;
        const {id} = req.params;
        const { cafeId, status } = req.body;

        const existingBooking = await Booking.findOne({ _id: id, user: loggedInUserId, cafe: cafeId }).catch(err => {
            throw new Error(err);
        })

        if (!existingBooking) {
            return res.status(400).json(
                {
                    message: 'booking not found.'
                }
            )
        }

        existingBooking.status = status;
        await existingBooking.save();

        return res.status(201).json(
            {
                success: true,
                message: 'booking done successfully.',
                data: existingBooking
            }
        )
    }
    catch (err) {
        return res.status(400).json(
            {
                message: err.message
            }
        )
    }
}

module.exports = {
    getAllBookings,
    getBookingById,
    bookReservation,
    updateReservation
}