// Express 프레임워크를 가져옵니다.
import express from 'express';
// 파일 관련 컨트롤러 함수들을 가져옵니다.
import { upload, download, serveImage, uploadMultiple } from '../controllers/fileController.js';
// 파일 업로드를 처리하기 위한 Multer 미들웨어를 가져옵니다.
// Multer는 multipart/form-data 형식의 요청을 처리하는 데 사용됩니다.
// Java Spring에서 파일 업로드를 처리할 때 MultipartFile 객체를 사용하는 것과 유사합니다.
import { uploadMiddleware, uploadMultipleMiddleware } from '../middleware/uploadMiddleware.js';

// Express의 Router 객체를 생성합니다.
// 이 파일에서 정의된 라우트들은 app.js에서 '/files' 접두사로 등록됩니다.
const router = express.Router();

// HTTP POST 요청을 '/files/upload' 경로로 보낼 때 실행될 핸들러를 정의합니다.
// 이 경로는 클라이언트로부터 파일을 업로드 받는 데 사용됩니다.
// 여러 미들웨어를 순차적으로 실행할 수 있습니다.
router.post(
  '/upload',
  // 1. Multer 미들웨어를 사용하여 파일 업로드를 처리합니다.
  //    uploadMiddleware.single('file')는 'file'이라는 이름의 필드로 전송된 단일 파일을 처리합니다.
  //    업로드된 파일 정보는 req.file 객체에 저장됩니다.
  //    Java Spring의 @RequestParam("file") MultipartFile file 과 유사합니다.
  (req, res, next) => {
    uploadMiddleware.single('file')(req, res, (err) => {
      if (err) {
        // Multer에서 발생한 오류(예: 파일 크기 제한 초과) 또는 기타 오류를
        // Express의 전역 오류 핸들러로 전달합니다.
        return next(err);
      }
      // 오류가 없으면 다음 미들웨어 또는 라우트 핸들러(여기서는 upload 컨트롤러 함수)로 제어를 넘깁니다.
      next();
    });
  },
  // 2. 파일 업로드 후 실행될 컨트롤러 함수입니다.
  //    이 함수는 fileController.js에 정의되어 있으며, 업로드된 파일 정보를 받아 처리합니다.
  upload
);

// HTTP POST 요청을 '/files/upload-multiple' 경로로 보낼 때 실행될 핸들러를 정의합니다.
// 이 경로는 클라이언트로부터 여러 파일을 업로드 받는 데 사용됩니다.
router.post(
  '/upload-multiple',
  // Multer 미들웨어를 사용하여 여러 파일 업로드를 처리합니다.
  // uploadMultipleMiddleware.array('files')는 'files'라는 이름의 필드로 전송된 여러 파일을 처리합니다.
  // 업로드된 파일 정보는 req.files 배열에 저장됩니다.
  (req, res, next) => {
    uploadMultipleMiddleware.array('files')(req, res, (err) => {
      if (err) {
        return next(err);
      }
      next();
    });
  },
  // 여러 파일 업로드 후 실행될 컨트롤러 함수입니다.
  uploadMultiple
);

// HTTP GET 요청을 '/files/images/:id' 경로로 보낼 때 실행될 핸들러를 정의합니다.
// ':id'는 경로 파라미터(path parameter)로, 실제 요청 시 해당 부분의 값이 req.params.id로 전달됩니다.
// 이 경로는 특정 ID를 가진 이미지를 클라이언트(예: 웹 브라우저)에 직접 제공(serve)하는 데 사용됩니다.
// 예를 들어, <img src="/files/images/123" /> 와 같이 사용될 수 있습니다.
// Java Spring의 @GetMapping("/images/{id}") 와 유사합니다.
router.get('/images/:id', serveImage);

// HTTP GET 요청을 '/files/download/:id' 경로로 보낼 때 실행될 핸들러를 정의합니다.
// ':id'는 경로 파라미터입니다.
// 이 경로는 특정 ID를 가진 파일을 클라이언트가 다운로드할 수 있도록 제공합니다.
// Java Spring의 @GetMapping("/download/{id}") 와 유사하며,
// 응답 헤더에 Content-Disposition: attachment 를 설정하여 다운로드를 유도합니다.
router.get('/download/:id', download);

// 설정된 라우터 객체를 모듈 외부로 내보냅니다.
export default router;