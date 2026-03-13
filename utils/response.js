function successResponse(data = null, message = 'success') {
    return {
        Errno: 0,
        Errmsg: message,
        ErrorCode: 'OK',
        data: data
    };
}

function errorResponse(errno, errmsg, errorCode) {
    return {
        Errno: errno,
        Errmsg: errmsg,
        ErrorCode: errorCode
    };
}

module.exports = {
    successResponse,
    errorResponse
};
