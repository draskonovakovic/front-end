import api from "./interceptor";

export const getUserById = async (id: number) => {
  try {
      const response = await api.get("/users/" + id);
      if (!response || !response.data) {
          throw new Error("Unexpected response: Response or data is undefined.");
      }
      return response.data.data;
  } catch (error: any) {
      throw new Error(error.response?.data?.message || "An error occurred while getting user.");
  }
};