import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class OneTimeTaskEntity {
	@PrimaryColumn()
	id: number;

	@Column()
	title: string;

	@Column()
	isFullfilled: boolean;
}
