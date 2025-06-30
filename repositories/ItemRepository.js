import { Item, ItemStore } from '../models/Item.js';
import sequelize from '../config/database.js';

class ItemRepository {
  async findAll() {
    return await Item.findAll({ include: ['stores'] });
  }

  async findById(id) {
    return await Item.findByPk(id, { include: ['stores'] });
  }

  async create(itemData) {
    return await Item.create(itemData, { include: ['stores'] });
  }

  async update(id, itemData) {
    const item = await Item.findByPk(id);
    if (item) {
      return await item.update(itemData);
    }
    return null;
  }

  async delete(id) {
    const item = await Item.findByPk(id);
    if (item) {
      await item.destroy();
      return true;
    }
    return false;
  }

  async findByUserIdAndItemId(userId, itemId) {
    return await Item.findOne({
      where: {
        id: itemId,
        user_id: userId
      }
    });
  }

  async findItemsWithStoreInfo() {
    return await Item.findAll({
      include: [{
        model: ItemStore,
        as: 'stores'
      }]
    });
  }

  async findItemsWithStoreInfoCustomSQL() {
    const [results, metadata] = await sequelize.query(`
      SELECT
          Item.id AS itemId,
          Item.name AS itemName,
          Item.description AS itemDescription,
          Item.created_at AS itemCreatedAt,
          Item.updated_at AS itemUpdatedAt,
          ItemStore.id AS storeId,
          ItemStore.store_name AS storeName,
          ItemStore.price AS price,
          ItemStore.stock AS stock,
          ItemStore.created_at AS storeCreatedAt,
          ItemStore.updated_at AS storeUpdatedAt
      FROM
          items AS Item
      LEFT JOIN
          item_stores AS ItemStore ON Item.id = ItemStore.item_id
    `);
    return results;
  }
}

export default new ItemRepository();