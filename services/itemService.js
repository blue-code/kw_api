import ItemRepository from '../repositories/ItemRepository.js';

// 커스텀 에러 클래스 (선택적이지만, 오류 유형을 구분하는 데 유용)
// 이 클래스는 변경 없이 그대로 사용합니다.
export class ServiceError extends Error {
  constructor(message, statusCode, errorCode) {
    super(message);
    this.statusCode = statusCode; // HTTP 상태 코드 제안
    this.errorCode = errorCode;   // 내부 에러 코드 (예: ITEM_NOT_FOUND)
    this.name = this.constructor.name;
  }
}

// ItemRepository 인스턴스 생성 (간단한 DI 형태)
// 실제 애플리케이션에서는 DI 컨테이너를 사용하거나 app.js 등에서 주입할 수 있습니다.
const itemRepository = new ItemRepository();

export const createNewItem = async (name, description, userId) => {
  // 컨트롤러에서 이미 name 유효성 검사를 수행한다고 가정합니다.
  // 서비스 레벨에서 추가 비즈니스 로직 검증이 필요하다면 여기에 추가할 수 있습니다.
  try {
    // ItemRepository.create는 이제 user_id를 받으므로 파라미터명 변경
    const newItem = await itemRepository.create({ name, description, user_id: userId });
    if (!newItem) {
      // Repository의 create는 성공 시 항상 객체를 반환하거나 에러를 throw하므로,
      // 이 nullish 체크는 Objection.js의 일반적인 에러 처리 방식과 중복될 수 있습니다.
      // ValidationError 등이 발생하면 아래 catch 블록에서 처리됩니다.
      // 만약 create가 특정 조건에서 null을 반환하도록 커스텀했다면 이 체크는 유효합니다.
      // 현재 ItemRepository.create는 에러를 throw하거나 객체를 반환합니다.
      throw new ServiceError('Failed to create item, repository returned nullish.', 500, 'ITEM_CREATION_REPO_NULL');
    }
    return newItem;
  } catch (error) {
    // Repository에서 발생한 일반 DB 오류 등을 ServiceError로 변환하거나 그대로 전달
    console.error('Service Error creating item:', error.message);
    // Objection.js의 ValidationError 등을 고려하여 처리할 수 있습니다.
    // 예: if (error.name === 'ValidationError') { throw new ServiceError(error.message, 400, 'VALIDATION_ERROR'); }
    if (error instanceof require('objection').ValidationError) {
        throw new ServiceError(`Validation failed: ${error.message}`, 400, 'VALIDATION_ERROR_OBJECTION');
    }
    throw new ServiceError(error.message || 'Failed to create item in database.', 500, 'DB_ERROR_CREATE');
  }
};

export const findAllItems = async () => {
  try {
    const items = await itemRepository.findAll();
    return items;
  } catch (error) {
    console.error('Service Error fetching all items:', error.message);
    throw new ServiceError(error.message || 'Failed to fetch items from database.', 500, 'DB_ERROR_FETCH_ALL');
  }
};

export const findItemById = async (itemId) => {
  try {
    const item = await itemRepository.findById(itemId); // repo에서 null 또는 객체 반환
    if (!item) {
      // itemRepository.findById가 NotFoundError를 throw하지 않고 null을 반환하도록 수정했으므로,
      // 여기서 null 체크 후 ServiceError를 발생시키는 것이 맞습니다.
      throw new ServiceError('Item not found.', 404, 'ITEM_NOT_FOUND');
    }
    return item;
  } catch (error) {
    if (error instanceof ServiceError) throw error;
    console.error('Service Error fetching item by ID:', error.message);
    throw new ServiceError(error.message || 'Failed to fetch item by ID from database.', 500, 'DB_ERROR_FETCH_ONE');
  }
};

