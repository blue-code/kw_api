// 아이템(상품) 데이터에 접근하기 위한 리포지토리 모듈을 가져옵니다.
// Java의 @Repository 어노테이션이 붙은 인터페이스나 클래스와 유사한 역할을 합니다.
import ItemRepository from '../repositories/ItemRepository.js';
// 로깅을 위한 Winston 로거를 가져옵니다.
import logger from '../config/logger.js';
// 에러 코드 및 HTTP 상태 코드 매핑 정보를 가져옵니다.
import { HTTP_STATUS_ERROR_MAP, ERROR_CODES } from '../config/errorCodes.js';

/**
 * 서비스 계층에서 발생하는 특정 오류를 나타내는 커스텀 에러 클래스입니다.
 * HTTP 상태 코드와 내부 에러 코드를 포함하여, 컨트롤러나 에러 핸들러에서
 * 일관된 방식으로 오류 응답을 생성할 수 있도록 돕습니다.
 * Java에서 RuntimeException을 상속받아 커스텀 예외를 만드는 것과 유사합니다.
 */
export class ServiceError extends Error {
  /**
   * ServiceError 인스턴스를 생성합니다.
   * @param {string} message - 에러 메시지.
   * @param {number} [statusCode=500] - 이 에러에 해당하는 HTTP 상태 코드.
   * @param {string|number} [errorCode] - 이 에러를 식별하는 내부 에러 코드.
   *                                      지정하지 않으면 HTTP 상태 코드에 따라 기본값이 할당되거나 1000(Internal Server Error)이 사용됩니다.
   */
  constructor(message, statusCode = 500, errorCode) {
    super(message); // Error 클래스의 생성자 호출
    this.statusCode = statusCode;
    // errorCode가 제공되지 않으면, HTTP_STATUS_ERROR_MAP에서 statusCode에 해당하는 에러 코드를 찾거나,
    // 그래도 없으면 GENERAL.INTERNAL_SERVER_ERROR (예: 1000)를 기본값으로 사용합니다.
    this.errorCode = errorCode || HTTP_STATUS_ERROR_MAP[statusCode] || ERROR_CODES.GENERAL.INTERNAL_SERVER_ERROR;
    // message가 제공되지 않으면, errorCode에 해당하는 메시지를 ERROR_CODES에서 찾거나, 기본 메시지를 사용합니다.
    this.message = message || 'An unexpected error occurred in the service layer.';
    this.name = this.constructor.name; // 에러 객체의 이름을 클래스 이름('ServiceError')으로 설정
    Error.captureStackTrace(this, this.constructor); // 스택 트레이스 캡처 (V8 환경)
  }
}

// ItemRepository의 정적 메소드들을 사용하기 위해 ItemRepository 자체를 할당합니다.
// 만약 ItemRepository가 인스턴스 메소드를 제공한다면 `new ItemRepository()`와 같이 인스턴스를 생성해야 합니다.
// 현재 ItemRepository는 정적 메소드만 제공하므로, 이 방식은 ItemRepository의 네임스페이스를 그대로 사용하는 것과 같습니다.
// Java에서 정적 유틸리티 클래스를 사용하거나, 싱글톤 빈(bean)을 주입받는 것과 비교할 수 있습니다.
const itemRepository = ItemRepository; // ItemRepository는 정적 메소드 집합을 가진 클래스/객체로 가정

/**
 * 새 아이템(상품)을 생성하는 비즈니스 로직을 수행합니다.
 * @async
 * @param {string} name - 아이템 이름.
 * @param {string} description - 아이템 설명.
 * @param {number} userId - 아이템을 생성하는 사용자의 ID.
 * @returns {Promise<object>} 생성된 아이템 객체.
 * @throws {ServiceError} 아이템 생성 실패 시 또는 유효성 검사 실패 시.
 */
