import { SubjectTrainingProgram } from "./subjectTrainingProgram";
import { ObjectStatus } from "./constants";

export class Subject {
	id: number;
	fullTitle: string;
	shortTitle: string;
	programTrainings: SubjectTrainingProgram[];
	status: ObjectStatus;
}
