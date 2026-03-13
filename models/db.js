const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../data/accounting.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('数据库连接失败:', err);
    } else {
        console.log('数据库连接成功');
    }
});

function initDatabase() {
    db.serialize(() => {
        // 创建一级分类表
        db.run(`CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            type TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // 创建二级分类表
        db.run(`CREATE TABLE IF NOT EXISTS subcategories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            category_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (category_id) REFERENCES categories(id)
        )`);

        // 创建记账记录表
        db.run(`CREATE TABLE IF NOT EXISTS records (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type TEXT NOT NULL,
            category_id INTEGER NOT NULL,
            subcategory_id INTEGER,
            amount REAL NOT NULL,
            date TEXT NOT NULL,
            note TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (category_id) REFERENCES categories(id),
            FOREIGN KEY (subcategory_id) REFERENCES subcategories(id)
        )`);

        // 初始化默认分类数据
        initDefaultData();
    });
}

function initDefaultData() {
    // 检查是否已有数据
    db.get('SELECT COUNT(*) as count FROM categories', (err, row) => {
        if (err) {
            console.error('检查分类数据失败:', err);
            return;
        }
        
        if (row.count === 0) {
            // 插入默认支出分类
            const expenseCategories = [
                { name: '餐饮', type: 'expense' },
                { name: '交通', type: 'expense' },
                { name: '购物', type: 'expense' },
                { name: '娱乐', type: 'expense' },
                { name: '医疗', type: 'expense' },
                { name: '教育', type: 'expense' },
                { name: '住房', type: 'expense' },
                { name: '其他支出', type: 'expense' }
            ];

            // 插入默认收入分类
            const incomeCategories = [
                { name: '工资', type: 'income' },
                { name: '奖金', type: 'income' },
                { name: '投资', type: 'income' },
                { name: '兼职', type: 'income' },
                { name: '其他收入', type: 'income' }
            ];

            // 插入默认转账分类
            const transferCategories = [
                { name: '银行卡转账', type: 'transfer' },
                { name: '支付宝转账', type: 'transfer' },
                { name: '微信转账', type: 'transfer' }
            ];

            // 插入默认贷款分类
            const loanCategories = [
                { name: '借款', type: 'loan' },
                { name: '还款', type: 'loan' }
            ];

            const allCategories = [...expenseCategories, ...incomeCategories, ...transferCategories, ...loanCategories];
            
            const stmt = db.prepare('INSERT INTO categories (name, type) VALUES (?, ?)');
            allCategories.forEach(cat => {
                stmt.run(cat.name, cat.type);
            });
            stmt.finalize();

            console.log('默认分类数据已初始化');
        }
    });
}

module.exports = {
    db,
    initDatabase
};
