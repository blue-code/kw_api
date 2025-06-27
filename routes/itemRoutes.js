import express from 'express';
import {
  createItem,
  getAllItems,
  getItemById,
  updateItemById,
  deleteItemById,

  getAllItemsWithStoreInfo,
  getAllItemsWithStoreInfoCustomSQL, // 새로 추가된 컨트롤러 함수 임포트
  getAllItemsWithStoreInfo, // 추가된 컨트롤러 함수 임포트

} from '../controllers/itemController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// POST /items - 새 아이템 생성 (인증 필요)
router.post('/', verifyToken, createItem);

// GET /items - 모든 아이템 조회 (인증 불필요)
router.get('/', getAllItems);

// GET /items-with-store - 모든 아이템 및 상점 정보 조회 (인증 불필요)
router.get('/with-store', getAllItemsWithStoreInfo);


// GET /items/with-store-custom-sql - 커스텀 SQL을 사용하여 모든 아이템 및 상점 정보 조회 (인증 불필요)
router.get('/with-store-custom-sql', getAllItemsWithStoreInfoCustomSQL);


// GET /items/:id - 특정 아이템 조회 (인증 불필요)
router.get('/:id', getItemById);

// PUT /items/:id - 특정 아이템 수정 (인증 필요)
router.put('/:id', verifyToken, updateItemById);

// DELETE /items/:id - 특정 아이템 삭제 (인증 필요)
router.delete('/:id', verifyToken, deleteItemById);

export default router;
