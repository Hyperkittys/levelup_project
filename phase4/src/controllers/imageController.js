const imageService = require('../services/imageService');

exports.uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: '이미지 파일이 필요합니다.' });
        }

        const result = await imageService.processAndSaveImage(req.file);
        res.status(201).json(result);
    } catch (error) {
        console.error('이미지 업로드 중 오류:', error); // 오류 세부 정보 출력
        res.status(500).json({ error: '이미지 처리 중 오류가 발생했습니다.', details: error.message }); // 오류 메시지 포함
    }
};

