const fileService = require('../services/fileService');
const responseHandler = require('../utils/responseHandler');
const logger = require('../config/logger');

class FileController {
    async uploadFile(req, res, next) {
        try {
            if (!req.file) {
                return responseHandler.onError(res, { name: 'FileNotFound' });
            }
            const file = await fileService.uploadFile(req.file);
            responseHandler.onSuccess(res, file);
        } catch (error) {
            logger.error('Error uploading file:', error);
            next(error);
        }
    }

    async getFile(req, res, next) {
        try {
            const { filename } = req.params;
            const { fileStream, fileData } = await fileService.getFileStream(filename);

            if (!fileStream) {
                return responseHandler.onError(res, { name: 'FileNotFound' });
            }

            if (fileData.mimetype.startsWith('image/')) {
                res.setHeader('Content-Type', fileData.mimetype);
                fileStream.pipe(res);
            } else {
                responseHandler.onError(res, { name: 'NotAnImage' });
            }
        } catch (error) {
            logger.error('Error getting file:', error);
            next(error);
        }
    }

    async downloadFile(req, res, next) {
        try {
            const { filename } = req.params;
            const { filePath, fileData } = await fileService.getFilePath(filename);

            if (!filePath) {
                return responseHandler.onError(res, { name: 'FileNotFound' });
            }
            res.download(filePath, fileData.originalname, (err) => {
                if (err) {
                    logger.error('Error downloading file:', err);
                    // 에러가 발생했지만, 헤더가 이미 전송되었을 수 있으므로 next()를 호출하지 않도록 주의
                    if (!res.headersSent) {
                        next(err);
                    }
                }
            });
        } catch (error) {
            logger.error('Error preparing file for download:', error);
            next(error);
        }
    }
}

module.exports = new FileController();
