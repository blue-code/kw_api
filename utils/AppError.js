import { HTTP_STATUS_ERROR_MAP, ERROR_CODES } from '../config/errorCodes.js';

export class AppError extends Error {
  constructor(message, statusCode = 500, errorCode) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode || HTTP_STATUS_ERROR_MAP[statusCode] || 1000; // 기본값 Internal Server Error
    // message가 제공되면 해당 메시지를 사용하고, 그렇지 않으면 errorCode에 해당하는 메시지를 사용합니다.
    // 둘 다 없으면 기본 메시지를 사용합니다.
    this.message = message || ERROR_CODES[this.errorCode] || 'An unexpected error occurred.';
    this.name = this.constructor.name; // Error 객체의 name을 클래스 이름으로 설정
  }
}

// 특정 유형의 오류를 쉽게 생성하기 위한 팩토리 함수나 서브클래스를 추가할 수도 있습니다.
// 예: export class NotFoundError extends AppError { constructor(message = 'Resource not found') { super(message, 404, 'RESOURCE_NOT_FOUND'); } }
// 예: export class AuthenticationError extends AppError { constructor(message = 'Authentication failed') { super(message, 401, 'AUTHENTICATION_FAILED'); } }
// 예: export class AuthorizationError extends AppError { constructor(message = 'Forbidden') { super(message, 403, 'FORBIDDEN_ACCESS'); } }
// 예: export class ValidationError extends AppError { constructor(message = 'Validation failed') { super(message, 400, 'VALIDATION_FAILED'); } }
