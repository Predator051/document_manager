import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class StandartKeyValueEntity {
	@PrimaryColumn()
	id: string;

	@Column()
	value: number;
}
