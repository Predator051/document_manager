import { GroupUser } from "./groupUser";

export class IndividualWork {
	id: number;
	date: Date;
	content: string;
	users: GroupUser[];
	userId: number;
	groupId: number;
}
