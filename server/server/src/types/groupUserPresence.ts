import { GroupUserMark } from "./groupUserMark";

export enum UserPresenceType {
	PRESENCE,
	OUTFIT,
	VACATION,
	BUSSINESS_TRIP,
	SICK,
	FREE,
}

export class GroupUserPresence {
	id: number;
	type: UserPresenceType;
	userId: number;
	mark: GroupUserMark;
}
