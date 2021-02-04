import { Group } from "./group";
import { NormMark } from "./normMark";

export class NormProcess {
	id: number;
	date: Date;
	group: Group;
	marks: NormMark[];
	user: number;
}
