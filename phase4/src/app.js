const express = require('express');
const { sequelize } = require('./models/image');
const imageRoutes = require('./routes/imageRoutes');
const { loadModel } = require('./services/vectorService');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 기본 라우터 설정
app.get('/', (req, res) => {
    res.send('서버가 정상적으로 실행 중입니다.');
});

// 이미지 업로드 라우터 설정
app.use('/api', imageRoutes);

async function startServer() {
    try {
        await sequelize.sync();
        console.log('데이터베이스 연결 성공');

        await loadModel(); // 모델 로드
        console.log('MobileNet 모델 로드 완료');

        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => console.log(`서버가 ${PORT} 포트에서 실행 중입니다.`));
    } catch (error) {
        console.error('서버 시작 실패:', error);
    }
}

startServer();
