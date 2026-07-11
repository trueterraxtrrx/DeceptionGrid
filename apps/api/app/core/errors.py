from fastapi import HTTPException, status


class AppError(HTTPException):
    def __init__(self, code: str, message: str, status_code: int = 400):
        super().__init__(status_code=status_code, detail={"error": {"code": code, "message": message}})


class NotFoundError(AppError):
    def __init__(self, resource: str):
        super().__init__("NOT_FOUND", f"{resource} not found", status.HTTP_404_NOT_FOUND)


class UnauthorizedError(AppError):
    def __init__(self, message: str = "Unauthorized"):
        super().__init__("UNAUTHORIZED", message, status.HTTP_401_UNAUTHORIZED)


class ForbiddenError(AppError):
    def __init__(self, message: str = "Forbidden"):
        super().__init__("FORBIDDEN", message, status.HTTP_403_FORBIDDEN)


class ConflictError(AppError):
    def __init__(self, message: str):
        super().__init__("CONFLICT", message, status.HTTP_409_CONFLICT)
# Project version: DeceptionGrid V1.5
