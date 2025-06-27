import * as itemService from '../services/itemService.js';
import { ServiceError } from '../services/itemService.js'; // ServiceError 임포트

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
    console.error('Error in getAllItems controller:', error.message);
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
    const item = await itemService.findItemById(Number(id));
    res.status(200).json(item);
  } catch (error) {
    console.error(`Error in getItemById controller (id: ${id}):`, error.message);
    if (error instanceof ServiceError) {
      return res.status(error.statusCode || 404).json({ message: error.message, errorCode: error.errorCode });
    }
    res.status(500).json({ message: 'Failed to fetch item.', error: error.message });
  }
};

// PUT /items/:id - 특정 아이템 수정
export const updateItemById = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body; // { name, description }
  const userId = req.user.id;

  if (Object.keys(updateData).length === 0 || (updateData.name === undefined && updateData.description === undefined)) {
    return res.status(400).json({ message: 'Nothing to update. Provide name or description in the request body.' });
  }

  try {
    const updatedItem = await itemService.updateExistingItem(Number(id), userId, updateData);
    res.status(200).json({ message: 'Item updated successfully.', item: updatedItem });
  } catch (error) {
    console.error(`Error in updateItemById controller (id: ${id}):`, error.message);
    if (error instanceof ServiceError) {
      return res.status(error.statusCode || 500).json({ message: error.message, errorCode: error.errorCode });
    }
    res.status(500).json({ message: 'Failed to update item.', error: error.message });
  }
};

// DELETE /items/:id - 특정 아이템 삭제
export const deleteItemById = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const result = await itemService.deleteExistingItem(Number(id), userId);
    res.status(200).json(result); // 서비스에서 { message: '...' } 형태 반환
  } catch (error) {
    console.error(`Error in deleteItemById controller (id: ${id}):`, error.message);
    if (error instanceof ServiceError) {
      return res.status(error.statusCode || 500).json({ message: error.message, errorCode: error.errorCode });
    }
    res.status(500).json({ message: 'Failed to delete item.', error: error.message });
  }
};
