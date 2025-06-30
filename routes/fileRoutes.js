const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const fileController = require('../controllers/fileController');
const authMiddleware = require('../middleware/authMiddleware'); // 인증 미들웨어 (필요시)

// 파일 저장 경로 및 파일명 설정
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');

// uploads 디렉토리가 없으면 생성
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, UPLOAD_DIR);
    },
    filename: function (req, file, cb) {
        // 파일명 중복을 피하기 위해 타임스탬프 사용
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 10 }, // 10MB 파일 크기 제한
    fileFilter: function (req, file, cb) {
        // 특정 파일 타입만 허용 (예: 이미지, pdf 등)
        // if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
        //     cb(null, true);
        // } else {
        //     cb(new Error('Invalid file type'), false);
        // }
        cb(null, true); // 모든 파일 타입 허용 (테스트용)
    }
});

// 파일 업로드 API
// authMiddleware.verifyToken 미들웨어를 추가하여 인증된 사용자만 업로드 가능하게 할 수 있습니다.
router.post('/upload', authMiddleware.verifyToken, upload.single('file'), fileController.uploadFile);

// 이미지 파일 미리보기 API (인증 없이 접근 가능하도록 설정하거나, 필요시 authMiddleware 추가)
// 이 라우트는 fileController.getFile로 직접 연결되며, 서비스에서 Content-Type을 설정합니다.
router.get('/view/:filename', fileController.getFile);

// 파일 다운로드 API
// authMiddleware.verifyToken 미들웨어를 추가하여 인증된 사용자만 다운로드 가능하게 할 수 있습니다.
router.get('/download/:filename', authMiddleware.verifyToken, fileController.downloadFile);

module.exports = router;
