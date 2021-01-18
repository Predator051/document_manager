import { Norm } from "./norm";
import { GroupUser } from "./groupUser";
import { NormProcess } from "./normProcess";

export class NormMark {
	id: number;
	mark: number;
	normId: number;
	userId: number;
	processId: number;

	// public ToRequestObject(): Norm {
	// 	return {
	// 		id: this.id,
	// 		content: this.content,
	// 		excellent: this.excellent,
	// 		good: this.good,
	// 		number: this.number,
	// 		satisfactory: this.satisfactory,
	// 	};
	// }
}
