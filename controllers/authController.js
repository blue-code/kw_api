import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// 임시 사용자 데이터 (실제 환경에서는 데이터베이스 사용)
const users = [
  { id: 1, username: 'user1', password: 'password1' }, // 실제 환경에서는 비밀번호를 해시하여 저장해야 합니다.
  { id: 2, username: 'user2', password: 'password2' },
];

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;

/**
 * 사용자 로그인 및 토큰 생성
 * POST /auth/token
 * body: { username, password }
 */
export const login = (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }

  // 임시 사용자 데이터에서 사용자 찾기
  const user = users.find(u => u.username === username);

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials.' });
  }

  // 비밀번호 비교 (실제 환경에서는 bcrypt.compareSync 사용)
  if (user.password !== password) {
    return res.status(401).json({ message: 'Invalid credentials.' });
  }

  // JWT 생성
  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });

  res.status(200).json({
    message: 'Login successful',
    token,
    expiresIn: JWT_EXPIRES_IN,
  });
};

/**
 * 토큰 유효성 검증
 * POST /auth/validate
 * body: { token }
 */
export const validateToken = (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: 'Token is required.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.status(200).json({
      message: 'Token is valid.',
      user: decoded,
    });
  } catch (error) {
    res.status(401).json({
      message: 'Token is invalid or expired.',
      error: error.message,
    });
  }
};