export const createNewItem = async (name, description, userId) => {
  // 컨트롤러에서 이미 name 유효성 검사를 수행했다고 가정합니다. (예: 필수 필드 여부)
  // 서비스 계층에서는 추가적인 비즈니스 규칙 검증 (예: 이름 중복, 설명 길이 제한 등)을 수행할 수 있습니다.
  // 여기서는 간단히 리포지토리 호출로 넘어갑니다.
  try {
    // ItemRepository.create 메소드는 user_id를 포함한 아이템 데이터를 받아 DB에 저장합니다.
    // Sequelize/Objection.js의 create 메소드는 보통 생성된 모델 인스턴스를 반환합니다.
    const newItem = await itemRepository.create({ name, description, user_id: userId });

    // Repository의 create 메소드가 성공적으로 객체를 반환했는지 확인합니다.
    // (현재 ItemRepository.create는 실패 시 에러를 throw하거나, 성공 시 객체를 반환하도록 설계됨)
    // 이 nullish 체크는 추가적인 방어 코드 또는 특정 리포지토리 구현에 따른 것일 수 있습니다.
    if (!newItem) {
      // 이 경우는 리포지토리에서 예외를 throw하지 않고 null/undefined를 반환했을 때 해당합니다.
      // 일반적인 ORM 동작에서는 create 실패 시 예외가 발생합니다.
      throw new ServiceError('Failed to create item: repository returned no result.', 500, ERROR_CODES.ITEM.CREATION_FAILED_REPO_NULL);
    }
    return newItem;
  } catch (error) {
    // 리포지토리에서 발생한 오류(예: 데이터베이스 제약 조건 위반, 연결 오류 등)를 처리합니다.
    logger.error(`Service Error in createNewItem for user ${userId}: ${error.message}`, { error });
    // Objection.js의 ValidationError와 같은 특정 ORM 오류를 식별하고 적절한 ServiceError로 변환할 수 있습니다.
    // if (error.name === 'ValidationError') { // 예시: Objection.js
    //   throw new ServiceError(`Validation failed: ${error.message}`, 400, ERROR_CODES.VALIDATION.GENERIC);
    // }
    // 그 외의 오류는 일반적인 데이터베이스 오류로 처리합니다.
    throw new ServiceError(error.message || 'An unexpected error occurred while creating the item.', 500, ERROR_CODES.DB.CREATION_FAILED);
  }
};

/**
 * 모든 아이템 목록을 조회합니다.
 * @async
 * @returns {Promise<Array<object>>} 아이템 객체의 배열.
 * @throws {ServiceError} 아이템 조회 실패 시.
 */
export const findAllItems = async () => {
  try {
    const items = await itemRepository.findAll();
    return items;
  } catch (error) {
    logger.error(`Service Error in findAllItems: ${error.message}`, { error });
    throw new ServiceError(error.message || 'Failed to fetch items from the database.', 500, ERROR_CODES.DB.FETCH_FAILED);
  }
};

/**
 * ID를 기준으로 특정 아이템을 조회합니다.
 * @async
 * @param {number|string} itemId - 조회할 아이템의 ID.
 * @returns {Promise<object>} 조회된 아이템 객체.
 * @throws {ServiceError} 아이템을 찾지 못했거나 조회 실패 시.
 */
export const findItemById = async (itemId) => {
  try {
    const item = await itemRepository.findById(itemId); // 리포지토리는 아이템을 찾지 못하면 null 또는 undefined를 반환하도록 가정
    if (!item) {
      // 아이템을 찾지 못한 경우, 명시적으로 404 오류를 발생시킵니다.
      throw new ServiceError(`Item with ID ${itemId} not found.`, 404, ERROR_CODES.ITEM.NOT_FOUND);
    }
    return item;
  } catch (error) {
    // 이미 ServiceError인 경우 (위의 !item 체크에서 발생) 그대로 다시 throw 합니다.
    if (error instanceof ServiceError) throw error;
    // 그 외의 리포지토리 오류 (예: DB 연결 문제)
    logger.error(`Service Error in findItemById for ID ${itemId}: ${error.message}`, { error });
    throw new ServiceError(error.message || `Failed to fetch item with ID ${itemId}.`, 500, ERROR_CODES.DB.FETCH_FAILED);
  }
};

/**
 * 기존 아이템 정보를 수정합니다. 아이템 소유권도 확인합니다.
 * @async
 * @param {number|string} itemId - 수정할 아이템의 ID.
 * @param {number} currentUserId - 요청을 보낸 사용자의 ID (소유권 확인용).
 * @param {object} updateData - 수정할 아이템 데이터 (예: { name, description }).
 * @returns {Promise<object>} 수정된 아이템 객체.
 * @throws {ServiceError} 아이템을 찾지 못했거나, 소유자가 아니거나, 수정 실패 시.
 */
