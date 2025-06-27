/**
 * 보호된 테스트 데이터 가져오기
 * GET /test
 * 이 핸들러는 verifyToken 미들웨어를 통과한 후에만 실행됩니다.
 */
export const getTestData = (req, res) => {
  // verifyToken 미들웨어에서 req.user에 저장된 사용자 정보를 사용할 수 있습니다.
  res.status(200).json({
    message: 'This is protected test data.',
    user: req.user, // 토큰에서 추출된 사용자 정보
    timestamp: new Date().toISOString(),
  });
};
