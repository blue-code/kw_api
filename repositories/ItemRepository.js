
import Item from '../models/Item.js'; // Objection.js Item 모델 임포트
import {NotFoundError} from 'objection';



class ItemRepository {
  /**
   * 새 아이템을 생성합니다.
   * @param {object} itemData - 생성할 아이템의 데이터. { name, description, userId }
   * @returns {Promise<object>} 생성된 아이템 객체
   * @throws {Error} 데이터베이스 오류 또는 유효성 검사 오류 발생 시
   */
  async create({ name, description, user_id }) { // user_id로 파라미터명 변경 (모델 스키마와 일치)
    try {
      // Item 모델의 $beforeInsert 훅에서 created_at, updated_at 자동 관리
      const newItem = await Item.query().insert({
        name,
        description,
        user_id
      });
      return newItem;
    } catch (error) {
      console.error('Error in ItemRepository.create:', error);
      // Objection.js의 ValidationError 등 특정 에러를 그대로 throw 하거나 커스텀 에러로 변환 가능
      throw error;

    }
  }

  /**
   * 모든 아이템을 조회합니다.
   * @returns {Promise<Array<object>>} 아이템 객체의 배열
   * @throws {Error} 데이터베이스 오류 발생 시
   */
  async findAll() {
    try {
      const items = await Item.query().orderBy('created_at', 'desc');
      return items;
    } catch (error) {
      console.error('Error in ItemRepository.findAll:', error);
      throw error;
    }
  }

  /**
   * ID로 특정 아이템을 조회합니다.
   * @param {number} id - 조회할 아이템의 ID
   * @returns {Promise<object|null>} 아이템 객체 또는 찾지 못한 경우 null
   * @throws {Error} 데이터베이스 오류 발생 시
   */
  async findById(id) {
      try {
        const item = await Item.query().findById(id);
        return item || null;
      } catch (error) {
        console.error('Error in ItemRepository.findById:', error);
        throw error;
      }
    }

  /**
   * 특정 사용자의 특정 아이템을 조회합니다. (주로 소유권 확인용)
   * @param {number} userId - 사용자 ID
   * @param {number} itemId - 아이템 ID
   * @returns {Promise<object|null>} 아이템 객체 또는 찾지 못한 경우 null
   * @throws {Error} 데이터베이스 오류 발생 시
   */
  async findByUserIdAndItemId(userId, itemId) {
    try {
      const item = await Item.query()
        .findOne({ id: itemId, user_id: userId });
      return item || null; // findOne은 못찾으면 undefined 반환하므로 null로 통일
    } catch (error) {
      console.error('Error in ItemRepository.findByUserIdAndItemId:', error);
      throw error;
    }
  }

  /**
   * ID로 특정 아이템을 수정합니다.
   * @param {number} id - 수정할 아이템의 ID
   * @param {object} itemData - 수정할 아이템의 데이터. { name, description }
   * @returns {Promise<object|null>} 수정된 아이템 객체. 아이템을 찾지 못하면 null.
   * @throws {Error} 데이터베이스 오류 또는 유효성 검사 오류 발생 시
   */
  async update(id, { name, description }) {
    const updatePayload = {};
    if (name !== undefined) {
      updatePayload.name = name;
    }
    if (description !== undefined) {
      updatePayload.description = description;
    }

    if (Object.keys(updatePayload).length === 0) {
      return this.findById(id); // 변경할 내용 없으면 현재 아이템 반환
    }

    // Item 모델의 $beforeUpdate 훅에서 updated_at 자동 관리
    try {
      // patchAndFetchById는 업데이트 후 해당 아이템 객체를 반환합니다.
      // 아이템이 없으면 NotFoundError를 발생시킵니다.
      const updatedItem = await Item.query().patchAndFetchById(id, updatePayload);
      return updatedItem;
    } catch (error) {
      console.error('Error in ItemRepository.update:', error);
      if (error instanceof NotFoundError) {
        return null; // 아이템을 찾지 못한 경우 null 반환 (서비스 계층 호환성)
      }
      throw error;
    }
  }

  /**
   * ID로 특정 아이템을 삭제합니다.
   * @param {number} id - 삭제할 아이템의 ID
   * @returns {Promise<boolean>} 삭제 성공 시 true, 아이템을 찾지 못한 경우 false
   * @throws {Error} 데이터베이스 오류 발생 시
   */
  async delete(id) {
    try {
      const numDeleted = await Item.query().deleteById(id);
      return numDeleted > 0;
    } catch (error) {
      // NotFoundError가 발생할 수 있음 (삭제할 아이템이 없는 경우)
      console.error('Error in ItemRepository.delete:', error);
      if (error instanceof NotFoundError) {
        return false; // 아이템을 찾지 못해 삭제하지 못한 경우
      }
      throw error;
    }
  }

  /**
   * 모든 아이템을 상점 정보와 함께 조회합니다.
   * @returns {Promise<Array<object>>} 아이템 객체의 배열 (각 아이템은 itemStores 정보를 포함)
   * @throws {Error} 데이터베이스 오류 발생 시
   */
  async findItemsWithStoreInfo() {
    try {
      const items = await Item.query().withGraphFetched('itemStores').orderBy('created_at', 'desc');
      return items;
    } catch (error) {
      console.error('Error in ItemRepository.findItemsWithStoreInfo:', error);
      throw error;
    }
  }
}

export default ItemRepository;
