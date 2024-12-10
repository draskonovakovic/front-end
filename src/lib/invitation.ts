import api from "./interceptor";

export const sendInvitation = async (data: { user_id: number,  event_id:  number, status: string}) => {
    try {
        const response = await api.post("/invitations/", data);
        if (!response || !response.data) {
            throw new Error("Unexpected response: Response or data is undefined.");
        }
        return response.data;
    } catch (error: any) {
        throw new Error(error.message || "An error occurred while creating event.");
    }
};