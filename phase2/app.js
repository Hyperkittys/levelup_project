const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 데이터베이스 연결
const db = new sqlite3.Database('./users.db');

// 사용자 테이블 생성
db.run(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE,
  password TEXT
)`);

// 회원가입 (basic_backend.js에서 가져옴)
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], (err) => {
      if (err) {
        res.status(400).json({ message: '사용자 등록 실패' });
      } else {
        res.status(201).json({ message: '사용자 등록 성공' });
      }
    });
  } catch {
    res.status(500).json({ message: '서버 오류' });
  }
});

// 로그인 (basic_backend.js에서 가져옴)
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
    if (err) {
      res.status(500).json({ message: '서버 오류' });
    } else if (!user) {
      res.status(400).json({ message: '사용자를 찾을 수 없습니다' });
    } else {
      try {
        if (await bcrypt.compare(password, user.password)) {
          const token = jwt.sign({ username: user.username }, 'your_jwt_secret', { expiresIn: '1h' });
          res.json({ token });
        } else {
          res.status(400).json({ message: '비밀번호가 일치하지 않습니다' });
        }
      } catch {
        res.status(500).json({ message: '서버 오류' });
      }
    }
  });
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
