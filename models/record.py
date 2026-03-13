from .database import db
from datetime import datetime

class Category:
    @staticmethod
    def get_all():
        rows = db.fetchall("SELECT id, name, parent_id FROM categories ORDER BY parent_id, id")
        categories = []
        for row in rows:
            categories.append({
                'id': row['id'],
                'name': row['name'],
                'parent_id': row['parent_id']
            })
        return categories
    
    @staticmethod
    def get_tree():
        rows = db.fetchall("SELECT id, name, parent_id FROM categories ORDER BY parent_id, id")
        category_map = {}
        tree = []
        
        for row in rows:
            cat = {
                'id': row['id'],
                'name': row['name'],
                'children': []
            }
            category_map[row['id']] = cat
            
            if row['parent_id'] is None:
                tree.append(cat)
        
        for row in rows:
            if row['parent_id'] is not None:
                parent = category_map.get(row['parent_id'])
                if parent:
                    parent['children'].append(category_map[row['id']])
        
        return tree

class Record:
    RECORD_TYPES = ['expense', 'income', 'transfer', 'loan']
    
    @staticmethod
    def create(category_id, record_type, amount, note, record_time):
        if record_type not in Record.RECORD_TYPES:
            raise ValueError(f"Invalid record type: {record_type}")
        
        record_id = db.execute(
            "INSERT INTO records (category_id, type, amount, note, record_time) VALUES (?, ?, ?, ?, ?)",
            (category_id, record_type, amount, note, record_time)
        )
        return record_id
    
    @staticmethod
    def get_by_id(record_id):
        row = db.fetchone(
            """
            SELECT r.id, r.category_id, c.name as category_name, r.type, r.amount, r.note, r.record_time, r.created_at
            FROM records r
            LEFT JOIN categories c ON r.category_id = c.id
            WHERE r.id = ?
            """,
            (record_id,)
        )
        if row:
            return {
                'id': row['id'],
                'category_id': row['category_id'],
                'category_name': row['category_name'],
                'type': row['type'],
                'amount': row['amount'],
                'note': row['note'],
                'record_time': row['record_time'],
                'created_at': row['created_at']
            }
        return None
    
    @staticmethod
    def get_all(filters=None):
        query = """
            SELECT r.id, r.category_id, c.name as category_name, r.type, r.amount, r.note, r.record_time, r.created_at
            FROM records r
            LEFT JOIN categories c ON r.category_id = c.id
            WHERE 1=1
        """
        params = []
        
        if filters:
            if filters.get('type'):
                query += " AND r.type = ?"
                params.append(filters['type'])
            
            if filters.get('start_time'):
                query += " AND r.record_time >= ?"
                params.append(filters['start_time'])
            
            if filters.get('end_time'):
                query += " AND r.record_time <= ?"
                params.append(filters['end_time'])
            
            if filters.get('keyword'):
                query += " AND (r.note LIKE ? OR c.name LIKE ?)"
                keyword = f"%{filters['keyword']}%"
                params.extend([keyword, keyword])
        
        query += " ORDER BY r.record_time DESC"
        
        rows = db.fetchall(query, params)
        records = []
        for row in rows:
            records.append({
                'id': row['id'],
                'category_id': row['category_id'],
                'category_name': row['category_name'],
                'type': row['type'],
                'amount': row['amount'],
                'note': row['note'],
                'record_time': row['record_time'],
                'created_at': row['created_at']
            })
        return records
    
    @staticmethod
    def update(record_id, category_id=None, record_type=None, amount=None, note=None, record_time=None):
        updates = []
        params = []
        
        if category_id is not None:
            updates.append("category_id = ?")
            params.append(category_id)
        
        if record_type is not None:
            if record_type not in Record.RECORD_TYPES:
                raise ValueError(f"Invalid record type: {record_type}")
            updates.append("type = ?")
            params.append(record_type)
        
        if amount is not None:
            updates.append("amount = ?")
            params.append(amount)
        
        if note is not None:
            updates.append("note = ?")
            params.append(note)
        
        if record_time is not None:
            updates.append("record_time = ?")
            params.append(record_time)
        
        if updates:
            params.append(record_id)
            db.execute(
                f"UPDATE records SET {', '.join(updates)} WHERE id = ?",
                params
            )
    
    @staticmethod
    def delete(record_id):
        db.execute("DELETE FROM records WHERE id = ?", (record_id,))
