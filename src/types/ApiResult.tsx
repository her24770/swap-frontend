type ApiResult<T> =
    | { success: true; data: T }
    | { success: false; message: string };