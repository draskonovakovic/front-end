import api from "./interceptor";

export const getUserById = async (id: number) => {
  try {
      const response = await api.get("/users/" + id);
      if (!response || !response.data) {
          throw new Error("Unexpected response: Response or data is undefined.");
      }
      return response.data.data;
  } catch (error: any) {
      throw new Error(error.message || "An error occurred while getting user.");
  }
};

export const getAllUsers = async () => {
    try {
        const response = await api.get("/users");
        if (!response || !response.data) {
            throw new Error("Unexpected response: Response or data is undefined.");
        }
        return response.data.data
    } catch (error: any) {
        throw new Error(error.message || "An error occured while getting users")
    }
};