
import * as itemService from '../services/itemService.js';
import { successResponse, errorResponse } from '../utils/responseHandler.js';
import { ERROR_CODES } from '../config/errorCodes.js';
import logger from "../config/logger.js";

// POST /items - 새 아이템 생성
export const createItem = async (req, res, next) => {
  const { name, description } = req.body;
  const userId = req.user.id; // verifyToken 미들웨어에서 설정된 사용자 ID

  if (!name) {
    return res.status(400).json(errorResponse(ERROR_CODES[1001], 'Item name is required.'));
  }

  try {
    const newItem = await itemService.createNewItem(name, description, userId);
    successResponse(res, 'Item created successfully.', newItem, 201);
  } catch (error) {
    next(error);
  }
};

// GET /items - 모든 아이템 조회
export const getAllItems = async (req, res, next) => {
  try {
    const items = await itemService.findAllItems();
    successResponse(res, undefined, items);
  } catch (error) {
    next(error);
  }
};

// GET /items/:id - 특정 아이템 조회
export const getItemById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const item = await itemService.findItemById(id);
    successResponse(res, undefined, item);
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
    return errorResponse(res, 'Nothing to update. Provide name or description.', 400, ERROR_CODES[4000]);
  }

  try {
    const updatedItem = await itemService.updateExistingItem(id, userId, { name, description });
        successResponse(res, 'Item updated successfully.', updatedItem);
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
    successResponse(res, 'Item deleted successfully.', result);
  } catch (error) {
    next(error);
  }
};

// GET /items-with-store - 모든 아이템과 상점 정보 함께 조회
export const getAllItemsWithStoreInfo = async (req, res, next) => {
  try {
    const itemsWithStores = await itemService.findAllItemsWithStoreDetails();
    successResponse(res, undefined, itemsWithStores);
  } catch (error) {
    next(error);
  }
};


// GET /items/with-store-custom-sql - 커스텀 SQL을 사용하여 모든 아이템과 상점 정보 함께 조회
export const getAllItemsWithStoreInfoCustomSQL = async (req, res, next) => {
  try {
    const itemsWithStores = await itemService.findAllItemsWithStoreDetailsCustomSQL();
    successResponse(res, undefined, itemsWithStores);
  } catch (error) {
    next(error);
  }
};

export const getPaginatedItemsController = async (req, res, next) => {
  let page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  // 페이지 번호가 1보다 작으면 1로 설정
  if (page < 1) {
    page = 1;
  }

  try {
    const result = await itemService.getPaginatedItems(page, limit);
    successResponse(res, undefined, result);
  } catch (error) {
    logger.error(error)
    next(error);
  }
};

export const getPaginatedItemsCustomSQLController = async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  try {
    const result = await itemService.getPaginatedItemsCustomSQL(page, limit);
    successResponse(res, undefined, result);
  } catch (error) {
    next(error);
  }
};

