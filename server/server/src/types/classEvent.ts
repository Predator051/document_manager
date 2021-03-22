import { SubjectSelectPath } from "./subjectSelectPath";
import { GroupUserPresence } from "./groupUserPresence";
import { Subdivision } from "./subdivision";
import { User } from "./user";
import { ClassFile } from "./classFile";

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
	files: ClassFile[];
}
