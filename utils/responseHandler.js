import { ERROR_CODES } from '../config/errorCodes.js';

export const successResponse = (res, message = 'Success', data = null, statusCode = 200) => {
  return res.status(statusCode).json({
    resultCode: 0,
    resultMessage: message,
    data: data,
  });
};

export const errorResponse = (res, message = 'Error', statusCode = 500, errorCode = -1, data = null) => {
  return res.status(statusCode).json({
    resultCode: errorCode,
    resultMessage: message,
    data: data,
  });
};
