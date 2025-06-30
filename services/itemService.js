import ItemRepository from '../repositories/ItemRepository.js';
import logger from '../config/logger.js';
import { AppError } from '../utils/AppError.js';

const itemRepository = ItemRepository;

export const createNewItem = async (name, description, userId) => {
  try {
    const newItem = await itemRepository.create({ name, description, user_id: userId });
    if (!newItem) {
      throw new AppError('Failed to create item, repository returned nullish.', 500, 'ITEM_CREATION_REPO_NULL');
    }
    return newItem;
  } catch (error) {
    logger.error('Service Error creating item:', error.message);
    if (error instanceof AppError) throw error;
    throw new AppError(error.message || 'Failed to create item in database.', 500, 'DB_ERROR_CREATE');
  }
};

export const findAllItems = async () => {
  try {
    const items = await itemRepository.findAll();
    return items;
  } catch (error) {
    logger.error('Service Error fetching all items:', error.message);
    if (error instanceof AppError) throw error;
    throw new AppError(error.message || 'Failed to fetch items from database.', 500, 'DB_ERROR_FETCH_ALL');
  }
};

export const findItemById = async (itemId) => {
  try {
    const item = await itemRepository.findById(itemId);
    if (!item) {
      throw new AppError('Item not found.', 404, 'ITEM_NOT_FOUND');
    }
    return item;
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error('Service Error fetching item by ID:', error.message);
    throw new AppError(error.message || 'Failed to fetch item by ID from database.', 500, 'DB_ERROR_FETCH_ONE');
  }
};

export const updateExistingItem = async (itemId, currentUserId, updateData) => {
  const { name, description } = updateData;
  try {
    const itemExists = await itemRepository.findByUserIdAndItemId(currentUserId, itemId);
    if (!itemExists) {
      const item = await itemRepository.findById(itemId);
      if (!item) {
        throw new AppError('Item not found.', 404, 'ITEM_NOT_FOUND_FOR_UPDATE');
      }
      throw new AppError('Forbidden. You are not the owner of this item.', 403, 'FORBIDDEN_ACCESS_UPDATE');
    }
    if (name === undefined && description === undefined) {
      return itemExists;
    }
    const updatedItem = await itemRepository.update(itemId, { name, description });
    if (!updatedItem) {
      throw new AppError('Item not found or failed to update.', 404, 'ITEM_NOT_FOUND_OR_FAILED_TO_UPDATE');
    }
    return updatedItem;
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error('Service Error updating item:', error.message);
    throw new AppError(error.message || 'Failed to update item in database.', 500, 'DB_ERROR_UPDATE');
  }
};

export const deleteExistingItem = async (itemId, currentUserId) => {
  try {
    const item = await itemRepository.findByUserIdAndItemId(currentUserId, itemId);
    if (!item) {
      const itemExistsOnlyById = await itemRepository.findById(itemId);
      if (!itemExistsOnlyById) {
        throw new AppError('Item not found.', 404, 'ITEM_NOT_FOUND_FOR_DELETE');
      }
      throw new AppError('Forbidden. You are not the owner of this item.', 403, 'FORBIDDEN_ACCESS_DELETE');
    }
    const success = await itemRepository.delete(itemId);
    if (!success) {
      throw new AppError('Failed to delete item, or item not found during delete attempt.', 404, 'ITEM_DELETE_FAILED_OR_NOT_FOUND');
    }
    return { message: 'Item deleted successfully.' };
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error('Service Error deleting item:', error.message);
    throw new AppError(error.message || 'Failed to delete item from database.', 500, 'DB_ERROR_DELETE');
  }
};

export const findAllItemsWithStoreDetails = async () => {
  try {
    const itemsWithStores = await itemRepository.findItemsWithStoreInfo();
    return itemsWithStores;
  } catch (error) {
    logger.error('Service Error fetching items with store details:', error.message);
    if (error instanceof AppError) throw error;
    throw new AppError(error.message || 'Failed to fetch items with store details from database.', 500, 'DB_ERROR_FETCH_ALL_WITH_STORES');
  }
};

export const findAllItemsWithStoreDetailsCustomSQL = async () => {
  try {
    const itemsWithStores = await itemRepository.findItemsWithStoreInfoCustomSQL();
    return itemsWithStores;
  } catch (error) {
    logger.error('Service Error fetching items with store details via custom SQL:', error.message);
    if (error instanceof AppError) throw error;
    throw new AppError(error.message || 'Failed to fetch items with store details from database using custom SQL.', 500, 'DB_ERROR_FETCH_ALL_WITH_STORES_CUSTOM_SQL');
  }
};

export const getPaginatedItems = async (page, limit) => {
  try {
    const result = await itemRepository.findPaginatedItems(page, limit);
    return result;
  } catch (error) {
    logger.error('Service Error fetching paginated items:', error.message);
    if (error instanceof AppError) throw error;
    throw new AppError(error.message || 'Failed to fetch paginated items from database.', 500, 'DB_ERROR_PAGINATED_FETCH');
  }
};

export const getPaginatedItemsCustomSQL = async (page, limit) => {
  try {
    const result = await itemRepository.findPaginatedItemsCustomSQL(page, limit);
    return result;
  } catch (error) {
    logger.error('Service Error fetching paginated items via custom SQL:', error.message);
    if (error instanceof AppError) throw error;
    throw new AppError(error.message || 'Failed to fetch paginated items from database using custom SQL.', 500, 'DB_ERROR_PAGINATED_FETCH_CUSTOM_SQL');
  }
};
