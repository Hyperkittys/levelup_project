document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();
        if (response.ok) {
            document.getElementById('loginMessage').textContent = '로그인 성공!';
            localStorage.setItem('token', data.token);
            localStorage.setItem('username', username);  // 사용자 이름 저장
            window.location.href = '/dashboard.html';  // 대시보드 페이지로 리다이렉트
        } else {
            document.getElementById('loginMessage').textContent = '로그인 실패: ' + data.message;
        }
    } catch (error) {
        document.getElementById('loginMessage').textContent = '오류 발생: ' + error.message;
    }
});

document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('registerUsername').value;
    const password = document.getElementById('registerPassword').value;

    try {
        const response = await fetch('/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();
        if (response.ok) {
            document.getElementById('registerMessage').textContent = '회원가입 성공!';
        } else {
            document.getElementById('registerMessage').textContent = '회원가입 실패: ' + data.message;
        }
    } catch (error) {
        document.getElementById('registerMessage').textContent = '오류 발생: ' + error.message;
    }
});
