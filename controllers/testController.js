import { successResponse } from '../utils/responseHandler.js';

/**
 * 보호된 테스트 데이터 가져오기
 * GET /test
 * 이 핸들러는 verifyToken 미들웨어를 통과한 후에만 실행됩니다.
 */
export const getTestData = (req, res) => {
  // verifyToken 미들웨어에서 req.user에 저장된 사용자 정보를 사용할 수 있습니다.
  successResponse(res, 'This is protected test data.', {
    user: req.user, // 토큰에서 추출된 사용자 정보
    timestamp: new Date().toISOString(),
  });
};

/**
 * 한글 입력 테스트
 * POST /test/korean-test
 * 요청 본문에서 한글 텍스트를 받아 응답으로 돌려줍니다.
 */
export const handleKoreanInput = (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ message: '텍스트를 입력해주세요.' });
  }
  successResponse(res, 'Korean text received successfully.', {
    receivedText: text,
    message: '한글 텍스트가 성공적으로 수신되었습니다.',
  });
};
