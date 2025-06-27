import pool from '../config/db.js';

class ItemRepository {
  /**
   * 새 아이템을 생성합니다.
   * @param {object} itemData - 생성할 아이템의 데이터. { name, description, userId }
   * @returns {Promise<object>} 생성된 아이템 객체
   * @throws {Error} 데이터베이스 오류 발생 시
   */
  async create({ name, description, userId }) {
    try {
      const [result] = await pool.query(
        'INSERT INTO items (name, description, user_id) VALUES (?, ?, ?)',
        [name, description, userId]
      );
      const newItemId = result.insertId;
      return this.findById(newItemId);
    } catch (error) {
      console.error('Error in ItemRepository.create:', error);
      throw error; // 에러를 다시 throw하여 서비스 계층에서 처리하도록 함
    }
  }

  /**
   * 모든 아이템을 조회합니다.
   * @returns {Promise<Array<object>>} 아이템 객체의 배열
   * @throws {Error} 데이터베이스 오류 발생 시
   */
  async findAll() {
    try {
      const [rows] = await pool.query('SELECT id, name, description, user_id, created_at, updated_at FROM items ORDER BY created_at DESC');
      return rows;
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
      const [rows] = await pool.query('SELECT id, name, description, user_id, created_at, updated_at FROM items WHERE id = ?', [id]);
      return rows.length > 0 ? rows[0] : null;
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
      const [rows] = await pool.query('SELECT id, name, description, user_id, created_at, updated_at FROM items WHERE id = ? AND user_id = ?', [itemId, userId]);
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error('Error in ItemRepository.findByUserIdAndItemId:', error);
      throw error;
    }
  }

  /**
   * ID로 특정 아이템을 수정합니다.
   * @param {number} id - 수정할 아이템의 ID
   * @param {object} itemData - 수정할 아이템의 데이터. { name, description }
   * @returns {Promise<object|null>} 수정된 아이템 객체 또는 아이템을 찾지 못했거나 변경 사항이 없는 경우 null (findById로 다시 조회하므로, 찾지 못하면 findById가 null 반환)
   * @throws {Error} 데이터베이스 오류 발생 시
   */
  async update(id, { name, description }) {
    let query = 'UPDATE items SET ';
    const queryParams = [];
    if (name !== undefined) {
      query += 'name = ?, ';
      queryParams.push(name);
    }
    if (description !== undefined) {
      query += 'description = ?, ';
      queryParams.push(description);
    }

    if (queryParams.length === 0) {
      // 업데이트할 내용이 없으면 기존 아이템을 반환하거나, 특정 로직 처리
      return this.findById(id);
    }

    query += 'updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    queryParams.push(id);

    try {
      const [result] = await pool.query(query, queryParams);
      if (result.affectedRows === 0) {
        return null; // 업데이트된 행이 없음 (아이템이 없거나, ID가 잘못됨)
      }
      return this.findById(id); // 변경된 아이템 정보 다시 조회하여 반환
    } catch (error) {
      console.error('Error in ItemRepository.update:', error);
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
      const [result] = await pool.query('DELETE FROM items WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error in ItemRepository.delete:', error);
      throw error;
    }
  }
}

export default ItemRepository;
