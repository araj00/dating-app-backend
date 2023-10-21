const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        maxlength: 50,
        required: true
    },
    email: {
        type: String,
        trim: true,
        unique: true,
        required: true,
        lowercase: true
    },
    password: {
        type: String,
        minlength: 5,
        required: true
    },
    address: {
        type: String,
        maxlength: 150,
        required: true
    },
    gender: {
        type: String,
        enum: ['Male', 'Female'],
        required: true
    },
    dateOfBirth: {
        type: Date,
        required: true
    },
    location: String,
    bio: {
        type: String,
        maxlength: 500
    },
    likedUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],

    interests: [String],

    profilePicture: String,

    refreshTokens: {
        type: [String],
        default: []
    }
},
    {
        toJSON: {
            transform: function (doc, ret) {
              // Remove the sensitive data properties and unnecessary data from the response
              delete ret.password;
              delete ret.__v;
              delete ret.createdAt,
              delete ret.updatedAt
            }},
        timestamps: true
    })


userSchema.pre('save', async function (next) {
    var user = this;
    try {
        if (!user.isModified('password')) {
            return next()
        }

        user.password = await bcrypt.hash(user.password, 12)
        return next()
    }
    catch (err) {
        return next(err)
    }
});

userSchema.methods.passwordMatch = async function (enteredPassword) {
    const isMatch = await bcrypt.compare(enteredPassword,this.password)
    return isMatch
}

userSchema.index({ name: 'text'});

const User = mongoose.model('User', userSchema);

module.exports = User 