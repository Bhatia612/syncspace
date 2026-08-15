import { apiRequest } from "../../api/client"

export interface User {
  id: string
  name: string
  email: string
}

interface SignupInput {
  name: string
  email: string
  password: string
}

interface LoginInput {
  email: string
  password: string
}

export const signup = (input: SignupInput) =>
  apiRequest<{ user: User }>("/auth/signup", { method: "POST", body: input })

export const login = (input: LoginInput) =>
  apiRequest<{ user: User }>("/auth/login", { method: "POST", body: input })

export const logout = () =>
  apiRequest<{ message: string }>("/auth/logout", { method: "POST" })

export const getMe = () => apiRequest<{ user: User }>("/auth/me")