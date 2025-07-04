import { ServiceError } from '../services/itemService.js';
import { errorResponse } from '../utils/responseHandler.js';
import logger from '../config/logger.js';
import { ERROR_CODES } from '../config/errorCodes.js';

const errorHandler = (err, req, res, next) => {
  logger.error('Error caught by errorHandler:', err.stack);

  if (err instanceof ServiceError) {
    return res.status(err.statusCode || 500).json({
      resultCode: err.errorCode || -1,
      resultMessage: err.message,
      data: null,
    });
  }

  // 일반적인 서버 오류
  const errorCode = ERROR_CODES.GENERAL.INTERNAL_SERVER_ERROR;
  const errorMessage = 'Internal Server Error'; // 직접 메시지 사용 또는 다른 방식
  res.status(500).json({
    resultCode: errorCode,
    resultMessage: errorMessage,
    data: null,
  });
};

export default errorHandler;
