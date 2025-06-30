import { ServiceError } from '../services/itemService.js';

const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (err instanceof ServiceError) {
    return res.status(err.statusCode || 500).json({
      message: err.message,
      errorCode: err.errorCode,
      status: err.statusCode || 500,
    });
  }

  // 일반적인 서버 오류
  res.status(500).json({
    message: 'Internal Server Error',
    error: err.message,
    status: 500,
  });
};

export default errorHandler;
