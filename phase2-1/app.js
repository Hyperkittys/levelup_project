const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Sequelize 설정
const sequelize = new Sequelize('postgres', 'postgres', '1234qwer', {
  host: 'database-1.c3aw8e6q643a.ap-northeast-2.rds.amazonaws.com',
  dialect: 'postgres',
  port: 5432,
  logging: console.log,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});

// User 모델 정의
const User = sequelize.define('User', {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

// 데이터베이스 동기화
sequelize.sync({ force: false }).then(() => {
  console.log('데이터베이스 동기화 완료');
}).catch((error) => {
  console.error('데이터베이스 동기화 오류:', error);
});

// 회원가입
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({ username, password: hashedPassword });
    res.status(201).json({ message: '사용자 등록 성공' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '서버 오류' });
  }
});

// 로그인
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(400).json({ message: '사용자를 찾을 수 없습니다' });
    }
    if (await bcrypt.compare(password, user.password)) {
      const token = jwt.sign({ username: user.username }, 'your_jwt_secret', { expiresIn: '1h' });
      res.json({ token });
    } else {
      res.status(400).json({ message: '비밀번호가 일치하지 않습니다' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '서버 오류' });
  }
});

// 인증 미들웨어 (basic_backend.js에서 가져옴)
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, 'your_jwt_secret', (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// 보호된 라우트 (basic_backend.js에서 가져옴)
app.get('/protected', authenticateToken, (req, res) => {
  res.json({ message: '보호된 데이터에 접근했습니다', user: req.user });
});

// 루트 경로 처리 (새로 추가)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// auth.html 라우트 추가
app.get('/auth.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'auth.html'));
});

// 로그아웃 엔드포인트 추가
app.post('/logout', (req, res) => {
    // 서버 측에서 할 일이 없으므로 간단히 성공 응답만 보냅니다.
    res.json({ message: '로그아웃 성공' });
});

// 대시보드 라우트 추가
app.get('/dashboard.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// 아이템 목록 조회 엔드포인트 추가
app.get('/items', authenticateToken, (req, res) => {
  // 여기서는 예시 데이터를 반환합니다. 실제로는 데이터베이스에서 아이템을 조회해야 합니다.
  const items = [
    { id: 1, name: "Item 1" },
    { id: 2, name: "Item 2" },
    { id: 3, name: "Item 3" }
  ];
  res.json(items);
});

app.listen(3000, () => {
  console.log('서버가 포트 3000에서 실행 중입니다.');
});
