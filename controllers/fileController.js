// 파일 관련 비즈니스 로직을 처리하는 서비스 모듈을 가져옵니다.
// Java의 @Service 클래스와 유사합니다.
import FileService from '../services/fileService.js';
// 표준화된 성공/실패 응답을 보내기 위한 유틸리티 함수들을 가져옵니다.
import { successResponse, errorResponse } from '../utils/responseHandler.js';
// 파일 및 디렉토리 경로 작업을 위한 Node.js 내장 모듈입니다.
// Java의 java.io.File 또는 java.nio.file.Path와 유사합니다.
import path from 'path';
// 파일 시스템 작업을 위한 Node.js 내장 모듈입니다. (파일 존재 여부 확인 등)
// Java의 java.io.File 클래스의 메서드들과 유사합니다.
import fs from 'fs';

/**
 * 파일 업로드 요청을 처리합니다.
 * HTTP POST '/files/upload' 경로로 요청이 오면 실행됩니다.
 * Multer 미들웨어에 의해 파일이 먼저 처리되고, 그 결과가 req.file 객체에 담겨 전달됩니다.
 *
 * @param {object} req - Express 요청 객체. req.file에 업로드된 파일 정보가 포함됩니다.
 * @param {object} res - Express 응답 객체.
 * @param {function} next - (현재 이 함수에서는 명시적으로 사용되지 않지만) 다음 미들웨어 함수.
 *                          비동기 함수 내에서 예외 발생 시 next(error)를 호출하여 전역 에러 핸들러로 전달할 수 있습니다.
 *                          다만, 현재 코드는 try-catch 블록 내에서 직접 errorResponse를 호출하고 있습니다.
 *                          일관성을 위해 next(error)를 사용하는 것을 고려할 수 있습니다.
 */
export const upload = async (req, res, next) => { // next 추가 고려
    try {
        // req.file 객체는 Multer 미들웨어가 성공적으로 파일을 처리했을 때 생성됩니다.
        // 파일이 업로드되지 않았거나 Multer 설정에 문제가 있으면 req.file이 없을 수 있습니다.
        if (!req.file) {
            // 400 Bad Request: 클라이언트가 파일을 보내지 않음.
            return errorResponse(res, 'No file uploaded', 400); // 오류 코드 추가 고려
        }

        // 데이터베이스에 저장할 파일 메타데이터를 구성합니다.
        // req.file 객체는 다음과 같은 주요 속성을 포함합니다:
        // - originalname: 사용자가 업로드한 파일의 원래 이름
        // - filename: 서버에 저장될 때 사용된 (잠재적으로 변경된) 파일 이름 (Multer 설정에 따라 다름)
        // - path: 서버에 파일이 저장된 전체 경로
        // - size: 파일 크기 (바이트 단위)
        // - mimetype: 파일의 MIME 타입 (예: 'image/jpeg', 'application/pdf')
        const fileData = {
            // originalname이 한글 등 비ASCII 문자를 포함할 경우, 인코딩 문제가 발생할 수 있습니다.
            // Multer는 기본적으로 'latin1'으로 해석할 수 있으므로, 'utf8'로 변환해줍니다.
            original_name: Buffer.from(req.file.originalname, 'latin1').toString('utf8'),
            file_name: req.file.filename, // 서버에 저장된 (Multer에 의해 생성된) 파일명
            file_path: req.file.path,     // 서버 내 파일 저장 경로
            file_size: req.file.size,
            file_type: req.file.mimetype,
        };

        // FileService를 호출하여 파일 메타데이터를 데이터베이스에 저장합니다.
        // 'await' 키워드는 FileService.createFile 프로미스가 완료될 때까지 함수의 실행을 일시 중지합니다.
        // Java에서 Future.get()과 유사하지만, 비동기 실행 모델이 다릅니다. Node.js는 이벤트 루프 기반 논블로킹 I/O를 사용합니다.
        const file = await FileService.createFile(fileData);

        // 201 Created 상태 코드와 함께 성공 응답을 보냅니다.
        successResponse(res, 'File uploaded successfully', file, 201);
    } catch (error) {
        // 파일 업로드 또는 데이터베이스 저장 중 오류 발생 시
        console.error('Error uploading file:', error); // 서버 로그에 오류 기록
        // 500 Internal Server Error 상태와 함께 실패 응답을 보냅니다.
        // 여기서 next(error)를 호출하면 전역 에러 핸들러가 처리하게 됩니다.
        errorResponse(res, 'Failed to upload file', 500); // 오류 코드 추가 고려
        // 또는 next(error);
    }
};

/**
 * 파일 다운로드 요청을 처리합니다.
 * HTTP GET '/files/download/:id' 경로로 요청이 오면 실행됩니다.
 * ':id'는 다운로드할 파일의 데이터베이스 ID입니다.
 *
 * @param {object} req - Express 요청 객체. req.params.id로 파일 ID를 가져옵니다.
 * @param {object} res - Express 응답 객체.
 * @param {function} next - Express 다음 미들웨어 함수 (오류 처리용).
 */
