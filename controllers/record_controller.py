from flask import Blueprint, request
from models import Record, Category
from views import Response, ErrorCode

record_bp = Blueprint('record', __name__)

@record_bp.route('/api/records', methods=['GET'])
def get_records():
    filters = {
        'type': request.args.get('type'),
        'start_time': request.args.get('start_time'),
        'end_time': request.args.get('end_time'),
        'keyword': request.args.get('keyword')
    }
    filters = {k: v for k, v in filters.items() if v}
    
    records = Record.get_all(filters)
    return Response.success(records)

@record_bp.route('/api/records', methods=['POST'])
def create_record():
    data = request.get_json()
    
    if not data:
        return Response.error(ErrorCode.INVALID_PARAMS, 'Request body is required')
    
    category_id = data.get('category_id')
    record_type = data.get('type')
    amount = data.get('amount')
    note = data.get('note', '')
    record_time = data.get('record_time')
    
    if not all([category_id, record_type, amount, record_time]):
        return Response.error(ErrorCode.INVALID_PARAMS, 'category_id, type, amount and record_time are required')
    
    try:
        amount = float(amount)
        if amount <= 0:
            return Response.error(ErrorCode.INVALID_PARAMS, 'Amount must be positive')
    except (ValueError, TypeError):
        return Response.error(ErrorCode.INVALID_PARAMS, 'Invalid amount')
    
    if record_type not in Record.RECORD_TYPES:
        return Response.error(ErrorCode.INVALID_RECORD_TYPE)
    
    try:
        record_id = Record.create(category_id, record_type, amount, note, record_time)
        record = Record.get_by_id(record_id)
        return Response.success(record, 'Record created successfully')
    except Exception as e:
        return Response.error(ErrorCode.DATABASE_ERROR, str(e))

@record_bp.route('/api/records/<int:record_id>', methods=['PUT'])
def update_record(record_id):
    record = Record.get_by_id(record_id)
    if not record:
        return Response.error(ErrorCode.RECORD_NOT_FOUND)
    
    data = request.get_json()
    if not data:
        return Response.error(ErrorCode.INVALID_PARAMS, 'Request body is required')
    
    try:
        Record.update(
            record_id,
            category_id=data.get('category_id'),
            record_type=data.get('type'),
            amount=float(data.get('amount')) if data.get('amount') else None,
            note=data.get('note'),
            record_time=data.get('record_time')
        )
        updated_record = Record.get_by_id(record_id)
        return Response.success(updated_record, 'Record updated successfully')
    except ValueError as e:
        return Response.error(ErrorCode.INVALID_RECORD_TYPE, str(e))
    except Exception as e:
        return Response.error(ErrorCode.DATABASE_ERROR, str(e))

@record_bp.route('/api/records/<int:record_id>', methods=['DELETE'])
def delete_record(record_id):
    record = Record.get_by_id(record_id)
    if not record:
        return Response.error(ErrorCode.RECORD_NOT_FOUND)
    
    try:
        Record.delete(record_id)
        return Response.success(message='Record deleted successfully')
    except Exception as e:
        return Response.error(ErrorCode.DATABASE_ERROR, str(e))

@record_bp.route('/api/categories', methods=['GET'])
def get_categories():
    tree = Category.get_tree()
    return Response.success(tree)

@record_bp.route('/api/categories/all', methods=['GET'])
def get_all_categories():
    categories = Category.get_all()
    return Response.success(categories)
