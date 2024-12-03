import api from "./interceptor";

export const getUserById = async (id: number) => {
    try {
      const response = await api.get("/users/" + id);
      console.log(response.data); 
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "An error occurred while getting user.");
    }
  };