export const ERROR_CODES = {
  // 일반적인 오류
  1000: 'Internal Server Error',
  1001: 'Invalid Request Parameter',
  1002: 'Unauthorized Access',
  1003: 'Forbidden Access',
  1004: 'Resource Not Found',
  1005: 'Database Error',
  1006: 'Validation Failed',

  // 인증 관련 오류 (2xxx)
  2000: 'Authentication Failed',
  2001: 'Invalid Credentials',
  2002: 'Token Expired',
  2003: 'Invalid Token',
  2004: 'User Not Found',
  2005: 'User Already Exists',

  // 아이템 관련 오류 (3xxx)
  3000: 'Item Creation Failed',
  3001: 'Item Not Found',
  3002: 'Item Update Failed',
  3003: 'Item Deletion Failed',
  3004: 'Not Item Owner',

  // 기타 비즈니스 로직 오류 (4xxx)
  4000: 'Nothing to Update',
};

// HTTP 상태 코드와 매핑되는 에러 코드 (선택적)
export const HTTP_STATUS_ERROR_MAP = {
  400: 1001, // Bad Request -> Invalid Request Parameter
  401: 1002, // Unauthorized -> Unauthorized Access
  403: 1003, // Forbidden -> Forbidden Access
  404: 1004, // Not Found -> Resource Not Found
  500: 1000, // Internal Server Error -> Internal Server Error
};