export const updateExistingItem = async (itemId, currentUserId, updateData) => {
  const { name, description } = updateData;

  try {
    // 1. 아이템 존재 및 소유권 확인 (리포지토리 메서드 사용 또는 기존 방식 유지)
    // 여기서는 리포지토리에 findByUserIdAndItemId가 있다고 가정하고 사용합니다.
    // 또는, 먼저 findById로 아이템을 가져오고 소유자를 비교할 수도 있습니다.
    const itemExists = await itemRepository.findByUserIdAndItemId(currentUserId, itemId);
    if (!itemExists) {
      // 아이템이 없거나, 있어도 현재 사용자의 아이템이 아닌 경우
      // findById로 먼저 체크해서 404와 403을 구분할 수도 있습니다.
      const item = await itemRepository.findById(itemId);
      if (!item) {
        throw new ServiceError('Item not found.', 404, 'ITEM_NOT_FOUND_FOR_UPDATE');
      }
      throw new ServiceError('Forbidden. You are not the owner of this item.', 403, 'FORBIDDEN_ACCESS_UPDATE');
    }

    // 업데이트할 필드가 하나도 없는 경우에 대한 처리는 컨트롤러에서 이미 수행했다고 가정하거나,
    // 여기서도 확인할 수 있습니다. itemRepository.update에서 아무것도 없으면 기존 값 반환하도록 구현함.
    if (name === undefined && description === undefined) {
        // throw new ServiceError('Nothing to update. Provide name or description.', 400, 'VALIDATION_ERROR_NO_UPDATE_FIELD');
        return itemExists; // 변경 없이 기존 아이템 반환
    }

    const updatedItem = await itemRepository.update(itemId, { name, description });
    // itemRepository.update는 아이템을 찾지 못하면 null을 반환 (NotFoundError를 내부적으로 캐치하고 null로 변환)
    if (!updatedItem) {
      // 이 경우는 itemExists에서 이미 소유권까지 확인했으므로,
      // update 과정에서 아이템이 동시에 삭제되지 않는 한 발생하기 어렵습니다.
      // 또는 update 로직 내에서 다른 이유로 null이 반환될 수 있습니다 (현재 구현에서는 NotFoundError만 null로 변환).
      throw new ServiceError('Item not found or failed to update.', 404, 'ITEM_NOT_FOUND_OR_FAILED_TO_UPDATE');
    }
    return updatedItem;
  } catch (error) {
    if (error instanceof ServiceError) throw error;
    // Objection.js의 ValidationError 등을 고려
    if (error instanceof require('objection').ValidationError) {
        throw new ServiceError(`Validation failed during update: ${error.message}`, 400, 'VALIDATION_ERROR_OBJECTION_UPDATE');
    }

    console.error('Service Error updating item:', error.message);
    throw new ServiceError(error.message || 'Failed to update item in database.', 500, 'DB_ERROR_UPDATE');
  }
};

export const deleteExistingItem = async (itemId, currentUserId) => {
  try {
    // 1. 아이템 존재 및 소유권 확인
    const item = await itemRepository.findByUserIdAndItemId(currentUserId, itemId);
    if (!item) {
      const itemExistsOnlyById = await itemRepository.findById(itemId); // repo에서 null 또는 객체 반환
      if (!itemExistsOnlyById) {
        throw new ServiceError('Item not found.', 404, 'ITEM_NOT_FOUND_FOR_DELETE');
      }
      throw new ServiceError('Forbidden. You are not the owner of this item.', 403, 'FORBIDDEN_ACCESS_DELETE');
    }

    const success = await itemRepository.delete(itemId); // repo에서 boolean 반환
    if (!success) {
      // itemRepository.delete가 false를 반환하는 경우는 NotFoundError가 발생했거나 (이미 위에서 체크됨)
      // 또는 다른 이유로 삭제가 안된 경우입니다.
      // 현재 ItemRepository.delete는 NotFoundError 시 false를 반환합니다.
      throw new ServiceError('Failed to delete item, or item not found during delete attempt.', 404, 'ITEM_DELETE_FAILED_OR_NOT_FOUND');
    }
    return { message: 'Item deleted successfully.' };
  } catch (error) {
    if (error instanceof ServiceError) throw error;
    console.error('Service Error deleting item:', error.message);
    throw new ServiceError(error.message || 'Failed to delete item from database.', 500, 'DB_ERROR_DELETE');
  }
};

export const findAllItemsWithStoreDetails = async () => {
  try {
    const itemsWithStores = await itemRepository.findItemsWithStoreInfo();
    return itemsWithStores;
  } catch (error) {
    console.error('Service Error fetching items with store details:', error.message);
    throw new ServiceError(error.message || 'Failed to fetch items with store details from database.', 500, 'DB_ERROR_FETCH_ALL_WITH_STORES');
  }
};


export const findAllItemsWithStoreDetailsCustomSQL = async () => {
  try {
    const itemsWithStores = await itemRepository.findItemsWithStoreInfoCustomSQL();
    return itemsWithStores;
  } catch (error) {
    console.error('Service Error fetching items with store details via custom SQL:', error.message);
    throw new ServiceError(error.message || 'Failed to fetch items with store details from database using custom SQL.', 500, 'DB_ERROR_FETCH_ALL_WITH_STORES_CUSTOM_SQL');
  }
};

