const mongoose = require('mongoose')

const chatSessionSchema = new mongoose.Schema({
    participants: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    ],
    status : {
        type: String,
        default: "Active",
        enum: ["Active","Expired"]
    },
    expiresAt: { 
        type: Date,
        default: Date.now() + (24 * 60 * 60 * 1000),
        expires: 2 * 24 * 60 * 60 
    },
    messages : [
        {
            message : {
                type : String,
                trim: true
            },
            sender : {
                type : mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }
        }
    ]
  });

  const Chat = mongoose.model('Chat',chatSessionSchema);

  module.exports = Chat