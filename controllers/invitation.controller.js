const Invitation = require('../models/invitation');
const mongoose = require('mongoose');
const User = require('../models/user');
const Chat = require('../models/chat');
const objectId = mongoose.Types.ObjectId;

const createInvitation = async (req, res) => {
    try {
        const { _id } = req.login;
        const { recipientId } = req.body;

        const recipient = await User.findById({ _id: recipientId }).catch(err => {
            throw new Error(err);
        })

        if (!recipient) {
            return res.status(404).json(
                {
                    message: 'no recipient found'
                }
            )
        }

        const existingInvitation = await Invitation.findOne({ sender: _id, recipient: recipientId });

        if ((existingInvitation?.status !== "Expired" && existingInvitation?.status !== "Rejected") && existingInvitation) {
            return res.status(400).json(
                {
                    message: 'Invitation already exists.'
                }
            )
        }

        // if the invitation has been 
        if ((existingInvitation?.status === "Rejected" || existingInvitation?.status === "Expired") && existingInvitation) {
            return res.status(400).json(
                {
                    message: "You can send next invitation after 48hrs from day invitation sent"
                }
            )
        }

        if (recipientId !== _id.toString()) {
            const newInvitation = new Invitation(
                {
                    sender: _id,
                    recipient: recipientId
                }
            )
            await newInvitation.save();
            return res.status(201).json({
                success: true,
                message: 'Invitation has been sent successfully'
            })
        }
        else {
            return res.status(400).json(
                {
                    message: 'sender can not send the invitation to himself'
                }
            )
        }
    }
    catch (err) {
        return res.status(400).json(
            {
                message: err.message
            }
        )
    }
}

const getAllInvitations = async (req, res) => {
    try {
        const { _id } = req.login;

        const now = new Date().getTime();

        await Invitation.updateMany({ expiresAt: { $lt: now }, status: "Pending" },
            { $set: { "status": "Expired" } },
            {
                runValidators: true
            }).catch(err => {
                throw new Error(err);
            })

        const allInvitations = await Invitation.find({
            $or: [
                { sender: _id },
                { recipient: _id }
            ]
        }).catch(err => {
            throw new Error(err);
        })

        return res.status(200).json(
            {
                success: true,
                message: 'all invitations fetched successfully',
                allInvitations
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

const getInvitationById = async (req, res) => {
    try {
        const { id } = req.params

        const now = new Date().getTime();

        await Invitation.updateOne({ _id: id, expiresAt: { $lt: now }, status: "Pending" },
            { $set: { "status": "Expired" } },
            {
                runValidators: true
            }).catch(err => {
                throw new Error(err);
            });

        const foundInvitation = await Invitation.findById(id).catch(err => {
            throw new Error(err)
        });

        if (!foundInvitation) {
            return res.status(404).json(
                {
                    message: 'no such invitation available'
                }
            )
        }

        return res.status(200).json(
            {
                success: true,
                message: 'invitation fetched successfully',
                invitation: foundInvitation
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

const updateInvitation = async (req, res) => {
    try {
        const { _id } = req.login;
        const invitationId = req.params.id;
        const { response } = req.body;
        console.log(_id)
        const now = new Date().getTime();

        // before acceptance or rejection checking the invitation its expiry.
        await Invitation.updateOne({ _id: invitationId, expiresAt: { $lt: now }, status: "Pending" },
            { $set: { "status": "Expired" } },
            {
                runValidators: true
            }).catch(err => {
                throw new Error(err);
            });

        const foundInvitation = await Invitation.findById(invitationId).catch(err => {
            throw new Error(err);
        });

        if (!foundInvitation || foundInvitation.status === "Expired") {
            return res.status(404).json(
                {
                    success: false,
                    message: 'no such invitation found or it has been expired.'
                }
            )
        }

        // invitation can be updated in terms of acceptance or rejection by recipient only and nobody else
        if (foundInvitation.recipient.toString() === _id.toString()) {
            if (response === "Accepted") {

                const now = new Date().getTime();

                const existingChatSession = await Chat.findOne({
                    participants: { $all: [_id, foundInvitation.sender] },
                    expiresAt: { $gt: now }
                });

                if (existingChatSession) {
                    return res.status(200).json({
                        message: 'chat session is already created there.'
                    })
                }
                const newChatSession = new Chat({
                    participants: [_id, foundInvitation.sender]
                })

                foundInvitation.status = response;
                await foundInvitation.save()

                await newChatSession.save();

                return res.status(201).json(
                    {
                        success: true,
                        message: 'Request Accepted.Now You can start chatting with the User.'
                    }
                )
            }
            else if (response === "Rejected") {
                foundInvitation.status = response;
                await foundInvitation.save()
            }
            return res.status(201).json(
                {
                    success: true,
                    message: `invitation ${response} successfully`
                }
            )
        }
        else {
            return res.status(403).json(
                {
                    success: false,
                    message: 'unauthorized access'
                }
            )
        }
    }
    catch (err) {
        return res.status(400).json(
            {
                message: err.message
            }
        )
    }
}

const deleteInvitation = async (req, res) => {
    try {
        const { _id } = req.login;
        const invitationId = req.params.id;
        const foundInvitation = await Invitation.findById(invitationId).catch(err => {
            throw new Error(err);
        });

        if (!foundInvitation) {
            return res.status(404).json(
                {
                    success: false,
                    message: 'no such invitation created'
                }
            )
        }

        // only sender can delete the invitation and nobody else
        if (foundInvitation.sender.toString() === _id.toString()) {
            await foundInvitation.deleteOne().catch(err => {
                throw new Error(err)
            })
            return res.status(200).json(
                {
                    success: true,
                    message: 'Invitation deleted successfully'
                }
            )
        }
        else {
            return res.status(403).json({
                success: false,
                message: 'unauthorised access'
            })
        }

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
    createInvitation,
    getAllInvitations,
    getInvitationById,
    updateInvitation,
    deleteInvitation
}