export interface ApiError {
    message: string
    code: string
}

export class ApiRequestError extends Error {
    code: string
    status: number

    constructor(message: string, code: string, status: number) {
        super(message)
        this.code = code
        this.status = status
    }
}

const BASE = "/api/v1"

interface RequestOptions {
    method?: "GET" | "POST" | "PATCH" | "DELETE"
    body?: unknown
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const { method = "GET", body } = options

    const res = await fetch(`${BASE}${path}`, {
        method,
        credentials: "include",
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
    })

    if (res.status === 204) {
        return undefined as T
    }

    const data = await res.json().catch(() => null)

    if (!res.ok) {
        const err = (data?.error ?? {}) as Partial<ApiError>
        throw new ApiRequestError(
            err.message ?? "Something went wrong",
            err.code ?? "UNKNOWN",
            res.status
        )
    }

    return data as T
}