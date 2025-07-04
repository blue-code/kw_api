// 표준화된 성공 응답을 보내기 위한 유틸리티 함수를 가져옵니다.
// errorResponse와 ERROR_CODES도 필요하면 가져와야 합니다.
import { successResponse, errorResponse } from '../utils/responseHandler.js';
import { ERROR_CODES } from '../config/errorCodes.js';


/**
 * 보호된 테스트 데이터를 가져오는 요청을 처리합니다.
 * HTTP GET '/test' 경로로 요청이 오고, verifyToken 미들웨어를 통과한 경우에만 실행됩니다.
 *
 * @param {object} req - Express 요청 객체. verifyToken 미들웨어에 의해 req.user 객체가 주입되어 있습니다.
 * @param {object} res - Express 응답 객체.
 */
export const getTestData = (req, res) => {
  // verifyToken 미들웨어는 JWT를 검증하고, 토큰의 페이로드(payload)에 포함된 사용자 정보를
  // req.user 객체에 저장합니다. 이 컨트롤러에서는 해당 정보를 응답에 포함하여 반환합니다.
  // Java Spring Security에서 SecurityContextHolder.getContext().getAuthentication().getPrincipal()로
  // 인증된 사용자 정보를 가져오는 것과 유사한 맥락입니다.
  successResponse(res, 'This is protected test data. Access granted.', {
    message: '토큰이 성공적으로 검증되었으며, 보호된 데이터에 접근했습니다.',
    user: req.user, // 토큰에서 추출된 사용자 정보 (예: id, username)
    timestamp: new Date().toISOString(), // 현재 시간 정보
  });
};

/**
 * 한글 입력 처리를 테스트하는 요청을 처리합니다.
 * HTTP POST '/test/korean-test' 경로로 요청이 오면 실행됩니다.
 * 요청 본문(req.body)에 'text' 필드로 한글 텍스트를 받아, 이를 다시 응답으로 돌려줍니다.
 *
 * @param {object} req - Express 요청 객체. req.body.text로 한글 입력을 받습니다.
 * @param {object} res - Express 응답 객체.
 * @param {function} next - Express 다음 미들웨어 함수 (오류 처리용).
 */
export const handleKoreanInput = (req, res, next) => {
  // 요청 본문에서 'text' 속성을 추출합니다.
  const { text } = req.body;
  try {
    // 입력 값 검증: 'text' 필드가 제공되었는지 확인합니다.
    if (text === undefined || text === null || text.trim() === '') {
      // errorResponse 유틸리티를 사용하여 표준화된 오류 응답을 보냅니다.
      // ERROR_CODES 상수를 사용하여 오류 코드를 명시적으로 지정합니다.
      return errorResponse(res, '텍스트를 입력해주세요. (Text input is required.)', 400, ERROR_CODES.VALIDATION.MISSING_FIELDS);
    }

    // 성공적으로 한글 텍스트를 수신했음을 알리는 응답을 보냅니다.
    // 받은 텍스트를 그대로 반환하여 클라이언트가 입력과 출력을 비교할 수 있도록 합니다.
    successResponse(res, 'Korean text received and processed successfully.', {
      receivedText: text,
      confirmationMessage: '서버가 한글 텍스트를 성공적으로 수신하고 처리했습니다.',
      additionalNote: 'UTF-8 인코딩이 올바르게 처리되었습니다.'
    });
  } catch (error) {
    // 예기치 않은 오류 발생 시 (이 간단한 예제에서는 발생 가능성이 낮음)
    // 전역 오류 핸들러로 예외를 전달합니다.
    next(error);
  }
};
