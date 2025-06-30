
import * as itemService from '../services/itemService.js';
import { ServiceError } from '../services/itemService.js'; // ServiceError도 import 합니다.

// POST /items - 새 아이템 생성
export const createItem = async (req, res) => {
  const { name, description } = req.body;
  const userId = req.user.id; // verifyToken 미들웨어에서 설정된 사용자 ID

  if (!name) {
    return res.status(400).json({ message: 'Item name is required.' });
  }

  try {
    const newItem = await itemService.createNewItem(name, description, userId);
    res.status(201).json({ message: 'Item created successfully.', item: newItem });
  } catch (error) {
    console.error('Error in createItem controller:', error.message);
    if (error instanceof ServiceError) {
      return res.status(error.statusCode || 500).json({ message: error.message, errorCode: error.errorCode });
    }
    res.status(500).json({ message: 'Failed to create item.', error: error.message });
  }
};

// GET /items - 모든 아이템 조회
export const getAllItems = async (req, res) => {
  try {
    const items = await itemService.findAllItems();
    res.status(200).json(items);
  } catch (error) {
    console.error('Error fetching items controller:', error.message);
    if (error instanceof ServiceError) {
      return res.status(error.statusCode || 500).json({ message: error.message, errorCode: error.errorCode });
    }
    res.status(500).json({ message: 'Failed to fetch items.', error: error.message });
  }
};

// GET /items/:id - 특정 아이템 조회
export const getItemById = async (req, res) => {
  const { id } = req.params;
  try {
    const item = await itemService.findItemById(id);
    res.status(200).json(item);
  } catch (error) {
    console.error('Error fetching item by ID controller:', error.message);
    if (error instanceof ServiceError) {
      return res.status(error.statusCode || 500).json({ message: error.message, errorCode: error.errorCode });
    }
    // ServiceError가 아닌 경우 (예: DB 연결 실패 등) 또는 statusCode가 없는 ServiceError
    res.status(500).json({ message: 'Failed to fetch item.', error: error.message });
  }
};

// PUT /items/:id - 특정 아이템 수정
export const updateItemById = async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  const userId = req.user.id; // 요청을 보낸 사용자 ID

  if (name === undefined && description === undefined) { // service에서 name이 빈 문자열일 수 있으므로 undefined로 체크
    return res.status(400).json({ message: 'Nothing to update. Provide name or description.' });
  }

  try {
    const updatedItem = await itemService.updateExistingItem(id, userId, { name, description });
    res.status(200).json({ message: 'Item updated successfully.', item: updatedItem });
  } catch (error) {
    console.error('Error updating item controller:', error.message);
    if (error instanceof ServiceError) {
      return res.status(error.statusCode || 500).json({ message: error.message, errorCode: error.errorCode });
    }
    res.status(500).json({ message: 'Failed to update item.', error: error.message });
  }
};

// DELETE /items/:id - 특정 아이템 삭제
export const deleteItemById = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id; // 요청을 보낸 사용자 ID

  try {
    const result = await itemService.deleteExistingItem(id, userId);
    res.status(200).json(result); // 서비스에서 { message: '...' } 형태를 반환한다고 가정
  } catch (error) {
    console.error('Error deleting item controller:', error.message);
    if (error instanceof ServiceError) {
      return res.status(error.statusCode || 500).json({ message: error.message, errorCode: error.errorCode });
    }
    res.status(500).json({ message: 'Failed to delete item.', error: error.message });
  }
};

// GET /items-with-store - 모든 아이템과 상점 정보 함께 조회
export const getAllItemsWithStoreInfo = async (req, res) => {
  try {
    const itemsWithStores = await itemService.findAllItemsWithStoreDetails();
    res.status(200).json(itemsWithStores);
  } catch (error) {
    console.error('Error fetching items with store info controller:', error.message);
    if (error instanceof ServiceError) {
      return res.status(error.statusCode || 500).json({ message: error.message, errorCode: error.errorCode });
    }
    res.status(500).json({ message: 'Failed to fetch items with store info.', error: error.message });
  }
};


// GET /items/with-store-custom-sql - 커스텀 SQL을 사용하여 모든 아이템과 상점 정보 함께 조회
export const getAllItemsWithStoreInfoCustomSQL = async (req, res) => {
  try {
    const itemsWithStores = await itemService.findAllItemsWithStoreDetailsCustomSQL();
    res.status(200).json(itemsWithStores);
  } catch (error) {
    console.error('Error fetching items with store info via custom SQL controller:', error.message);
    if (error instanceof ServiceError) {
      return res.status(error.statusCode || 500).json({ message: error.message, errorCode: error.errorCode });
    }
    res.status(500).json({ message: 'Failed to fetch items with store info using custom SQL.', error: error.message });
  }
};

export const getPaginatedItemsController = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  try {
    const result = await itemService.getPaginatedItems(page, limit);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching paginated items controller:', error.message);
    if (error instanceof ServiceError) {
      return res.status(error.statusCode || 500).json({ message: error.message, errorCode: error.errorCode });
    }
    res.status(500).json({ message: 'Failed to fetch paginated items.', error: error.message });
  }
};

export const getPaginatedItemsCustomSQLController = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  try {
    const result = await itemService.getPaginatedItemsCustomSQL(page, limit);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching paginated items via custom SQL controller:', error.message);
    if (error instanceof ServiceError) {
      return res.status(error.statusCode || 500).json({ message: error.message, errorCode: error.errorCode });
    }
    res.status(500).json({ message: 'Failed to fetch paginated items using custom SQL.', error: error.message });
  }
};

