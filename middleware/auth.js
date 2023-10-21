const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Chat = require('../models/chat');

const verifyJwt = async (req, res, next) => {
    try {
        if (req.headers.authorization.startsWith('Bearer') || (req.headers.Authorization.startsWith('Bearer'))) {
            const token = req.headers.authorization.split(' ')[1] || req.headers.Authorization.split(' ')[1]
            if (token) {
                jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decoded) => {
                    if (err) {
                        return res.status(401).json({
                            message: 'Token expired.Login Again'
                        }
                        )
                    }
                    const user = await User.findById(decoded.id)
                    req.login = user
                    next()
                })
            }

            else {
                res.status(403).json(
                    { message: 'token is not present in headers' }
                )
            }
        }
        else {
            res.status(403).json(
                { message: 'headers does not have a bearer token' }
            )
        }
    }
    catch (err) {
        console.log(err)
    }
}

const checkChatActiveSession = async (req, res, next) => {
    try {
        const chatId = req.body.chatId;

        const now = new Date().getTime();

        await Chat.updateOne({ _id: chatId, expiresAt: { $lt: now }, status: "Active" },
            { $set: { "status": "Expired" } },
            {
                runValidators: true
            }).catch(err => {
                throw new Error(err);
            });
        const existingChat = await Chat.findOne({ _id: chatId, participants : {$in : [req.login._id]}}).select('-messages').catch(err => {
            throw new Error(err);
        })
        if (!existingChat || existingChat?.status === "Expired") {
            return res.status(400).json(
                {
                    message: 'This feature available during chat duration only.'
                }
            )
        }
        return next()
    }
    catch (err) {
        return res.status(400).json(
            {
                message: err.message
            }
        )
    }
}

module.exports = { verifyJwt, checkChatActiveSession };