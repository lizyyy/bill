const { db } = require('../models/db');
const { successResponse, errorResponse } = require('../utils/response');

const categoryController = {
    // 获取所有分类（包含子分类）
    getAllCategories: (req, res) => {
        const { type } = req.query;
        
        let sql = 'SELECT * FROM categories';
        const params = [];
        
        if (type) {
            sql += ' WHERE type = ?';
            params.push(type);
        }
        
        sql += ' ORDER BY type, name';

        db.all(sql, params, (err, categories) => {
            if (err) {
                return res.status(500).json(errorResponse(500, '获取分类失败', 'DB_ERROR'));
            }

            // 获取所有子分类
            db.all('SELECT * FROM subcategories ORDER BY name', [], (err, subcategories) => {
                if (err) {
                    return res.status(500).json(errorResponse(500, '获取子分类失败', 'DB_ERROR'));
                }

                // 组装层级结构
                const result = categories.map(cat => ({
                    ...cat,
                    subcategories: subcategories.filter(sub => sub.category_id === cat.id)
                }));

                res.json(successResponse(result));
            });
        });
    },

    // 获取单个分类
    getCategoryById: (req, res) => {
        const { id } = req.params;
        
        db.get('SELECT * FROM categories WHERE id = ?', [id], (err, category) => {
            if (err) {
                return res.status(500).json(errorResponse(500, '获取分类失败', 'DB_ERROR'));
            }
            
            if (!category) {
                return res.status(404).json(errorResponse(404, '分类不存在', 'NOT_FOUND'));
            }

            // 获取子分类
            db.all('SELECT * FROM subcategories WHERE category_id = ?', [id], (err, subcategories) => {
                if (err) {
                    return res.status(500).json(errorResponse(500, '获取子分类失败', 'DB_ERROR'));
                }
                
                res.json(successResponse({
                    ...category,
                    subcategories
                }));
            });
        });
    },

    // 创建分类
    createCategory: (req, res) => {
        const { name, type } = req.body;

        if (!name || !type) {
            return res.status(400).json(errorResponse(400, '缺少必要参数', 'PARAM_ERROR'));
        }

        const validTypes = ['expense', 'income', 'transfer', 'loan'];
        if (!validTypes.includes(type)) {
            return res.status(400).json(errorResponse(400, '无效的类型', 'INVALID_TYPE'));
        }

        db.run('INSERT INTO categories (name, type) VALUES (?, ?)', [name, type], function(err) {
            if (err) {
                return res.status(500).json(errorResponse(500, '创建分类失败', 'DB_ERROR'));
            }
            
            db.get('SELECT * FROM categories WHERE id = ?', [this.lastID], (err, row) => {
                if (err) {
                    return res.status(500).json(errorResponse(500, '获取新分类失败', 'DB_ERROR'));
                }
                res.status(201).json(successResponse({ ...row, subcategories: [] }, '创建成功'));
            });
        });
    },

    // 更新分类
    updateCategory: (req, res) => {
        const { id } = req.params;
        const { name, type } = req.body;

        if (!name) {
            return res.status(400).json(errorResponse(400, '缺少分类名称', 'PARAM_ERROR'));
        }

        let sql = 'UPDATE categories SET name = ?';
        const params = [name];

        if (type) {
            const validTypes = ['expense', 'income', 'transfer', 'loan'];
            if (!validTypes.includes(type)) {
                return res.status(400).json(errorResponse(400, '无效的类型', 'INVALID_TYPE'));
            }
            sql += ', type = ?';
            params.push(type);
        }

        sql += ' WHERE id = ?';
        params.push(id);

        db.run(sql, params, function(err) {
            if (err) {
                return res.status(500).json(errorResponse(500, '更新分类失败', 'DB_ERROR'));
            }
            
            if (this.changes === 0) {
                return res.status(404).json(errorResponse(404, '分类不存在', 'NOT_FOUND'));
            }

            db.get('SELECT * FROM categories WHERE id = ?', [id], (err, row) => {
                if (err) {
                    return res.status(500).json(errorResponse(500, '获取分类失败', 'DB_ERROR'));
                }
                res.json(successResponse(row, '更新成功'));
            });
        });
    },

    // 删除分类
    deleteCategory: (req, res) => {
        const { id } = req.params;
        
        // 先删除子分类
        db.run('DELETE FROM subcategories WHERE category_id = ?', [id], function(err) {
            if (err) {
                return res.status(500).json(errorResponse(500, '删除子分类失败', 'DB_ERROR'));
            }
            
            // 再删除分类
            db.run('DELETE FROM categories WHERE id = ?', [id], function(err) {
                if (err) {
                    return res.status(500).json(errorResponse(500, '删除分类失败', 'DB_ERROR'));
                }
                
                if (this.changes === 0) {
                    return res.status(404).json(errorResponse(404, '分类不存在', 'NOT_FOUND'));
                }
                
                res.json(successResponse(null, '删除成功'));
            });
        });
    },

    // 创建子分类
    createSubcategory: (req, res) => {
        const { category_id, name } = req.body;

        if (!category_id || !name) {
            return res.status(400).json(errorResponse(400, '缺少必要参数', 'PARAM_ERROR'));
        }

        // 检查父分类是否存在
        db.get('SELECT * FROM categories WHERE id = ?', [category_id], (err, category) => {
            if (err) {
                return res.status(500).json(errorResponse(500, '检查分类失败', 'DB_ERROR'));
            }
            
            if (!category) {
                return res.status(404).json(errorResponse(404, '父分类不存在', 'NOT_FOUND'));
            }

            db.run('INSERT INTO subcategories (category_id, name) VALUES (?, ?)', [category_id, name], function(err) {
                if (err) {
                    return res.status(500).json(errorResponse(500, '创建子分类失败', 'DB_ERROR'));
                }
                
                db.get('SELECT * FROM subcategories WHERE id = ?', [this.lastID], (err, row) => {
                    if (err) {
                        return res.status(500).json(errorResponse(500, '获取新子分类失败', 'DB_ERROR'));
                    }
                    res.status(201).json(successResponse(row, '创建成功'));
                });
            });
        });
    },

    // 更新子分类
    updateSubcategory: (req, res) => {
        const { id } = req.params;
        const { name } = req.body;

        if (!name) {
            return res.status(400).json(errorResponse(400, '缺少子分类名称', 'PARAM_ERROR'));
        }

        db.run('UPDATE subcategories SET name = ? WHERE id = ?', [name, id], function(err) {
            if (err) {
                return res.status(500).json(errorResponse(500, '更新子分类失败', 'DB_ERROR'));
            }
            
            if (this.changes === 0) {
                return res.status(404).json(errorResponse(404, '子分类不存在', 'NOT_FOUND'));
            }

            db.get('SELECT * FROM subcategories WHERE id = ?', [id], (err, row) => {
                if (err) {
                    return res.status(500).json(errorResponse(500, '获取子分类失败', 'DB_ERROR'));
                }
                res.json(successResponse(row, '更新成功'));
            });
        });
    },

    // 删除子分类
    deleteSubcategory: (req, res) => {
        const { id } = req.params;
        
        db.run('DELETE FROM subcategories WHERE id = ?', [id], function(err) {
            if (err) {
                return res.status(500).json(errorResponse(500, '删除子分类失败', 'DB_ERROR'));
            }
            
            if (this.changes === 0) {
                return res.status(404).json(errorResponse(404, '子分类不存在', 'NOT_FOUND'));
            }
            
            res.json(successResponse(null, '删除成功'));
        });
    }
};

module.exports = categoryController;
