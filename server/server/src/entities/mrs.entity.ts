import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from "typeorm";

import { MRS } from "../types/mrs";
import { GroupEntity } from "./group.entity";

@Entity()
export class MRSEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	number: string;

	@Column()
	name: string;

	@OneToMany((type) => GroupEntity, (group) => group.mrs)
	groups?: GroupEntity[];

	public ToRequestObject(): MRS {
		return {
			id: this.id,
			name: this.name,
			number: this.number,
		};
	}
}
