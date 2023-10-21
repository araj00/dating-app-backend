const User = require('../models/user');
const { generateAccessToken, generateRefreshToken } = require('../config/refreshToken');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken')

const registerController = async (req, res) => {
    try {
        const { name, email, password, gender, address, dateOfBirth } = req.body

        if (!name || !email || !gender || !address || !password || !dateOfBirth) {
            return res.status(400).json({
                error: 'all important fields are required',
                success: false
            })
        }
        const currentYear = new Date().getFullYear();
        const dateOfBirthYear = new Date(dateOfBirth).getFullYear();

        if (currentYear - dateOfBirthYear < 18) {
            return res.status(400).json({
                message: 'Under 18 yrs age not allowed or dob more than current year not permissible'
            })
        }
        const existingUser = await User.findOne({ email })

        if (existingUser) {
            return res.status(400).json(
                {
                    error: 'user already exists',
                    success: false
                }
            )
        }

        const newUser = new User(req.body);
        await newUser.save()

        return res.status(201).json({
            success: true,
            message: 'new user created successfully',
            newUser
        })
    }
    catch (err) {
        res.status(400).json(
            {
                message: err.message
            }
        )
    }
}


const handleLogin = async (req, res) => {
    try {
        const { email, password } = req.body
        if (!email || !password) {
            return res.status(400).json(
                {
                    message: 'please provide required credentials'
                }
            )
        }

        const findUser = await User.findOne({ email })

        if (findUser && (await findUser.passwordMatch(password))) {
            const cookies = req.cookies
            let newAccessToken = generateAccessToken(findUser._id);
            let newRefreshToken = generateRefreshToken(findUser._id);

            let refreshTokenArray = cookies?.refreshToken ? findUser.refreshTokens.filter(refreshToken => refreshToken !== cookies.refreshToken) : findUser.refreshTokens

            if (cookies?.refreshToken) {
                const foundUser = await User.findOne({ refreshTokens: cookies.refreshToken })

                if (!foundUser) {
                    refreshTokenArray = [];
                    res.clearCookie('refreshToken', newRefreshToken, {
                        httpOnly: true,
                        secure: false,
                        sameSite: 'none'
                    })
                }
            }
            refreshTokenArray = [...refreshTokenArray, newRefreshToken]
            findUser.refreshTokens = refreshTokenArray;

            res.cookie('refreshToken', newRefreshToken, {
                httpOnly: true,
                secure: false,
                maxAge: 72 * 60 * 60 * 1000,
                sameSite: 'none'
            })
            await findUser.save();
            res.status(201).json(
                {
                    message: 'login successfully',
                    success: true,
                    user: findUser,
                    accessToken: newAccessToken,
                }
            )
        }
        else {
            return res.status(403).json(
                {
                    message: 'unauthorized access'
                }
            )
        }
    }

    catch (err) {
        res.status(400).json({
            message: err.message
        })
    }
};

// handleRefreshToken to find and prevent the hacking purpose using Refresh Token Rotation. It also promotes multiple login from different devices.
const handleRefreshToken = async (req, res) => {
    const cookies = req.cookies;
    if (!cookies?.refreshToken) return res.sendStatus(401);
    const refreshToken = cookies.refreshToken;
    res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'None', secure: false });

    const foundUser = await User.findOne({ refreshTokens: { $in: [refreshToken] } }).then(user => {

        return user
    }).catch(err => {
        console.log('catching error in finding user', err)
    });

    // Detected refresh token reuse!
    if (!foundUser) {
        jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET,
            async (err, decoded) => {
                if (err) return res.sendStatus(403); //Forbidden
                console.log('attempted refresh token reuse!')
                const hackedUser = await User.findByIdAndUpdate(decoded.id, {
                    $set: { refreshTokens: [] }
                }, {
                    new: true
                });

            }
        )
        return res.status(403).json(
            {
                message: 'you are hacked'
            }
        ); //Forbidden
    }

    const newRefreshTokenArray = foundUser.refreshTokens.filter(rt => rt !== refreshToken);

    // evaluate jwt 
    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        async (err, decoded) => {
            if (err) {
                console.log('expired refresh token')
                foundUser.refreshTokens = [...newRefreshTokenArray];
                await foundUser.save();
            }
            if (err) return res.sendStatus(403);

            // Refresh token was still valid
            const accessToken = generateAccessToken(decoded.id)

            const newRefreshToken = generateRefreshToken(decoded.id)
            // Saving refreshToken with current user
            foundUser.refreshTokens = [...newRefreshTokenArray, newRefreshToken];
            const result = await foundUser.save();

            // Creates Secure Cookie with refresh token
            res.cookie('refreshToken', newRefreshToken, { httpOnly: true, secure: false, sameSite: 'None', maxAge: 72 * 60 * 60 * 1000 });

            res.json({ accessToken })
        }
    );
}

