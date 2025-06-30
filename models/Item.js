import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class Item extends Model {}

Item.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    user_id: {
      type: DataTypes.INTEGER,
    },
  },
  {
    sequelize,
    modelName: 'Item',
    tableName: 'items',
    timestamps: true, // createdAt, updatedAt 자동 생성
    underscored: true, // snake_case 사용
  }
);

class ItemStore extends Model {}

ItemStore.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    item_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Item,
        key: 'id',
      },
    },
    store_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    stock: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    modelName: 'ItemStore',
    tableName: 'item_stores',
    timestamps: true,
    underscored: true,
  }
);

// 관계 설정
Item.hasMany(ItemStore, { foreignKey: 'item_id', as: 'stores' });
ItemStore.belongsTo(Item, { foreignKey: 'item_id', as: 'item' });

export { Item, ItemStore };