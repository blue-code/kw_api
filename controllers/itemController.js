
import * as itemService from '../services/itemService.js';
import { successResponse, errorResponse } from '../utils/responseHandler.js';
import { ERROR_CODES } from '../config/errorCodes.js';

// POST /items - 새 아이템 생성
export const createItem = async (req, res, next) => {
  const { name, description } = req.body;
  const userId = req.user.id; // verifyToken 미들웨어에서 설정된 사용자 ID

  if (!name) {
    return res.status(400).json(errorResponse(ERROR_CODES[1001], 'Item name is required.'));
  }

  try {
    const newItem = await itemService.createNewItem(name, description, userId);
    res.status(201).json(successResponse(newItem, 'Item created successfully.'));
  } catch (error) {
    next(error);
  }
};

// GET /items - 모든 아이템 조회
export const getAllItems = async (req, res, next) => {
  try {
    const items = await itemService.findAllItems();
    res.status(200).json(successResponse(items));
  } catch (error) {
    next(error);
  }
};

// GET /items/:id - 특정 아이템 조회
export const getItemById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const item = await itemService.findItemById(id);
    res.status(200).json(successResponse(item));
  } catch (error) {
    next(error);
  }
};

// PUT /items/:id - 특정 아이템 수정
export const updateItemById = async (req, res, next) => {
  const { id } = req.params;
  const { name, description } = req.body;
  const userId = req.user.id; // 요청을 보낸 사용자 ID

  if (name === undefined && description === undefined) { // service에서 name이 빈 문자열일 수 있으므로 undefined로 체크
    return res.status(400).json(errorResponse(ERROR_CODES[4000], 'Nothing to update. Provide name or description.'));
  }

  try {
    const updatedItem = await itemService.updateExistingItem(id, userId, { name, description });
    res.status(200).json(successResponse(updatedItem, 'Item updated successfully.'));
  } catch (error) {
    next(error);
  }
};

// DELETE /items/:id - 특정 아이템 삭제
export const deleteItemById = async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id; // 요청을 보낸 사용자 ID

  try {
    const result = await itemService.deleteExistingItem(id, userId);
    res.status(200).json(successResponse(result, 'Item deleted successfully.'));
  } catch (error) {
    next(error);
  }
};

// GET /items-with-store - 모든 아이템과 상점 정보 함께 조회
export const getAllItemsWithStoreInfo = async (req, res, next) => {
  try {
    const itemsWithStores = await itemService.findAllItemsWithStoreDetails();
    res.status(200).json(successResponse(itemsWithStores));
  } catch (error) {
    next(error);
  }
};


// GET /items/with-store-custom-sql - 커스텀 SQL을 사용하여 모든 아이템과 상점 정보 함께 조회
export const getAllItemsWithStoreInfoCustomSQL = async (req, res, next) => {
  try {
    const itemsWithStores = await itemService.findAllItemsWithStoreDetailsCustomSQL();
    res.status(200).json(successResponse(itemsWithStores));
  } catch (error) {
    next(error);
  }
};

export const getPaginatedItemsController = async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  try {
    const result = await itemService.getPaginatedItems(page, limit);
    res.status(200).json(successResponse(result));
  } catch (error) {
    next(error);
  }
};

export const getPaginatedItemsCustomSQLController = async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  try {
    const result = await itemService.getPaginatedItemsCustomSQL(page, limit);
    res.status(200).json(successResponse(result));
  } catch (error) {
    next(error);
  }
};

