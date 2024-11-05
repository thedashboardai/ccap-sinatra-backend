const s3Util = require('../utils/s3Util');
const Portfolio = require('../models/Portfolio');

exports.getPresignedUrl = (fileName) => {
    return s3Util.generatePresignedUrl(fileName);
};

exports.savePortfolioEntry = async (userId, fileName, fileUrl, description) => {
    return await Portfolio.create({
        user_id: userId,
        file_name: fileName,
        file_url: fileUrl,
        description
    });
};
