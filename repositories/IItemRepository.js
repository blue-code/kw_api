// repositories/IItemRepository.js

/**
 * @interface IItemRepository
 * 아이템 데이터에 접근하기 위한 리포지토리 인터페이스입니다.
 * JavaScript에서는 실제 인터페이스 강제가 없으므로, 주석을 통해 계약을 정의합니다.
 */
class IItemRepository {
  /**
   * 새 아이템을 생성합니다.
   * @param {object} itemData - 생성할 아이템의 데이터. { name, description, userId }
   * @returns {Promise<object>} 생성된 아이템 객체
   * @throws {Error} 데이터베이스 오류 발생 시
   */
  async create(itemData) {
    throw new Error("Method 'create()' must be implemented.");
  }

  /**
   * 모든 아이템을 조회합니다.
   * @returns {Promise<Array<object>>} 아이템 객체의 배열
   * @throws {Error} 데이터베이스 오류 발생 시
   */
  async findAll() {
    throw new Error("Method 'findAll()' must be implemented.");
  }

  /**
   * ID로 특정 아이템을 조회합니다.
   * @param {number} id - 조회할 아이템의 ID
   * @returns {Promise<object|null>} 아이템 객체 또는 찾지 못한 경우 null
   * @throws {Error} 데이터베이스 오류 발생 시
   */
  async findById(id) {
    throw new Error("Method 'findById()' must be implemented.");
  }

  /**
   * 특정 사용자의 특정 아이템을 조회합니다. (주로 소유권 확인용)
   * @param {number} userId - 사용자 ID
   * @param {number} itemId - 아이템 ID
   * @returns {Promise<object|null>} 아이템 객체 또는 찾지 못한 경우 null
   * @throws {Error} 데이터베이스 오류 발생 시
   */
  async findByUserIdAndItemId(userId, itemId) {
    throw new Error("Method 'findByUserIdAndItemId()' must be implemented.");
  }

  /**
   * ID로 특정 아이템을 수정합니다.
   * @param {number} id - 수정할 아이템의 ID
   * @param {object} itemData - 수정할 아이템의 데이터. { name, description } (최소 하나 이상 포함)
   * @returns {Promise<object|null>} 수정된 아이템 객체 또는 아이템을 찾지 못한 경우 null
   * @throws {Error} 데이터베이스 오류 발생 시
   */
  async update(id, itemData) {
    throw new Error("Method 'update()' must be implemented.");
  }

  /**
   * ID로 특정 아이템을 삭제합니다.
   * @param {number} id - 삭제할 아이템의 ID
   * @returns {Promise<boolean>} 삭제 성공 시 true, 아이템을 찾지 못한 경우 false
   * @throws {Error} 데이터베이스 오류 발생 시
   */
  async delete(id) {
    throw new Error("Method 'delete()' must be implemented.");
  }
}

// 이 클래스는 실제 사용되지 않으며, 오직 인터페이스 정의용입니다.
// 실제 구현체는 이 '인터페이스'를 따르도록 합니다.
export default IItemRepository; // 이렇게 export 할 수도 있지만, 보통 인터페이스 파일은 직접 사용되지 않습니다.
                               // JSDoc을 위해 export 할 수 있습니다.
