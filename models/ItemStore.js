import { Model } from 'objection';
import Item from './Item.js';

class ItemStore extends Model {
  static get tableName() {
    return 'item_stores';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['item_id', 'store_name', 'price'],

      properties: {
        id: { type: 'integer' },
        item_id: { type: 'integer' },
        store_name: { type: 'string', minLength: 1, maxLength: 255 },
        price: { type: 'number' },
        stock: { type: 'integer', default: 0 },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' },
      },
    };
  }

  static get relationMappings() {
    return {
      item: {
        relation: Model.BelongsToOneRelation,
        modelClass: Item,
        join: {
          from: 'item_stores.item_id',
          to: 'items.id',
        },
      },
    };
  }

  async $beforeInsert() {
    await super.$beforeInsert();
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    this.created_at = now;
    this.updated_at = now;
  }

  async $beforeUpdate() {
    await super.$beforeUpdate();
    this.updated_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
  }
}

export default ItemStore;
