// Express 프레임워크를 가져옵니다.
import express from 'express';
// 아이템(상품) 관련 컨트롤러 함수들을 가져옵니다.
// 이 함수들은 실제 비즈니스 로직을 처리합니다.
import {
  createItem, // 아이템 생성
  getAllItems, // 모든 아이템 조회
  getItemById, // ID로 특정 아이템 조회
  updateItemById, // ID로 특정 아이템 수정
  deleteItemById, // ID로 특정 아이템 삭제
  getAllItemsWithStoreInfo, // 상점 정보를 포함한 모든 아이템 조회 (ORM 사용)
  getAllItemsWithStoreInfoCustomSQL, // 상점 정보를 포함한 모든 아이템 조회 (커스텀 SQL 사용)
  getPaginatedItemsController, // 페이징 처리된 아이템 조회 (ORM 사용)
  getPaginatedItemsCustomSQLController, // 페이징 처리된 아이템 조회 (커스텀 SQL 사용)
} from '../controllers/itemController.js';
// JWT 토큰을 검증하는 미들웨어를 가져옵니다.
// Java Spring Security에서 특정 엔드포인트에 대한 접근 제어와 유사합니다.
import { verifyToken } from '../middleware/authMiddleware.js';

// Express의 Router 객체를 생성합니다.
// 이 파일에서 정의된 라우트들은 app.js에서 '/items' 접두사로 등록됩니다.
const router = express.Router();

// HTTP POST 요청을 '/items' 경로로 보낼 때 실행될 핸들러를 정의합니다.
// 새 아이템을 생성하는 API 엔드포인트입니다.
// verifyToken 미들웨어가 먼저 실행되어 요청 헤더의 JWT 토큰을 검증합니다.
// 토큰이 유효하면 createItem 컨트롤러 함수가 실행됩니다.
// Java Spring의 @PostMapping("/") 와 유사하며, 보안 설정이 적용된 형태입니다.
router.post('/', verifyToken, createItem);

// HTTP GET 요청을 '/items' 경로로 보낼 때 실행될 핸들러를 정의합니다.
// 모든 아이템 목록을 조회하는 API 엔드포인트입니다. 이 경로는 인증이 필요하지 않습니다.
// Java Spring의 @GetMapping("/") 와 유사합니다.
router.get('/', getAllItems);

// HTTP GET 요청을 '/items/with-store' 경로로 보낼 때 실행될 핸들러입니다.
// 아이템 정보와 함께 연관된 상점(Store) 정보를 조회합니다. Sequelize ORM의 include 기능을 사용합니다.
// Java JPA의 EAGER/LAZY 로딩 또는 @EntityGraph와 유사한 개념으로 볼 수 있습니다.
router.get('/with-store', getAllItemsWithStoreInfo);

// HTTP GET 요청을 '/items/with-store-custom-sql' 경로로 보낼 때 실행될 핸들러입니다.
// 커스텀 SQL 쿼리를 사용하여 아이템 정보와 상점 정보를 조회합니다.
// 복잡한 조인이나 특정 데이터베이스 기능을 사용해야 할 때 유용합니다.
// Java JPA의 @Query(nativeQuery = true) 와 유사합니다.
router.get('/with-store-custom-sql', getAllItemsWithStoreInfoCustomSQL);

// HTTP GET 요청을 '/items/paginated' 경로로 보낼 때 실행될 핸들러입니다.
// 아이템 목록을 페이징 처리하여 반환합니다. Sequelize ORM의 findAndCountAll과 limit, offset 옵션을 사용합니다.
// Java Spring Data JPA의 Pageable 객체와 유사한 기능을 제공합니다.
// 요청 쿼리 파라미터로 page와 size를 받을 수 있습니다 (예: /items/paginated?page=1&size=10).
router.get('/paginated', getPaginatedItemsController);

// HTTP GET 요청을 '/items/paginated-custom-sql' 경로로 보낼 때 실행될 핸들러입니다.
// 커스텀 SQL 쿼리를 사용하여 페이징 처리된 아이템 목록을 반환합니다.
// ORM으로 표현하기 어려운 복잡한 페이징 로직에 사용될 수 있습니다.
router.get('/paginated-custom-sql', getPaginatedItemsCustomSQLController);

// HTTP GET 요청을 '/items/:id' 경로로 보낼 때 실행될 핸들러를 정의합니다.
// ':id'는 경로 파라미터로, 특정 아이템의 ID를 나타냅니다.
// 해당 ID의 아이템 정보를 조회합니다. 이 경로는 인증이 필요하지 않습니다.
// Java Spring의 @GetMapping("/{id}") 와 유사합니다.
router.get('/:id', getItemById);

// HTTP PUT 요청을 '/items/:id' 경로로 보낼 때 실행될 핸들러를 정의합니다.
// 특정 ID의 아이템 정보를 수정합니다.
// verifyToken 미들웨어를 통해 인증된 사용자만 접근 가능합니다.
// Java Spring의 @PutMapping("/{id}") 와 유사합니다.
router.put('/:id', verifyToken, updateItemById);

// HTTP DELETE 요청을 '/items/:id' 경로로 보낼 때 실행될 핸들러를 정의합니다.
// 특정 ID의 아이템을 삭제합니다.
// verifyToken 미들웨어를 통해 인증된 사용자만 접근 가능합니다.
// Java Spring의 @DeleteMapping("/{id}") 와 유사합니다.
router.delete('/:id', verifyToken, deleteItemById);

// 설정된 라우터 객체를 모듈 외부로 내보냅니다.
export default router;