export const download = async (req, res, next) => {
    try {
        const { id } = req.params; // URL 경로에서 파일 ID 추출
        // FileService를 통해 데이터베이스에서 파일 정보를 조회합니다.
        const fileRecord = await FileService.getFileById(id);

        if (!fileRecord) {
            // 해당 ID의 파일 정보가 데이터베이스에 없는 경우
            return errorResponse(res, 'File not found in database', 404); // 오류 코드 추가 고려
        }

        // 데이터베이스에 저장된 파일 경로를 절대 경로로 변환합니다.
        // path.resolve()는 상대 경로를 현재 작업 디렉토리 기준으로 절대 경로로 만듭니다.
        // fileRecord.file_path가 이미 절대 경로이거나, 특정 기준 디렉토리로부터의 상대 경로일 수 있습니다.
        // 저장 방식에 따라 적절히 경로를 구성해야 합니다. (예: path.join(UPLOAD_DIR, fileRecord.file_name))
        const filePath = path.resolve(fileRecord.file_path);

        // 서버 파일 시스템에 실제 파일이 존재하는지 확인합니다.
        if (!fs.existsSync(filePath)) {
            // 데이터베이스에는 기록이 있지만 실제 파일이 서버에 없는 경우
            return errorResponse(res, 'File not found on server', 404); // 오류 코드 추가 고려
        }

        // res.download()는 파일을 클라이언트로 전송하여 다운로드를 유도합니다.
        // 이 메소드는 자동으로 'Content-Disposition: attachment; filename="...filename..."' 헤더를 설정합니다.
        // 두 번째 인자는 클라이언트에게 표시될 파일 이름입니다 (생략 시 경로의 마지막 부분 사용).
        // 세 번째 인자는 콜백 함수로, 전송 완료 또는 오류 발생 시 호출됩니다.
        // Java에서 HttpServletResponse.setHeader("Content-Disposition", "attachment; filename...") 후 OutputStream으로 쓰는 것과 유사합니다.
        res.download(filePath, fileRecord.original_name, (err) => {
            if (err) {
                // 파일 전송 중 오류 발생 (예: 클라이언트 연결 끊김)
                console.error('Error during file download transmission:', err);
                // 이미 응답 헤더가 전송되었을 수 있으므로, res.status().send() 등을 직접 호출하기보다는
                // next(err)를 통해 Express의 기본 오류 처리나 커스텀 오류 처리 미들웨어로 넘기는 것이 안전할 수 있습니다.
                // 단, res.download 내부에서 오류 발생 시 Express가 이미 응답을 종료했을 수 있으므로 주의해야 합니다.
                // 만약 에러가 발생해도 클라이언트에게 다른 응답을 보내지 않아야 한다면 이 부분은 비워둘 수도 있습니다.
                // 현재는 next(err)를 호출하여 전역 에러 핸들러로 넘깁니다.
                if (!res.headersSent) { // 헤더가 아직 전송되지 않았다면 오류 응답 가능
                    // 이 경우는 res.download가 시작되기 전의 문제일 가능성은 낮음
                }
                next(err);
            }
            // 성공적으로 다운로드가 완료되면 별도의 처리는 필요 없습니다. res.download가 응답을 종료합니다.
        });
    } catch (error) {
        // 데이터베이스 조회 등 res.download 이전의 로직에서 오류 발생 시
        console.error('Error in download controller:', error);
        next(error); // 전역 에러 핸들러로 전달
    }
};

/**
 * 이미지 파일 제공 요청을 처리합니다.
 * HTTP GET '/files/images/:id' 경로로 요청이 오면 실행됩니다.
 * ':id'는 제공할 이미지 파일의 데이터베이스 ID입니다.
 * 이 핸들러는 이미지를 웹 페이지에 직접 표시(<img src="...">)하는 데 사용됩니다.
 *
 * @param {object} req - Express 요청 객체.
 * @param {object} res - Express 응답 객체.
 * @param {function} next - Express 다음 미들웨어 함수 (오류 처리용).
 */
export const serveImage = async (req, res, next) => {
    try {
        const { id } = req.params;
        const fileRecord = await FileService.getFileById(id);

        if (!fileRecord) {
            return errorResponse(res, 'Image not found in database', 404);
        }

        // 파일이 실제로 이미지 타입인지 MIME 타입을 통해 확인합니다.
        if (!fileRecord.file_type || !fileRecord.file_type.startsWith('image/')) {
            return errorResponse(res, 'Requested file is not an image', 400); // 오류 코드 추가 고려
        }

        const filePath = path.resolve(fileRecord.file_path);

        if (!fs.existsSync(filePath)) {
            return errorResponse(res, 'Image file not found on server', 404);
        }

        // res.sendFile()은 지정된 경로의 파일을 클라이언트로 전송합니다.
        // 이 메소드는 파일의 MIME 타입에 따라 'Content-Type' 헤더를 자동으로 설정합니다.
        // 이미지를 브라우저에 직접 표시하는 데 적합합니다.
        // Java에서 FileInputStream으로 파일을 읽어 HttpServletResponse.getOutputStream()으로 쓰는 것과 유사합니다.
        res.sendFile(filePath, (err) => {
            if (err) {
                console.error('Error serving image file:', err);
                // res.download와 마찬가지로, 오류 발생 시 next(err)로 전달합니다.
                next(err);
            }
        });
    } catch (error) {
        console.error('Error in serveImage controller:', error);
        next(error);
    }
};
