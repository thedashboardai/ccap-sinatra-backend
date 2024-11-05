const Profile = require('../models/Profile');

exports.getProfileByUserId = async (userId) => {
    return await Profile.findOne({ where: { user_id: userId } });
};

exports.updateProfileByUserId = async (userId, profileData) => {
    const profile = await Profile.findOne({ where: { user_id: userId } });
    if (profile) {
        return await profile.update(profileData);
    }
    return null;
};
