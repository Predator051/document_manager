import { Subdivision } from "./subdivision";
import { Position, PositionType } from "./position";
import { Rank, RankType } from "./rank";
export enum UserType {
	TEACHER,
	VIEWER,
	ADMIN,
	NONE,
}

export class User {
	constructor(id: number, session: string, login: string, password: string) {
		this.id = id;
		this.session = session;
		this.login = login;
		this.password = password;
		this.userType = UserType.TEACHER;
	}

	id: number;
	session: string;
	login: string;
	password: string;
	userType: UserType;
	cycle: Subdivision;
	position: Position;
	firstName: string;
	secondName: string;
	rank: Rank;

	public static EmptyUser(): User {
		return {
			id: 0,
			session: "",
			login: "",
			password: "",
			userType: UserType.NONE,
			cycle: {
				id: 0,
				title: "",
			},
			position: {
				id: 0,
				title: "",
				type: PositionType.STANDART,
			},
			firstName: "",
			secondName: "",
			rank: {
				id: 0,
				title: "",
				type: RankType.STANDART,
			},
		};
	}
}
