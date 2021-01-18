import { SubjectSelectPath } from "./subjectSelectPath";
import { GroupUserPresence } from "./groupUserPresence";
import { Subdivision } from "./subdivision";
import { User } from "./user";

export class ClassEvent {
	id: number;
	date: Date;
	hours: number;
	place: string;
	groupId: number;
	selectPath: SubjectSelectPath;
	presences: GroupUserPresence[];
	cycle: Subdivision;
	userId: number;
}
