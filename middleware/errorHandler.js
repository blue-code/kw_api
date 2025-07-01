import { ServiceError } from '../services/itemService.js';
import { errorResponse } from '../utils/responseHandler.js';
import logger from '../config/logger.js';
import { ERROR_CODES } from '../config/errorCodes.js';

const errorHandler = (err, req, res, next) => {
  logger.error('Error caught by errorHandler:', err.stack);

  if (err instanceof ServiceError) {
    return errorResponse(res, err.message, err.statusCode, err.errorCode);
  }

  // 일반적인 서버 오류
  const errorCode = 1000; // Internal Server Error
  const errorMessage = ERROR_CODES[errorCode];
  res.status(500).json({
    resultCode: errorCode,
    resultMessage: errorMessage,
    data: null,
  });
};

export default errorHandler;
