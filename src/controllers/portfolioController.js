const s3Util = require('../utils/s3Util');

exports.getPresignedUrl = (req, res) => {
    try {
        const { fileName } = req.query;
        const url = s3Util.generatePresignedUrl(fileName);
        res.json({ url });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
