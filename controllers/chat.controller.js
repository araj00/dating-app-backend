const Chat = require("../models/chat")

const getAllChats = async (req, res) => {
    try {
        const { _id } = req.login;

        const now = new Date().getTime();

        await Chat.updateMany({ expiresAt: { $lt: now }, status: "Active" },
            { $set: { "status": "Expired" } },
            {
                runValidators: true
            }).catch(err => {
                throw new Error(err);
            })


        const allChats = await Chat.find({ participants: { $in: [_id] } }).select('-messages');
        return res.status(200).json(
            {
                success: true,
                message: 'All ChatSessions fetched successfully',
                chats: allChats
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

const getChatById = async (req, res) => {
    try {
        const { id } = req.params;

        const now = new Date().getTime();

        await Chat.updateOne({ _id: id, expiresAt: { $lt: now }, status: "Active" },
            { $set: { "status": "Expired" } },
            {
                runValidators: true
            }).catch(err => {
                throw new Error(err);
            });

        const foundChat = await Chat.findById(id).catch(err => {
            throw new Error(err);
        })

        if (!foundChat) {
            return res.status(404).json(
                {
                    success: false,
                    message: 'no such chat found'
                }
            )
        }

        if(foundChat.status === "Expired"){
            return res.status(200).json(
                {
                    success: true,
                    message: 'Your session is expired. Please send a new invitation to start the chat'
                }
            )
        }

        return res.status(200).json(
            {
                success: true,
                message: 'chat fetched successfully',
                chat: foundChat
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

const sendMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const loggedInId = req.login._id;
        const { message } = req.body;

        const now = new Date().getTime();
        await Chat.updateOne({ _id: id, expiresAt: { $lt: now }, status: "Active" },
            { $set: { "status": "Expired" } },
            {
                runValidators: true
            }).catch(err => {
                throw new Error(err);
            });

        const foundChat = await Chat.findById(id).catch(err => {
            throw new Error(err);
        })

        if (!foundChat) {
            return res.status(404).json(
                {
                    success: false,
                    message: 'no such chat found'
                }
            )
        }

        if(foundChat.status === "Expired"){
            return res.status(200).json(
                {
                    success: true,
                    message: 'Your session is expired. Please send a new invitation to start the chat'
                }
            )
        }

        if (!foundChat.participants.includes(loggedInId)) {
            return res.status(403).json(
                {
                    success: false,
                    message: 'unauthorized access'
                }
            )
        }


        foundChat.messages.push({
            message,
            sender: loggedInId.toString()
        });

        await foundChat.save();

        return res.status(201).json({
            success: true,
            message: 'message sent successfully'
        })
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
    getAllChats,
    getChatById,
    sendMessage
}