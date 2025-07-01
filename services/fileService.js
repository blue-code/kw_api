import db from '../models/index.js';

class FileService {
    static async createFile(fileData) {
        return await db.File.create(fileData);
    }

    static async getFileById(id) {
        return await db.File.findByPk(id);
    }

    static async getFileByFileName(fileName) {
        return await db.File.findOne({ where: { file_name: fileName } });
    }

    static async deleteFile(id) {
        const file = await db.File.findByPk(id);
        if (file) {
            await file.destroy();
            return true;
        }
        return false;
    }
}

export default FileService;
