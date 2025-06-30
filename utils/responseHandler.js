import { ERROR_CODES } from '../config/errorCodes.js';

export const successResponse = (data, message = 'Success', resultCode = 0) => {
  return {
    resultCode: resultCode,
    resultMessage: message,
    data: data,
  };
};

export const errorResponse = (errorCode, errorMessage, data = null) => {
  const message = errorMessage || ERROR_CODES[errorCode] || 'Unknown Error';
  return {
    resultCode: errorCode,
    resultMessage: message,
    data: data,
  };
};