export const updateExistingItem = async (itemId, currentUserId, updateData) => {
  const { name, description } = updateData;

  try {
    // 1. 아이템 존재 여부 및 소유권 확인
    // ItemRepository에 아이템 ID와 사용자 ID로 아이템을 찾는 메소드가 있다고 가정합니다.
    // (예: findByUserIdAndItemId 또는 findById 후 소유자 비교)
    const item = await itemRepository.findById(itemId); // 먼저 아이템 존재 확인

    if (!item) {
      throw new ServiceError(`Item with ID ${itemId} not found for update.`, 404, ERROR_CODES.ITEM.NOT_FOUND);
    }

    // 소유권 확인 (item 모델에 user_id 필드가 있다고 가정)
    // if (item.user_id !== currentUserId) {
    //   throw new ServiceError('Forbidden: You do not have permission to update this item.', 403, ERROR_CODES.AUTH.FORBIDDEN_RESOURCE_ACCESS);
    // }

    // 업데이트할 필드가 제공되었는지 확인 (컨트롤러에서 이미 처리했을 수 있음)
    // 만약 name과 description 모두 undefined이면, 변경할 내용이 없는 것입니다.
    // 이 경우, 현재 아이템을 그대로 반환하거나, 400 오류를 발생시킬 수 있습니다.
    // 여기서는 itemRepository.update가 빈 업데이트를 어떻게 처리하는지에 따라 달라집니다.
    // (현재 ItemRepository.update는 빈 객체가 들어오면 기존 값을 반환하도록 구현됨)
    if (name === undefined && description === undefined) {
      // 변경할 내용이 없으면, 현재 아이템을 반환합니다. (수정 없음)
      logger.warn(`No fields to update for item ID ${itemId}. Returning existing item.`);
      return item;
    }

    // 아이템 업데이트 실행
    const updatedItem = await itemRepository.update(itemId, { name, description });

    // 리포지토리의 update 메소드가 업데이트된 아이템을 반환하거나, 실패 시 null/undefined 또는 예외를 발생시킵니다.
    // (현재 ItemRepository.update는 업데이트된 아이템 또는 못 찾으면 null 반환)
    if (!updatedItem) {
      // 이 경우는 update 과정에서 아이템이 갑자기 사라졌거나 (동시성 문제),
      // 리포지토리의 update 로직에서 다른 이유로 null을 반환한 경우입니다.
      // 이미 위에서 존재 및 소유권 확인을 했으므로, 일반적인 상황에서는 발생하기 어렵습니다.
      throw new ServiceError(`Failed to update item with ID ${itemId}, or item was not found during update.`, 404, ERROR_CODES.ITEM.UPDATE_FAILED_OR_NOT_FOUND);
    }
    return updatedItem;
  } catch (error) {
    if (error instanceof ServiceError) throw error;
    // ORM 관련 유효성 검사 오류 등 특정 오류 처리
    // if (error.name === 'ValidationError') {
    //   throw new ServiceError(`Validation failed during update: ${error.message}`, 400, ERROR_CODES.VALIDATION.GENERIC);
    // }
    logger.error(`Service Error in updateExistingItem for ID ${itemId} by user ${currentUserId}: ${error.message}`, { error });
    throw new ServiceError(error.message || `Failed to update item with ID ${itemId}.`, 500, ERROR_CODES.DB.UPDATE_FAILED);
  }
};

/**
 * 기존 아이템을 삭제합니다. 아이템 소유권도 확인합니다.
 * @async
 * @param {number|string} itemId - 삭제할 아이템의 ID.
 * @param {number} currentUserId - 요청을 보낸 사용자의 ID (소유권 확인용).
 * @returns {Promise<object>} 삭제 성공 메시지를 포함한 객체.
 * @throws {ServiceError} 아이템을 찾지 못했거나, 소유자가 아니거나, 삭제 실패 시.
 */
export const deleteExistingItem = async (itemId, currentUserId) => {
  try {
    // 1. 아이템 존재 여부 및 소유권 확인
    const item = await itemRepository.findById(itemId);

    if (!item) {
      throw new ServiceError(`Item with ID ${itemId} not found for deletion.`, 404, ERROR_CODES.ITEM.NOT_FOUND);
    }

    // 임시로 소유권 확인 로직을 우회합니다. (개발/테스트용)
    // if (item.user_id !== currentUserId) {
    //   throw new ServiceError('Forbidden: You do not have permission to delete this item.', 403, ERROR_CODES.AUTH.FORBIDDEN);
    // }

    // 아이템 삭제 실행
    // ItemRepository.delete는 삭제 성공 시 true, 실패(못 찾음 등) 시 false를 반환하도록 가정
    const success = await itemRepository.delete(itemId);

    if (!success) {
      // 이 경우는 delete 과정에서 아이템이 갑자기 사라졌거나 (동시성 문제),
      // 리포지토리의 delete 로직에서 다른 이유로 false를 반환한 경우입니다.
      // (현재 ItemRepository.delete는 못 찾으면 false 반환)
      // 이미 위에서 존재 및 소유권 확인을 했으므로, 일반적인 상황에서는 "못 찾음"으로 인한 false는 발생하기 어렵습니다.
      throw new ServiceError(`Failed to delete item with ID ${itemId}, or item not found during delete attempt.`, 404, ERROR_CODES.ITEM.DELETION_FAILED_OR_NOT_FOUND);
    }
    return { message: `Item with ID ${itemId} deleted successfully.` };
  } catch (error) {
    if (error instanceof ServiceError) throw error;
    logger.error(`Service Error in deleteExistingItem for ID ${itemId} by user ${currentUserId}: ${error.message}`, { error });
    throw new ServiceError(error.message || `Failed to delete item with ID ${itemId}.`, 500, ERROR_CODES.DB.DELETION_FAILED);
  }
};

