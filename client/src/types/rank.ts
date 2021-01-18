export enum RankType {
	CUSTOM = "custom",
	STANDART = "standart",
}

export class Rank {
	id: number;
	title: string;
	type: RankType;
}
