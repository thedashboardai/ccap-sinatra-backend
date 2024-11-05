const Profile = require('../models/Profile');
const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
    const token = req.header('Authorization').replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'Access Denied' });

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ message: 'Invalid Token' });
        req.user = decoded;
        next();
    });
}

exports.getProfile = async (req, res) => {
    try {
        const profile = await Profile.findOne({ where: { user_id: req.user.userId } });
        if (!profile) return res.status(404).json({ message: 'Profile not found' });

        res.json(profile);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const profile = await Profile.findOne({ where: { user_id: req.user.userId } });
        if (!profile) return res.status(404).json({ message: 'Profile not found' });

        await profile.update(req.body);

        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
