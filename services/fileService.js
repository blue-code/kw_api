const fs = require('fs');
const path = require('path');
const File = require('../models/File');
const { AppError } = require('../utils/responseHandler');
const errorCodes = require('../config/errorCodes');
const logger = require('../config/logger');

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');

// uploads 디렉토리가 없으면 생성
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

class FileService {
    async uploadFile(fileInfo) {
        try {
            const newFile = await File.create({
                filename: fileInfo.filename,
                originalname: fileInfo.originalname,
                mimetype: fileInfo.mimetype,
                size: fileInfo.size,
                path: fileInfo.path, // multer가 저장한 전체 경로
            });
            return newFile;
        } catch (error) {
            logger.error('Error saving file info to DB:', error);
            // 실제 파일 시스템에서 파일 삭제 (롤백)
            if (fileInfo && fileInfo.path) {
                try {
                    if (fs.existsSync(fileInfo.path)) {
                        fs.unlinkSync(fileInfo.path);
                        logger.info(`Rolled back file system by deleting: ${fileInfo.path}`);
                    }
                } catch (unlinkError) {
                    logger.error('Error deleting file during rollback:', unlinkError);
                }
            }
            throw new AppError(errorCodes.DATABASE_ERROR, 500, 'Failed to save file information to the database.');
        }
    }

    async getFileStream(filename) {
        const fileData = await File.findOne({ where: { filename } });
        if (!fileData) {
            return { fileStream: null, fileData: null };
        }
        const filePath = fileData.path; // DB에 저장된 전체 경로 사용
        if (!fs.existsSync(filePath)) {
            logger.error(`File not found on filesystem: ${filePath} for filename: ${filename}`);
            // DB에는 있지만 실제 파일이 없는 경우, DB 정보 삭제 또는 관리자 알림 등의 로직 추가 가능
            // 여기서는 간단히 파일이 없는 것으로 처리
            return { fileStream: null, fileData: null };
        }
        const fileStream = fs.createReadStream(filePath);
        return { fileStream, fileData };
    }

    async getFilePath(filename) {
        const fileData = await File.findOne({ where: { filename } });
        if (!fileData) {
            return { filePath: null, fileData: null };
        }
        const filePath = fileData.path; // DB에 저장된 전체 경로 사용
         if (!fs.existsSync(filePath)) {
            logger.error(`File not found on filesystem: ${filePath} for filename: ${filename}`);
            return { filePath: null, fileData: null };
        }
        return { filePath, fileData };
    }
}

module.exports = new FileService();
