const AWS = require('aws-sdk');
const s3 = new AWS.S3();

exports.generatePresignedUrl = (fileName) => {
    const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: fileName,
        Expires: 60 * 5 // URL expires in 5 minutes
    };
    return s3.getSignedUrl('putObject', params);
};
