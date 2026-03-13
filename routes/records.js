const express = require('express');
const router = express.Router();
const recordController = require('../controllers/recordController');

// 获取所有记账记录（支持筛选）
router.get('/', recordController.getAllRecords);

// 获取统计信息
router.get('/statistics', recordController.getStatistics);

// 获取单个记账记录
router.get('/:id', recordController.getRecordById);

// 创建记账记录
router.post('/', recordController.createRecord);

// 更新记账记录
router.put('/:id', recordController.updateRecord);

// 删除记账记录
router.delete('/:id', recordController.deleteRecord);

module.exports = router;
