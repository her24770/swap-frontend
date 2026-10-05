

export interface ApiResult<T> {
    success: true
    message?: string
    data: T
}

export interface ApiError {
    success: false
    message: string
}