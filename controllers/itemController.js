// 아이템(상품) 관련 비즈니스 로직을 처리하는 서비스 모듈을 가져옵니다.
// Java의 @Service 클래스에 해당하는 itemService 객체를 주입받는 것과 유사합니다.
import * as itemService from '../services/itemService.js';
// 표준화된 성공/실패 응답을 보내기 위한 유틸리티 함수들을 가져옵니다.
import { successResponse, errorResponse } from '../utils/responseHandler.js';
// 미리 정의된 에러 코드를 가져옵니다.
import { ERROR_CODES } from '../config/errorCodes.js';
// 로깅을 위한 Winston 로거를 가져옵니다.
import logger from "../config/logger.js";

/**
 * 새 아이템(상품) 생성 요청을 처리합니다. (C - Create)
 * HTTP POST '/items' 경로로 요청이 오면 실행됩니다.
 * 요청 본문(req.body)에는 name, description 정보가 포함되어야 합니다.
 * 이 엔드포인트는 인증이 필요하며, verifyToken 미들웨어에 의해 req.user 객체가 주입됩니다.
 *
 * @param {object} req - Express 요청 객체. req.body, req.user 등을 사용합니다.
 * @param {object} res - Express 응답 객체.
 * @param {function} next - Express 다음 미들웨어 함수 (오류 처리용).
 */
export const createItem = async (req, res, next) => {
  // 요청 본문에서 name과 description을 추출합니다.
  // Java Spring의 @RequestBody ItemDto itemDto 와 유사합니다.
  const { name, description } = req.body;
  // verifyToken 미들웨어에서 JWT를 검증하고, 토큰의 payload에 있던 사용자 ID를 req.user.id에 저장해두었습니다.
  // 이를 통해 어떤 사용자가 아이템을 생성하는지 알 수 있습니다.
  // Java Spring Security의 @AuthenticationPrincipal UserDetails userDetails 와 유사합니다.
  const userId = req.user.id;

  // 필수 입력 값(name) 검증
  if (!name) {
    // 400 Bad Request 응답. errorResponse 유틸리티를 사용하는 대신 직접 응답 객체를 구성하고 있습니다.
    // 일관성을 위해 errorResponse 유틸리티 사용을 고려할 수 있습니다.
    // 예: return errorResponse(res, 'Item name is required.', 400, ERROR_CODES.VALIDATION.MISSING_ITEM_NAME);
    return res.status(400).json(errorResponse(res, 'Item name is required.', 400, ERROR_CODES.VALIDATION.MISSING_ITEM_NAME));
  }

  try {
    // itemService의 createNewItem 함수를 호출하여 아이템을 생성합니다.
    // 비동기 함수이므로 await를 사용하여 결과가 올 때까지 기다립니다.
    const newItem = await itemService.createNewItem(name, description, userId);
    // 201 Created 상태 코드와 함께 성공 응답을 보냅니다.
    successResponse(res, 'Item created successfully.', newItem, 201);
  } catch (error) {
    // 서비스 로직에서 발생한 예외를 전역 오류 핸들러로 전달합니다.
    next(error);
  }
};

/**
 * 모든 아이템 목록 조회 요청을 처리합니다. (R - Read)
 * HTTP GET '/items' 경로로 요청이 오면 실행됩니다.
 * 이 엔드포인트는 일반적으로 인증이 필수는 아니지만, 요구사항에 따라 달라질 수 있습니다.
 *
 * @param {object} req - Express 요청 객체.
 * @param {object} res - Express 응답 객체.
 * @param {function} next - Express 다음 미들웨어 함수.
 */
export const getAllItems = async (req, res, next) => {
  try {
    // itemService를 통해 모든 아이템을 조회합니다.
    const items = await itemService.findAllItems();
    // 성공 응답 (기본 상태 코드 200 OK)
    successResponse(res, undefined, items); // 메시지를 생략하면 기본 성공 메시지 또는 데이터만 전송됩니다.
  } catch (error) {
    next(error);
  }
};

/**
 * 특정 ID를 가진 아이템 조회 요청을 처리합니다. (R - Read)
 * HTTP GET '/items/:id' 경로로 요청이 오면 실행됩니다.
 * ':id'는 URL 경로 파라미터입니다.
 *
 * @param {object} req - Express 요청 객체. req.params.id로 경로 파라미터를 가져옵니다.
 * @param {object} res - Express 응답 객체.
 * @param {function} next - Express 다음 미들웨어 함수.
 */
