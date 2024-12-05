import api from "./interceptor";

export const createEvent = async (data: { title: string; description: string; date_time: Date; location: string; type: string }) => {
    try {
        const response = await api.post("/events/", data);
        if (!response || !response.data) {
            throw new Error("Unexpected response: Response or data is undefined.");
        }
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "An error occurred while creating event.");
    }
};

export const getAllEvents = async () => {
    try {
        const response = await api.get("/events/");
        if (!response || !response.data) {
            throw new Error("Unexpected response: Response or data is undefined.");
        }
        return response.data.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "An error occurred while getting events.");
    }
};

export const getEventById = async (id: number) => {
    try {
        const response = await api.get(`/events/${id}`);
        if (!response || !response.data) {
            throw new Error("Unexpected response: Response or data is undefined.");
        }
        return response.data.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "An error occurred while getting event.");
    }
};

export const updateEvent = async (id: number, data: { title: string; description: string; date_time: Date; location: string, type: string }) => {
  try {
    const response = await api.put(`/events/${id}`, data);
    if (!response || !response.data) {
      throw new Error("Unexpected response: Response or data is undefined.");
    }
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "An error occurred while updating event.");
  }
};

export const cancelEvent = async (id: number) => {
  try {
    const response = await api.put(`/events/cancel/${id}`);
    if (!response || !response.data) {
      throw new Error("Unexpected response: Response or data is undefined.");
    }
    return response.data.data;
  } catch (error: any){
    throw new Error(error.response?.data?.message || "An error occurred while canceling event.");   
  }
}

export const getFilteredEvents = async (data: { date: string; active: string; type: string; search: string; }) => {
  try {
      const response = await api.get('/events/filter', {
          params: {
              date: data.date,
              active: data.active,
              type: data.type,
              search: data.search
          }
      });
      
      if (!response || !response.data) {
          throw new Error("Unexpected response: Response or data is undefined.");
      }
      
      return response.data.data;
  } catch (error: any) {
      throw new Error(error.response?.data?.message || "An error occurred while filtering events.");
  }
};

