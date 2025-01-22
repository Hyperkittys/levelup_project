const s3Service = require('./s3Service');
const vectorService = require('./vectorService');
const { Image } = require('../models/image');

exports.processAndSaveImage = async (file) => {
    const s3Url = await s3Service.uploadToS3(file);
    const features = await vectorService.extractFeatures(file.buffer);

    const image = await Image.create({
        url: s3Url,
        vector: features,
    });

    return {
        id: image.id,
        url: image.url,
        vectorLength: features.length,
    };
};

