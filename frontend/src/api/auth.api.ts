import api from "./axios";

export const login = async (email: string, password: string) => {
  const res = await api.post("/auth/login", { email, password });
  return res.data;
};

export const register = async (email: string, password: string) => {
  return api.post("/auth/register", { email, password });
};
