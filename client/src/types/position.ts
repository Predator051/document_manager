export enum PositionType {
	CUSTOM = "custom",
	STANDART = "standart",
}

export class Position {
	id: number;
	title: string;
	type: PositionType;
}
