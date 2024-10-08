const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = 3000;
const secretKey = 'your_secret_key'; // 실제 환경에서는 안전하게 관리해야 합니다.

// 데이터베이스 연결
const db = new sqlite3.Database('./database.sqlite');

// 사용자 테이블 생성
db.run(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE,
  password TEXT
)`);

app.use(express.json());

// 회원가입
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], (err) => {
      if (err) {
        res.status(400).json({ error: '사용자 등록 실패' });
      } else {
        res.status(201).json({ message: '사용자 등록 성공' });
      }
    });
  } catch (error) {
    res.status(500).json({ error: '서버 오류' });
  }
});

// 로그인
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
    if (err) {
      res.status(500).json({ error: '서버 오류' });
    } else if (!user) {
      res.status(401).json({ error: '인증 실패' });
    } else {
      const match = await bcrypt.compare(password, user.password);
      if (match) {
        const token = jwt.sign({ userId: user.id }, secretKey, { expiresIn: '1h' });
        res.json({ token });
      } else {
        res.status(401).json({ error: '인증 실패' });
      }
    }
  });
});

// 인증 미들웨어
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, secretKey, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// 보호된 라우트 예시
app.get('/protected', authenticateToken, (req, res) => {
  res.json({ message: '인증된 사용자만 접근 가능한 리소스입니다.' });
});

// 기존 라우트에 인증 미들웨어 적용
app.use('/items', authenticateToken);

// 서버 시작
app.listen(port, () => {
  console.log(`서버가 http://localhost:${port}에서 실행 중입니다.`);
});
