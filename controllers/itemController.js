
import pool from '../config/db.js';

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

    const [rows] = await pool.query('SELECT id, name, description, user_id, created_at, updated_at FROM items ORDER BY created_at DESC');
    // 사용자에게 user_id를 직접 노출하는 대신, 사용자 정보를 함께 제공하거나 user_id를 제외할 수 있습니다.
    // 예: JOIN을 사용하여 사용자 이름 등을 가져오거나, 응답 객체에서 user_id 필드를 제거합니다.
    // 여기서는 일단 모든 정보를 반환합니다.
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching items:', error);

    res.status(500).json({ message: 'Failed to fetch items.', error: error.message });
  }
};

// GET /items/:id - 특정 아이템 조회
export const getItemById = async (req, res) => {
  const { id } = req.params;
  try {

    const [rows] = await pool.query('SELECT id, name, description, user_id, created_at, updated_at FROM items WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Item not found.' });
    }
    res.status(200).json(rows[0]);
  } catch (error) {
    console.error('Error fetching item by ID:', error);
    res.status(500).json({ message: 'Failed to fetch item.', error: error.message });
  }
};

// PUT /items/:id - 특정 아이템 수정
export const updateItemById = async (req, res) => {
  const { id } = req.params;

  const { name, description } = req.body;
  const userId = req.user.id; // 요청을 보낸 사용자 ID

  if (!name && description === undefined) {
    return res.status(400).json({ message: 'Nothing to update. Provide name or description.' });
  }

  try {
    // 먼저 아이템이 존재하는지, 그리고 요청한 사용자가 아이템의 소유자인지 확인 (선택적이지만 권장)
    const [itemRows] = await pool.query('SELECT user_id FROM items WHERE id = ?', [id]);
    if (itemRows.length === 0) {
      return res.status(404).json({ message: 'Item not found.' });
    }
    // 아이템 소유권 확인 (init_db.sql의 items 테이블에 user_id가 있다고 가정)
    if (itemRows[0].user_id !== userId) {
      return res.status(403).json({ message: 'Forbidden. You are not the owner of this item.' });
    }

    let query = 'UPDATE items SET ';
    const queryParams = [];
    if (name) {
      query += 'name = ?, ';
      queryParams.push(name);
    }
    if (description !== undefined) {
      query += 'description = ?, ';
      queryParams.push(description);
    }
    query += 'updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    queryParams.push(id);

    const [result] = await pool.query(query, queryParams);

    if (result.affectedRows === 0) {
      // 이 경우는 위에서 이미 404로 처리했으므로 실제로는 도달하기 어려울 수 있음
      return res.status(404).json({ message: 'Item not found or no changes made.' });
    }

    const [updatedItemRows] = await pool.query('SELECT * FROM items WHERE id = ?', [id]);
    res.status(200).json({ message: 'Item updated successfully.', item: updatedItemRows[0] });
  } catch (error) {
    console.error('Error updating item:', error);

    res.status(500).json({ message: 'Failed to update item.', error: error.message });
  }
};

// DELETE /items/:id - 특정 아이템 삭제
export const deleteItemById = async (req, res) => {
  const { id } = req.params;

  const userId = req.user.id; // 요청을 보낸 사용자 ID

  try {
    // 아이템 소유권 확인
    const [itemRows] = await pool.query('SELECT user_id FROM items WHERE id = ?', [id]);
    if (itemRows.length === 0) {
      return res.status(404).json({ message: 'Item not found.' });
    }
    if (itemRows[0].user_id !== userId) {
      return res.status(403).json({ message: 'Forbidden. You are not the owner of this item.' });
    }

    const [result] = await pool.query('DELETE FROM items WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      // 이 경우는 위에서 이미 404로 처리했으므로 실제로는 도달하기 어려울 수 있음
      return res.status(404).json({ message: 'Item not found.' });
    }
    res.status(200).json({ message: 'Item deleted successfully.' }); // 또는 204 No Content
  } catch (error) {
    console.error('Error deleting item:', error);

    res.status(500).json({ message: 'Failed to delete item.', error: error.message });
  }
};