const handleLogout = async (req, res) => {

    const cookie = req?.cookies

    const refreshToken = cookie?.refreshToken;

    if (!refreshToken) {
        res.clearCookie('refreshToken',
            {
                httpOnly: true,
                secure: false,
                sameSite: 'none'
            })
        return res.status(403).json({
            message: 'logged out successfully'
        })
    }

    const findUser = await User.findOne({ refreshTokens: refreshToken })

    let refreshTokenArray = findUser.refreshTokens.filter(refreshToken => refreshToken !== cookie.refreshToken)
    findUser.refreshTokens = [...refreshTokenArray]

    await findUser.save()
    res.clearCookie('refreshToken',
        {
            httpOnly: true,
            secure: false,
            sameSite: 'none'
        })
    return res.status(200).json(
        {
            message: 'successfully logout',
            success: true
        }
    )

}

const updateProfile = async (req, res) => {
    try {
        // const { _id } = req.login;
        const _id = new mongoose.Types.ObjectId(req.login._id);
        await User.findByIdAndUpdate(_id,
            { ...req.body },
            {
                new: true,
                runValidators: true
            }
        ).catch(err => {
            console.log(err.message)
            throw new Error(err);
        })
        return res.status(201).json(
            {
                success: true,
                message: 'User profile updated successfully'
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

const deleteProfile = async (req, res) => {
    try {
        const _id = new mongoose.Types.ObjectId(req.login._id);
        await User.findByIdAndDelete(_id).then((user) => console.log(user))
            .catch(err => { throw new Error(err) });

        return res.status(204).json({
            success: true,
            message: 'User Profile deleted successfully'
        })
    }
    catch (err) {
        return res.status(400).json({
            message: err.message
        })
    }

}

const searchProfiles = async (req, res) => {

    try {
        const { search, gender } = req.query;
        const query = {};

        if (search) {
            query.$text = { $search: search };
        }
        if (gender) {
            query["gender"] = gender
        }

        const searchProfiles = await User.find(query).catch(err => { throw new Error(err) });

        if (!searchProfiles.length) {
            return res.status(200).json(
                {
                    message: 'no such users found'
                }
            )
        }

        return res.status(200).json(
            {
                success: true,
                profiles: searchProfiles,
                message: 'User profiles fetched successfully'
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

const getProfiles = async (req, res) => {
    try {
        const { _id } = req.login;
        const loggedInUser = await User.findById(new mongoose.Types.ObjectId(_id));
        const query = {}
        const gender = loggedInUser.gender;

        if (gender === "Male") {
            query.gender = "Female";
        }
        else {
            query.gender = "Male"
        }

        const dateOfBirth = loggedInUser.dateOfBirth;
        const birthYear = dateOfBirth.getFullYear();

        const minBirthDate = new Date(birthYear - 1, 0, 1);
        const maxBirthDate = new Date(birthYear + 3, 0, 1);

        query.dateOfBirth = { $gte: minBirthDate, $lte: maxBirthDate };
        query.location = loggedInUser.location;

        const suggestedProfiles = await User.find(query);

        return res.status(200).json({
            success: true,
            message: 'Users fetched successfully',
            suggestedProfiles
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

const changePassword = async (req, res) => {
    try {
        const { _id } = req.login;
        const { password } = req.body;
        const user = await User.findById(_id)
        if (password) {
            user.password = password;

            const updatedUserWithPassword = await user.save()
            res.json({
                message: `successfully updated the passwor with user id ${user._id}`,
                success: true,
                updatedUserWithPassword
            })
        }
        else {
            res.json({
                message: 'password is not changed'
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
    registerController,
    handleLogin,
    handleRefreshToken,
    handleLogout,
    updateProfile,
    deleteProfile,
    searchProfiles,
    getProfiles,
    changePassword
}