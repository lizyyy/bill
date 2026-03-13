import sqlite3
import os
import config

class Database:
    def __init__(self):
        self.db_path = config.DATABASE_PATH
        self._init_db()
    
    def _get_connection(self):
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn
    
    def _init_db(self):
        conn = self._get_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS categories (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                parent_id INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (parent_id) REFERENCES categories(id)
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS records (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                category_id INTEGER NOT NULL,
                type TEXT NOT NULL CHECK(type IN ('expense', 'income', 'transfer', 'loan')),
                amount REAL NOT NULL,
                note TEXT,
                record_time TIMESTAMP NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (category_id) REFERENCES categories(id)
            )
        ''')
        
        cursor.execute("SELECT COUNT(*) FROM categories")
        if cursor.fetchone()[0] == 0:
            default_categories = [
                ('餐饮', None),
                ('交通', None),
                ('购物', None),
                ('娱乐', None),
                ('工资', None),
                ('理财', None),
                ('早餐', 1),
                ('午餐', 1),
                ('晚餐', 1),
                ('公交', 2),
                ('地铁', 2),
                ('打车', 2),
                ('日用品', 3),
                ('服装', 3),
                ('电子产品', 3),
                ('电影', 4),
                ('游戏', 4),
                ('旅游', 4),
            ]
            for name, parent_id in default_categories:
                cursor.execute(
                    "INSERT INTO categories (name, parent_id) VALUES (?, ?)",
                    (name, parent_id)
                )
        
        conn.commit()
        conn.close()
    
    def execute(self, query, params=()):
        conn = self._get_connection()
        cursor = conn.cursor()
        cursor.execute(query, params)
        conn.commit()
        last_id = cursor.lastrowid
        conn.close()
        return last_id
    
    def fetchone(self, query, params=()):
        conn = self._get_connection()
        cursor = conn.cursor()
        cursor.execute(query, params)
        result = cursor.fetchone()
        conn.close()
        return result
    
    def fetchall(self, query, params=()):
        conn = self._get_connection()
        cursor = conn.cursor()
        cursor.execute(query, params)
        results = cursor.fetchall()
        conn.close()
        return results

db = Database()
