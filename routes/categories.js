const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

// 获取所有分类
router.get('/', categoryController.getAllCategories);

// 获取单个分类
router.get('/:id', categoryController.getCategoryById);

// 创建分类
router.post('/', categoryController.createCategory);

// 更新分类
router.put('/:id', categoryController.updateCategory);

// 删除分类
router.delete('/:id', categoryController.deleteCategory);

// 创建子分类
router.post('/subcategories', categoryController.createSubcategory);

// 更新子分类
router.put('/subcategories/:id', categoryController.updateSubcategory);

// 删除子分类
router.delete('/subcategories/:id', categoryController.deleteSubcategory);

module.exports = router;
