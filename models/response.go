package models

type Response struct {
	Errno     int         `json:"errno"`
	Errmsg    string      `json:"errmsg"`
	ErrorCode string      `json:"error_code"`
	Data      interface{} `json:"data,omitempty"`
}

func Success(data interface{}) Response {
	return Response{
		Errno:     0,
		Errmsg:    "success",
		ErrorCode: "",
		Data:      data,
	}
}

func Error(errno int, errmsg, errorCode string) Response {
	return Response{
		Errno:     errno,
		Errmsg:    errmsg,
		ErrorCode: errorCode,
	}
}
