const AWS = require('aws-sdk');
const config = require('../config');

const s3 = new AWS.S3({
    accessKeyId: config.s3.accessKeyId,
    secretAccessKey: config.s3.secretAccessKey,
    region: config.s3.region,
});

exports.uploadToS3 = async (file) => {
    const params = {
        Bucket: config.s3.bucketName,
        Key: `images/${Date.now()}-${file.originalname}`,
        Body: file.buffer,
        ContentType: file.mimetype,
    };

    const result = await s3.upload(params).promise();
    return result.Location;
};

