// Sequelize 모델 인스턴스들을 포함하는 db 객체를 가져옵니다.
// db.File은 File 모델(models/File.js에서 정의)에 해당합니다.
// Java에서 DAO(Data Access Object)나 Repository 인터페이스의 구현체를 주입받는 것과 유사한 개념입니다.
import db from '../models/index.js';

/**
 * 파일 메타데이터 관련 비즈니스 로직을 처리하는 서비스 클래스입니다.
 * 이 클래스는 주로 데이터베이스에 저장된 파일 정보를 관리합니다.
 * 실제 파일 시스템의 파일(바이너리 데이터) 자체를 직접 다루기보다는,
 * 해당 파일에 대한 참조 정보(경로, 이름, 크기 등)를 DB와 연동하여 처리합니다.
 *
 * Java의 @Service 어노테이션이 붙은 클래스와 유사한 역할을 합니다.
 * 모든 메소드가 정적(static)으로 선언되어 있어, 클래스 인스턴스 생성 없이 `FileService.methodName()` 형태로 호출 가능합니다.
 * 이는 상태를 가지지 않는 유틸리티 성격의 서비스에 적합한 방식일 수 있으나,
 * 의존성 주입(DI)이나 테스트 용이성을 고려할 때는 인스턴스 기반으로 설계하는 경우도 많습니다.
 */
class FileService {
    /**
     * 새 파일 메타데이터를 데이터베이스에 생성합니다.
     *
     * @static
     * @async
     * @param {object} fileData - 데이터베이스에 저장할 파일 정보 객체.
     *                            예: { original_name, file_name, file_path, file_size, file_type }
     * @returns {Promise<object>} 생성된 파일 메타데이터 객체 (Sequelize 모델 인스턴스).
     * @throws {Error} Sequelize 작업 중 발생할 수 있는 데이터베이스 오류.
     */
    static async createFile(fileData) {
        // db.File은 Sequelize의 File 모델을 나타냅니다.
        // .create() 메소드는 새로운 레코드를 데이터베이스에 삽입합니다.
        // Java JPA의 `entityManager.persist(fileEntity)` 또는 Spring Data JPA의 `fileRepository.save(fileEntity)`와 유사합니다.
        // 'await'는 비동기 작업인 데이터베이스 생성이 완료될 때까지 기다립니다.
        return await db.File.create(fileData);
    }

    /**
     * ID를 기준으로 특정 파일 메타데이터를 데이터베이스에서 조회합니다.
     *
     * @static
     * @async
     * @param {number|string} id - 조회할 파일의 ID.
     * @returns {Promise<object|null>} 조회된 파일 메타데이터 객체, 없으면 null.
     * @throws {Error} Sequelize 작업 중 발생할 수 있는 데이터베이스 오류.
     */
    static async getFileById(id) {
        // .findByPk() 메소드는 Primary Key(기본 키)를 사용하여 단일 레코드를 조회합니다.
        // Java JPA의 `entityManager.find(FileEntity.class, id)` 또는 Spring Data JPA의 `fileRepository.findById(id)`와 유사합니다.
        return await db.File.findByPk(id);
    }

    /**
     * 서버에 저장된 파일 이름(file_name)을 기준으로 특정 파일 메타데이터를 데이터베이스에서 조회합니다.
     *
     * @static
     * @async
     * @param {string} fileName - 조회할 파일의 서버 저장 이름 (중복되지 않는 이름이어야 함).
     * @returns {Promise<object|null>} 조회된 파일 메타데이터 객체, 없으면 null.
     * @throws {Error} Sequelize 작업 중 발생할 수 있는 데이터베이스 오류.
     */
    static async getFileByFileName(fileName) {
        // .findOne() 메소드는 지정된 조건에 맞는 첫 번째 레코드를 조회합니다.
        // `where` 옵션으로 검색 조건을 명시합니다.
        // Java JPA의 Criteria API 또는 JPQL `SELECT f FROM FileEntity f WHERE f.fileName = :fileName`과 유사합니다.
        return await db.File.findOne({ where: { file_name: fileName } });
    }

    /**
     * ID를 기준으로 특정 파일 메타데이터를 데이터베이스에서 삭제합니다.
     * 중요: 이 메소드는 데이터베이스의 메타데이터만 삭제하며, 파일 시스템의 실제 파일은 삭제하지 않습니다.
     * 실제 파일 삭제는 컨트롤러나 별도의 파일 시스템 유틸리티에서 이 메소드 호출 전후에 처리해야 합니다.
     *
     * @static
     * @async
     * @param {number|string} id - 삭제할 파일 메타데이터의 ID.
     * @returns {Promise<boolean>} 삭제 성공 시 true, 해당 ID의 파일이 없으면 false.
     * @throws {Error} Sequelize 작업 중 발생할 수 있는 데이터베이스 오류.
     */
    static async deleteFile(id) {
        // 먼저 삭제할 파일 메타데이터를 조회합니다.
        const file = await db.File.findByPk(id);
        if (file) {
            // 조회된 Sequelize 모델 인스턴스의 .destroy() 메소드를 호출하여 해당 레코드를 삭제합니다.
            // Java JPA의 `entityManager.remove(fileEntity)` 또는 Spring Data JPA의 `fileRepository.delete(fileEntity)`와 유사합니다.
            await file.destroy();
            return true; // 삭제 성공
        }
        return false; // 해당 ID의 파일 메타데이터가 존재하지 않음
    }

    /**
     * group_id를 기준으로 여러 파일 메타데이터를 데이터베이스에서 조회합니다.
     *
     * @static
     * @async
     * @param {string} groupId - 조회할 파일들의 group_id.
     * @returns {Promise<Array<object>>} 조회된 파일 메타데이터 객체 배열.
     * @throws {Error} Sequelize 작업 중 발생할 수 있는 데이터베이스 오류.
     */
    static async getFilesByGroupId(groupId) {
        return await db.File.findAll({ where: { group_id: groupId } });
    }
}

// FileService 클래스를 모듈의 기본 내보내기(default export)로 설정합니다.
// 다른 파일에서 `import FileService from './fileService.js';` 형태로 가져와 사용할 수 있습니다.
export default FileService;
