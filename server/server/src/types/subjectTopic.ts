import { SubjectTopicOccupation } from "./subjectTopicOccupation";
import { ObjectStatus } from "./constants";

export class SubjectTopic {
	id: number;
	number: number;
	title: string;
	status: ObjectStatus;
	occupation: SubjectTopicOccupation[];
}
