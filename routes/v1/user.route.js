const express = require('express');
const router = express.Router();
const { registerController,
    handleLogin,
    handleRefreshToken,
    handleLogout,
    updateProfile,
    deleteProfile,
    searchProfiles,
    getProfiles,
    changePassword,
} = require('../../controllers/user.controller');
const { verifyJwt } = require('../../middleware/auth');

//=================================
//             User
//=================================

router.post("/register", registerController);
router.post('/login', handleLogin);
router.post('/refresh-token', handleRefreshToken);
router.post('/logout', handleLogout);
router.patch('/updateProfile', verifyJwt, updateProfile);
router.delete('/deleteProfile', verifyJwt, deleteProfile);
router.get('/searchProfiles', searchProfiles);
router.get('/getProfiles', verifyJwt, getProfiles)
router.patch('/changePassword', verifyJwt, changePassword)

module.exports = router;
