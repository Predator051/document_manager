import { User } from "./user";

export class AccountingTeacher {
	id: number;
	content: string;
	date: Date;
	fromPosition: string;
	fromRank: string;
	fromSecondname: string;
	from: User;
	to: User;
}
