const { db } = require('../models/db');
const { successResponse, errorResponse } = require('../utils/response');

const recordController = {
    // 获取所有记账记录
    getAllRecords: (req, res) => {
        const { type, startDate, endDate, categoryId, keyword } = req.query;
        
        let sql = `
            SELECT r.*, c.name as category_name, c.type as category_type, s.name as subcategory_name
            FROM records r
            LEFT JOIN categories c ON r.category_id = c.id
            LEFT JOIN subcategories s ON r.subcategory_id = s.id
            WHERE 1=1
        `;
        const params = [];

        if (type) {
            sql += ' AND r.type = ?';
            params.push(type);
        }

        if (startDate) {
            sql += ' AND r.date >= ?';
            params.push(startDate);
        }

        if (endDate) {
            sql += ' AND r.date <= ?';
            params.push(endDate);
        }

        if (categoryId) {
            sql += ' AND r.category_id = ?';
            params.push(categoryId);
        }

        if (keyword) {
            sql += ' AND (r.note LIKE ? OR c.name LIKE ?)';
            params.push(`%${keyword}%`, `%${keyword}%`);
        }

        sql += ' ORDER BY r.date DESC, r.created_at DESC';

        db.all(sql, params, (err, rows) => {
            if (err) {
                return res.status(500).json(errorResponse(500, '获取记录失败', 'DB_ERROR'));
            }
            res.json(successResponse(rows));
        });
    },

    // 获取单个记账记录
    getRecordById: (req, res) => {
        const { id } = req.params;
        const sql = `
            SELECT r.*, c.name as category_name, c.type as category_type, s.name as subcategory_name
            FROM records r
            LEFT JOIN categories c ON r.category_id = c.id
            LEFT JOIN subcategories s ON r.subcategory_id = s.id
            WHERE r.id = ?
        `;
        
        db.get(sql, [id], (err, row) => {
            if (err) {
                return res.status(500).json(errorResponse(500, '获取记录失败', 'DB_ERROR'));
            }
            if (!row) {
                return res.status(404).json(errorResponse(404, '记录不存在', 'NOT_FOUND'));
            }
            res.json(successResponse(row));
        });
    },

    // 创建记账记录
    createRecord: (req, res) => {
        const { type, category_id, subcategory_id, amount, date, note } = req.body;

        if (!type || !category_id || !amount || !date) {
            return res.status(400).json(errorResponse(400, '缺少必要参数', 'PARAM_ERROR'));
        }

        const validTypes = ['expense', 'income', 'transfer', 'loan'];
        if (!validTypes.includes(type)) {
            return res.status(400).json(errorResponse(400, '无效的类型', 'INVALID_TYPE'));
        }

        const sql = `INSERT INTO records (type, category_id, subcategory_id, amount, date, note) 
                     VALUES (?, ?, ?, ?, ?, ?)`;
        
        db.run(sql, [type, category_id, subcategory_id || null, amount, date, note || ''], function(err) {
            if (err) {
                return res.status(500).json(errorResponse(500, '创建记录失败', 'DB_ERROR'));
            }
            
            db.get('SELECT * FROM records WHERE id = ?', [this.lastID], (err, row) => {
                if (err) {
                    return res.status(500).json(errorResponse(500, '获取新记录失败', 'DB_ERROR'));
                }
                res.status(201).json(successResponse(row, '创建成功'));
            });
        });
    },

    // 更新记账记录
    updateRecord: (req, res) => {
        const { id } = req.params;
        const { type, category_id, subcategory_id, amount, date, note } = req.body;

        if (!type || !category_id || !amount || !date) {
            return res.status(400).json(errorResponse(400, '缺少必要参数', 'PARAM_ERROR'));
        }

        const sql = `UPDATE records 
                     SET type = ?, category_id = ?, subcategory_id = ?, amount = ?, date = ?, note = ?
                     WHERE id = ?`;
        
        db.run(sql, [type, category_id, subcategory_id || null, amount, date, note || '', id], function(err) {
            if (err) {
                return res.status(500).json(errorResponse(500, '更新记录失败', 'DB_ERROR'));
            }
            
            if (this.changes === 0) {
                return res.status(404).json(errorResponse(404, '记录不存在', 'NOT_FOUND'));
            }

            db.get('SELECT * FROM records WHERE id = ?', [id], (err, row) => {
                if (err) {
                    return res.status(500).json(errorResponse(500, '获取记录失败', 'DB_ERROR'));
                }
                res.json(successResponse(row, '更新成功'));
            });
        });
    },

    // 删除记账记录
    deleteRecord: (req, res) => {
        const { id } = req.params;
        
        db.run('DELETE FROM records WHERE id = ?', [id], function(err) {
            if (err) {
                return res.status(500).json(errorResponse(500, '删除记录失败', 'DB_ERROR'));
            }
            
            if (this.changes === 0) {
                return res.status(404).json(errorResponse(404, '记录不存在', 'NOT_FOUND'));
            }
            
            res.json(successResponse(null, '删除成功'));
        });
    },

    // 获取统计信息
    getStatistics: (req, res) => {
        const { startDate, endDate } = req.query;
        
        let sql = `
            SELECT 
                type,
                SUM(amount) as total,
                COUNT(*) as count
            FROM records
            WHERE 1=1
        `;
        const params = [];

        if (startDate) {
            sql += ' AND date >= ?';
            params.push(startDate);
        }

        if (endDate) {
            sql += ' AND date <= ?';
            params.push(endDate);
        }

        sql += ' GROUP BY type';

        db.all(sql, params, (err, rows) => {
            if (err) {
                return res.status(500).json(errorResponse(500, '获取统计失败', 'DB_ERROR'));
            }
            
            const stats = {
                expense: 0,
                income: 0,
                transfer: 0,
                loan: 0
            };
            
            rows.forEach(row => {
                stats[row.type] = row.total;
            });
            
            res.json(successResponse(stats));
        });
    }
};

module.exports = recordController;
