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
    const newItem = await itemRepository.create({ name, description, userId });
    if (!newItem) { // Repository의 create가 실패하여 nullish 값을 반환하는 경우 (예: ID로 재조회 실패)
      throw new ServiceError('Failed to create or retrieve the item after creation.', 500, 'ITEM_CREATION_POST_RETRIEVAL_FAILED');
    }
    return newItem;
  } catch (error) {
    // Repository에서 발생한 일반 DB 오류 등을 ServiceError로 변환하거나 그대로 전달
    console.error('Service Error creating item:', error.message);
    // Repository에서 발생한 에러가 이미 ServiceError 타입일 수도 있으므로, instanceof 체크는 불필요하거나 수정 필요
    // 여기서는 Repository가 일반 Error를 throw한다고 가정하고 ServiceError로 감싸줍니다.
    // 만약 Repository가 이미 구체적인 오류를 던진다면, 그에 맞게 처리합니다.
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
    const item = await itemRepository.findById(itemId);
    if (!item) {
      throw new ServiceError('Item not found.', 404, 'ITEM_NOT_FOUND');
    }
    return item;
  } catch (error) {
    if (error instanceof ServiceError) throw error; // 이미 ServiceError인 경우 그대로 throw
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
    if (!updatedItem) {
      // 업데이트 후 아이템을 찾을 수 없는 경우 (update 메서드가 null 반환 시)
      // 이 경우는 위에서 findByUserIdAndItemId로 이미 확인했으므로 발생하기 어려우나 방어적으로 코딩
      throw new ServiceError('Item not found after update attempt.', 404, 'ITEM_NOT_FOUND_POST_UPDATE');
    }
    return updatedItem;
  } catch (error) {
    if (error instanceof ServiceError) throw error;
    console.error('Service Error updating item:', error.message);
    throw new ServiceError(error.message || 'Failed to update item in database.', 500, 'DB_ERROR_UPDATE');
  }
};

export const deleteExistingItem = async (itemId, currentUserId) => {
  try {
    // 1. 아이템 존재 및 소유권 확인
    const item = await itemRepository.findByUserIdAndItemId(currentUserId, itemId);
    if (!item) {
      const itemExistsOnlyById = await itemRepository.findById(itemId);
      if (!itemExistsOnlyById) {
        throw new ServiceError('Item not found.', 404, 'ITEM_NOT_FOUND_FOR_DELETE');
      }
      throw new ServiceError('Forbidden. You are not the owner of this item.', 403, 'FORBIDDEN_ACCESS_DELETE');
    }

    const success = await itemRepository.delete(itemId);
    if (!success) {
      // 삭제에 실패한 경우 (예: 아이템이 그 사이에 삭제되었거나 DB 오류)
      // findByUserIdAndItemId 에서 이미 확인했으므로, 이 경우는 드물다.
      throw new ServiceError('Failed to delete item, or item not found during delete.', 404, 'ITEM_NOT_FOUND_ON_DELETE_ATTEMPT');
    }
    return { message: 'Item deleted successfully.' };
  } catch (error) {
    if (error instanceof ServiceError) throw error;
    console.error('Service Error deleting item:', error.message);
    throw new ServiceError(error.message || 'Failed to delete item from database.', 500, 'DB_ERROR_DELETE');
  }
};
