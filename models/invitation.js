const mongoose = require('mongoose');

const invitationSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true
    },
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date, 
        default: Date.now()
    },
    status: {
      type: String,
      default: 'Pending',
      enum: ['Accepted','Rejected','Pending','Expired']
    },
    expiresAt: {
        type: Date,
        default: Date.now() + (24 * 60 * 60 * 1000) ,// 24 hours expiring
        expires: 24 * 60 *60
    }
});


const Invitation = mongoose.model('Invitation', invitationSchema);

module.exports = Invitation;