export const getItemById = async (req, res, next) => {
  // URL 경로에서 id 값을 추출합니다. req.params는 { id: '값' } 형태의 객체입니다.
  // Java Spring의 @PathVariable Long id 와 유사합니다.
  const { id } = req.params;
  try {
    const item = await itemService.findItemById(id);
    // item이 null일 경우 (찾지 못한 경우) 서비스 계층에서 ItemNotFoundError를 발생시키고,
    // 이는 전역 오류 핸들러에서 404 응답으로 처리될 수 있습니다.
    // 또는 여기서 직접 확인하고 404 응답을 보낼 수도 있습니다.
    // if (!item) {
    //   return errorResponse(res, 'Item not found', 404, ERROR_CODES.ITEM.NOT_FOUND);
    // }
    successResponse(res, undefined, item);
  } catch (error) {
    // findItemById에서 ItemNotFoundError가 발생하면 next(error)를 통해 errorHandler.js로 전달됩니다.
    next(error);
  }
};

/**
 * 특정 ID를 가진 아이템 수정 요청을 처리합니다. (U - Update)
 * HTTP PUT '/items/:id' 경로로 요청이 오면 실행됩니다.
 * 요청 본문(req.body)에는 수정할 name 및/또는 description 정보가 포함될 수 있습니다.
 * 이 엔드포인트는 인증이 필요하며, 아이템 소유자만 수정을 허용하는 로직이 서비스 계층에 포함될 수 있습니다.
 *
 * @param {object} req - Express 요청 객체.
 * @param {object} res - Express 응답 객체.
 * @param {function} next - Express 다음 미들웨어 함수.
 */
export const updateItemById = async (req, res, next) => {
  const { id } = req.params; // 수정할 아이템의 ID
  const { name, description } = req.body; // 수정할 내용
  const userId = req.user.id; // 요청을 보낸 사용자 ID (아이템 소유권 확인 등에 사용)

  // 수정할 내용이 아무것도 제공되지 않았는지 확인합니다.
  // name이 빈 문자열("")로 들어올 수 있는 경우를 고려하여 undefined로 체크합니다.
  // 서비스 계층에서 name이 빈 문자열로 업데이트 되는 것을 허용할 수도, 막을 수도 있습니다.
  if (name === undefined && description === undefined) {
    return errorResponse(res, 'Nothing to update. Provide name or description.', 400, ERROR_CODES.VALIDATION.NO_UPDATE_DATA);
  }

  try {
    // itemService를 통해 아이템 정보를 업데이트합니다.
    // updateExistingItem 함수는 아이템 소유권 검증 로직을 포함할 수 있습니다.
    const updatedItem = await itemService.updateExistingItem(id, userId, { name, description });
    successResponse(res, 'Item updated successfully.', updatedItem);
  } catch (error) {
    // ItemNotFoundError, UnauthorizedError 등이 서비스 계층에서 발생할 수 있습니다.
    next(error);
  }
};

/**
 * 특정 ID를 가진 아이템 삭제 요청을 처리합니다. (D - Delete)
 * HTTP DELETE '/items/:id' 경로로 요청이 오면 실행됩니다.
 * 이 엔드포인트는 인증이 필요하며, 아이템 소유자만 삭제를 허용하는 로직이 서비스 계층에 포함될 수 있습니다.
 *
 * @param {object} req - Express 요청 객체.
 * @param {object} res - Express 응답 객체.
 * @param {function} next - Express 다음 미들웨어 함수.
 */
export const deleteItemById = async (req, res, next) => {
  const { id } = req.params; // 삭제할 아이템의 ID
  const userId = req.user.id; // 요청을 보낸 사용자 ID

  try {
    // itemService를 통해 아이템을 삭제합니다.
    // deleteExistingItem 함수는 아이템 소유권 검증 로직을 포함할 수 있습니다.
    const result = await itemService.deleteExistingItem(id, userId); // result에는 보통 삭제된 행의 수 등이 반환될 수 있음
    successResponse(res, 'Item deleted successfully.', result); // 또는 result 없이 메시지만 전달
  } catch (error) {
    next(error);
  }
};

