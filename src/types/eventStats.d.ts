import { EventData } from "./event"

export type EventStats = {
    event: EventData,
    aceptedInvitationsNum: number,
    declinedInvitationsNum: number,
    pendingInvitationsNum: number
}