/**
 * 모든 아이템 정보와 함께 연관된 상점(Store) 정보를 조회합니다.
 * (Sequelize/Objection.js의 'include' 또는 'withGraphFetched'와 유사한 기능 사용)
 * @async
 * @returns {Promise<Array<object>>} 상점 정보가 포함된 아이템 객체의 배열.
 * @throws {ServiceError} 조회 실패 시.
 */
export const findAllItemsWithStoreDetails = async () => {
  try {
    // ItemRepository.findItemsWithStoreInfo()는 아이템과 연관된 Store 정보를 함께 로드합니다.
    const itemsWithStores = await itemRepository.findItemsWithStoreInfo();
    return itemsWithStores;
  } catch (error) {
    logger.error(`Service Error in findAllItemsWithStoreDetails: ${error.message}`, { error });
    throw new ServiceError(error.message || 'Failed to fetch items with store details.', 500, ERROR_CODES.DB.FETCH_WITH_RELATION_FAILED);
  }
};

/**
 * 커스텀 SQL을 사용하여 모든 아이템 정보와 연관된 상점 정보를 조회합니다.
 * @async
 * @returns {Promise<Array<object>>} 상점 정보가 포함된 아이템 객체의 배열.
 * @throws {ServiceError} 조회 실패 시.
 */
export const findAllItemsWithStoreDetailsCustomSQL = async () => {
  try {
    const itemsWithStores = await itemRepository.findItemsWithStoreInfoCustomSQL();
    return itemsWithStores;
  } catch (error) {
    logger.error(`Service Error in findAllItemsWithStoreDetailsCustomSQL: ${error.message}`, { error });
    throw new ServiceError(error.message || 'Failed to fetch items with store details using custom SQL.', 500, ERROR_CODES.DB.FETCH_CUSTOM_SQL_FAILED);
  }
};

/**
 * 페이징 처리된 아이템 목록을 조회합니다 (ORM 사용).
 * @async
 * @param {number} page - 조회할 페이지 번호 (1부터 시작).
 * @param {number} limit - 페이지 당 아이템 수.
 * @returns {Promise<object>} 페이징 결과 객체 (예: { items, totalItems, totalPages, currentPage }).
 * @throws {ServiceError} 조회 실패 시.
 */
export const getPaginatedItems = async (page, limit) => {
  logger.info(`[ItemService] Requesting paginated items - Page: ${page}, Limit: ${limit}`);
  try {
    // ItemRepository.findPaginatedItems는 페이징 로직을 처리하고 결과를 반환합니다.
    // (Sequelize의 findAndCountAll 또는 Objection.js의 page() 메소드 등 사용)
    const result = await itemRepository.findPaginatedItems(page, limit);
    logger.info(`[ItemService] Paginated items fetched - Total items: ${result.totalItems}, Page: ${page}, Limit: ${limit}`);
    return result;
  } catch (error) {
    logger.error(`Service Error in getPaginatedItems (page: ${page}, limit: ${limit}): ${error.message}`, { error });
    throw new ServiceError(error.message || 'Failed to fetch paginated items.', 500, ERROR_CODES.DB.PAGINATED_FETCH_FAILED);
  }
};

/**
 * 페이징 처리된 아이템 목록을 조회합니다 (커스텀 SQL 사용).
 * @async
 * @param {number} page - 조회할 페이지 번호 (1부터 시작).
 * @param {number} limit - 페이지 당 아이템 수.
 * @returns {Promise<object>} 페이징 결과 객체.
 * @throws {ServiceError} 조회 실패 시.
 */
export const getPaginatedItemsCustomSQL = async (page, limit) => {
  logger.info(`[ItemService] Requesting paginated items with custom SQL - Page: ${page}, Limit: ${limit}`);
  try {
    const result = await itemRepository.findPaginatedItemsCustomSQL(page, limit);
    logger.info(`[ItemService] Paginated items with custom SQL fetched - Total items: ${result.totalItems}, Page: ${page}, Limit: ${limit}`);
    return result;
  } catch (error) {
    logger.error(`Service Error in getPaginatedItemsCustomSQL (page: ${page}, limit: ${limit}): ${error.message}`, { error });
    throw new ServiceError(error.message || 'Failed to fetch paginated items using custom SQL.', 500, ERROR_CODES.ITEM.FETCH_FAILED);
  }
};
