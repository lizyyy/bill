from flask import jsonify
from enum import Enum

class ErrorCode(Enum):
    SUCCESS = 0
    INVALID_PARAMS = 1001
    RECORD_NOT_FOUND = 1002
    CATEGORY_NOT_FOUND = 1003
    INVALID_RECORD_TYPE = 1004
    DATABASE_ERROR = 2001
    UNKNOWN_ERROR = 9999

ERROR_MESSAGES = {
    ErrorCode.SUCCESS: 'Success',
    ErrorCode.INVALID_PARAMS: 'Invalid parameters',
    ErrorCode.RECORD_NOT_FOUND: 'Record not found',
    ErrorCode.CATEGORY_NOT_FOUND: 'Category not found',
    ErrorCode.INVALID_RECORD_TYPE: 'Invalid record type',
    ErrorCode.DATABASE_ERROR: 'Database error',
    ErrorCode.UNKNOWN_ERROR: 'Unknown error',
}

class Response:
    @staticmethod
    def success(data=None, message='Success'):
        return jsonify({
            'errno': ErrorCode.SUCCESS.value,
            'errmsg': message,
            'errorcode': ErrorCode.SUCCESS.name,
            'data': data
        })
    
    @staticmethod
    def error(error_code: ErrorCode, custom_message=None):
        message = custom_message or ERROR_MESSAGES.get(error_code, 'Unknown error')
        return jsonify({
            'errno': error_code.value,
            'errmsg': message,
            'errorcode': error_code.name,
            'data': None
        })
    
    @staticmethod
    def error_with_data(error_code: ErrorCode, data=None, custom_message=None):
        message = custom_message or ERROR_MESSAGES.get(error_code, 'Unknown error')
        return jsonify({
            'errno': error_code.value,
            'errmsg': message,
            'errorcode': error_code.name,
            'data': data
        })
