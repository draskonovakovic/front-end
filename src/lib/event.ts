import api from "./interceptor";

export const createEvent = async (data: { title: string; description: string; date_time: Date; location: string }) => {
    try {
      const response = await api.post("/events/", data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "An error occurred while creating event.");
    }
};

export const getAllEvents = async () => {
    try {
      const response = await api.get("/events/");
      console.log(response.data); 
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "An error occurred while getting events.");
    }
};