const Cafe = require("../models/cafe")

const getAllCafeVenues = async (req, res) => {
    try {
        const allCafes = await Cafe.find({ location: req.login.location }).select('-menu').catch(err => {
            throw new Error(err);
        })

        return res.status(200).json(
            {
                success: true,
                message: 'all venues fetched successfully',
                cafes: allCafes
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
const getCafeById = async (req, res) => {
    try {
        const { id } = req.params;
        const cafe = await Cafe.findById(id).catch(err => {
            throw new Error(err);
        })

        if (!cafe) {
            return res.status(404).json(
                {
                    message: 'no such cafe found'
                }
            )
        }

        return res.status(200).json(
            {
                success: true,
                message: 'cafe fetched successfully',
                data: cafe
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
    getAllCafeVenues,
    getCafeById
}