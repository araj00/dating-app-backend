const jwt = require('jsonwebtoken');

const generateAccessToken = (id) => {
    return jwt.sign({ id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '5m' })
}

const generateRefreshToken = (id) => {
    return jwt.sign({ id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '3d' })
}

module.exports = { generateAccessToken, generateRefreshToken }