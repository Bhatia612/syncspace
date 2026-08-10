class AppError extends Error {
    constructor(message: string, public statusCode: number, public code: string) {
        super(message)
    }
}

export default AppError