/**
 * 모든 아이템 정보와 함께 연관된 상점(Store) 정보를 조회합니다.
 * HTTP GET '/items/with-store' 경로로 요청이 오면 실행됩니다.
 * Sequelize ORM의 'include' 옵션을 사용하여 연관된 데이터를 함께 로드합니다.
 * Java JPA의 EAGER Fetch 또는 @EntityGraph와 유사한 기능을 수행합니다.
 *
 * @param {object} req - Express 요청 객체.
 * @param {object} res - Express 응답 객체.
 * @param {function} next - Express 다음 미들웨어 함수.
 */
export const getAllItemsWithStoreInfo = async (req, res, next) => {
  try {
    const itemsWithStores = await itemService.findAllItemsWithStoreDetails();
    successResponse(res, undefined, itemsWithStores);
  } catch (error) {
    next(error);
  }
};

/**
 * 커스텀 SQL 쿼리를 사용하여 모든 아이템 정보와 연관된 상점 정보를 조회합니다.
 * HTTP GET '/items/with-store-custom-sql' 경로로 요청이 오면 실행됩니다.
 * ORM으로 표현하기 복잡하거나 성능 최적화가 필요한 경우 직접 SQL을 사용합니다.
 * Java JPA의 nativeQuery=true 옵션과 유사합니다.
 *
 * @param {object} req - Express 요청 객체.
 * @param {object} res - Express 응답 객체.
 * @param {function} next - Express 다음 미들웨어 함수.
 */
export const getAllItemsWithStoreInfoCustomSQL = async (req, res, next) => {
  try {
    const itemsWithStores = await itemService.findAllItemsWithStoreDetailsCustomSQL();
    successResponse(res, undefined, itemsWithStores);
  } catch (error) {
    next(error);
  }
};

/**
 * 페이징 처리된 아이템 목록을 조회합니다 (ORM 사용).
 * HTTP GET '/items/paginated' 경로로 요청이 오면 실행됩니다.
 * 요청 쿼리 파라미터(req.query)로 'page'와 'limit' 값을 받아 페이징을 수행합니다.
 * 예: /items/paginated?page=2&limit=5
 * Java Spring Data JPA의 Pageable 객체 사용과 유사합니다.
 *
 * @param {object} req - Express 요청 객체. req.query.page, req.query.limit 등을 사용.
 * @param {object} res - Express 응답 객체.
 * @param {function} next - Express 다음 미들웨어 함수.
 */
export const getPaginatedItemsController = async (req, res, next) => {
  // req.query에서 page와 limit 값을 가져옵니다. 문자열이므로 숫자로 변환합니다.
  // 값이 없거나 유효하지 않으면 기본값을 사용합니다.
  let page = parseInt(req.query.page) || 1; // 기본 페이지 1
  const limit = parseInt(req.query.limit) || 10; // 기본 페이지 당 아이템 수 10

  // 페이지 번호가 1보다 작으면 1로 강제 조정 (음수 또는 0 방지)
  if (page < 1) {
    page = 1;
  }

  try {
    // itemService를 통해 페이징된 아이템 데이터를 가져옵니다.
    // 서비스 계층에서는 Sequelize의 findAndCountAll 메소드 등을 사용하여 전체 아이템 수와 현재 페이지의 아이템 목록을 반환합니다.
    const result = await itemService.getPaginatedItems(page, limit);
    // 결과 객체에는 보통 items, totalItems, totalPages, currentPage 등의 정보가 포함됩니다.
    successResponse(res, undefined, result);
  } catch (error) {
    logger.error('Error in getPaginatedItemsController:', error); // 오류 로깅
    next(error);
  }
};

/**
 * 페이징 처리된 아이템 목록을 조회합니다 (커스텀 SQL 사용).
 * HTTP GET '/items/paginated-custom-sql' 경로로 요청이 오면 실행됩니다.
 * 요청 쿼리 파라미터로 'page'와 'limit' 값을 받아 페이징을 수행합니다.
 *
 * @param {object} req - Express 요청 객체.
 * @param {object} res - Express 응답 객체.
 * @param {function} next - Express 다음 미들웨어 함수.
 */
export const getPaginatedItemsCustomSQLController = async (req, res, next) => {
  let page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  if (page < 1) {
    page = 1;
  }

  try {
    const result = await itemService.getPaginatedItemsCustomSQL(page, limit);
    successResponse(res, undefined, result);
  } catch (error) {
    logger.error('Error in getPaginatedItemsCustomSQLController:', error);
    next(error);
  }
};
