import pool from '../config/db.js';

// 커스텀 에러 클래스 (선택적이지만, 오류 유형을 구분하는 데 유용)
export class ServiceError extends Error {
  constructor(message, statusCode, errorCode) {
    super(message);
    this.statusCode = statusCode; // HTTP 상태 코드 제안
    this.errorCode = errorCode;   // 내부 에러 코드 (예: ITEM_NOT_FOUND)
    this.name = this.constructor.name;
  }
}

export const createNewItem = async (name, description, userId) => {
  if (!name) {
    // 서비스 레벨에서도 필수 값 검증을 할 수 있으나, 컨트롤러에서 1차 검증하는 것이 일반적입니다.
    // 여기서는 컨트롤러에서 이미 검증했다고 가정하거나, 중복 검증을 할 수도 있습니다.
    // throw new ServiceError('Item name is required.', 400, 'VALIDATION_ERROR');
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO items (name, description, user_id) VALUES (?, ?, ?)',
      [name, description, userId]
    );
    const newItemId = result.insertId;
    const [rows] = await pool.query('SELECT * FROM items WHERE id = ?', [newItemId]);
    if (rows.length === 0) {
      // 이 경우는 거의 발생하지 않지만, 방어적으로 코딩
      throw new ServiceError('Failed to retrieve the created item.', 500, 'DB_ERROR_CREATE_RETRIEVE');
    }
    return rows[0];
  } catch (error) {
    console.error('DB Error creating item in service:', error);
    throw new ServiceError('Failed to create item in database.', 500, 'DB_ERROR_CREATE');
  }
};

export const findAllItems = async () => {
  try {
    const [rows] = await pool.query('SELECT id, name, description, user_id, created_at, updated_at FROM items ORDER BY created_at DESC');
    return rows;
  } catch (error) {
    console.error('DB Error fetching all items in service:', error);
    throw new ServiceError('Failed to fetch items from database.', 500, 'DB_ERROR_FETCH_ALL');
  }
};

export const findItemById = async (itemId) => {
  try {
    const [rows] = await pool.query('SELECT id, name, description, user_id, created_at, updated_at FROM items WHERE id = ?', [itemId]);
    if (rows.length === 0) {
      throw new ServiceError('Item not found.', 404, 'ITEM_NOT_FOUND');
    }
    return rows[0];
  } catch (error) {
    if (error instanceof ServiceError) throw error; // 이미 ServiceError인 경우 그대로 throw
    console.error('DB Error fetching item by ID in service:', error);
    throw new ServiceError('Failed to fetch item by ID from database.', 500, 'DB_ERROR_FETCH_ONE');
  }
};

export const updateExistingItem = async (itemId, currentUserId, updateData) => {
  const { name, description } = updateData;

  // 1. 아이템 존재 및 소유권 확인
  const item = await findItemById(itemId); // 내부적으로 ITEM_NOT_FOUND 에러 처리
  if (item.user_id !== currentUserId) {
    throw new ServiceError('Forbidden. You are not the owner of this item.', 403, 'FORBIDDEN_ACCESS');
  }

  // 2. 업데이트 쿼리 생성
  let query = 'UPDATE items SET ';
  const queryParams = [];
  if (name !== undefined) { // 이름이 빈 문자열로 오는 경우도 업데이트 대상으로 처리
    query += 'name = ?, ';
    queryParams.push(name);
  }
  if (description !== undefined) {
    query += 'description = ?, ';
    queryParams.push(description);
  }

  // 업데이트할 필드가 없으면 오류 (또는 아무 작업 안 함)
  if (queryParams.length === 0) {
    // throw new ServiceError('Nothing to update. Provide name or description.', 400, 'VALIDATION_ERROR_NO_UPDATE_FIELD');
    return item; // 아무것도 변경하지 않고 현재 아이템 반환 (또는 특정 메시지 반환)
  }

  query += 'updated_at = CURRENT_TIMESTAMP WHERE id = ?';
  queryParams.push(itemId);

  try {
    const [result] = await pool.query(query, queryParams);
    if (result.affectedRows === 0) {
      // 이 경우는 findItemById에서 이미 걸러졌거나, 동시에 삭제된 극히 드문 경우
      throw new ServiceError('Item not found or no changes made during update.', 404, 'ITEM_NOT_FOUND_ON_UPDATE');
    }
    return findItemById(itemId); // 변경된 아이템 정보 다시 조회하여 반환
  } catch (error) {
    if (error instanceof ServiceError) throw error;
    console.error('DB Error updating item in service:', error);
    throw new ServiceError('Failed to update item in database.', 500, 'DB_ERROR_UPDATE');
  }
};

export const deleteExistingItem = async (itemId, currentUserId) => {
  // 1. 아이템 존재 및 소유권 확인
  const item = await findItemById(itemId); // ITEM_NOT_FOUND 에러 처리
  if (item.user_id !== currentUserId) {
    throw new ServiceError('Forbidden. You are not the owner of this item.', 403, 'FORBIDDEN_ACCESS');
  }

  try {
    const [result] = await pool.query('DELETE FROM items WHERE id = ?', [itemId]);
    if (result.affectedRows === 0) {
      // 이 경우는 findItemById에서 이미 걸러졌거나, 동시에 삭제된 극히 드문 경우
      throw new ServiceError('Item not found during delete operation.', 404, 'ITEM_NOT_FOUND_ON_DELETE');
    }
    return { message: 'Item deleted successfully.' }; // 성공 메시지 또는 삭제된 아이템 ID 등 반환 가능
  } catch (error) {
    if (error instanceof ServiceError) throw error;
    console.error('DB Error deleting item in service:', error);
    throw new ServiceError('Failed to delete item from database.', 500, 'DB_ERROR_DELETE');
  }
};
