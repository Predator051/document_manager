import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from "typeorm";

import { GroupEntity } from "./group.entity";
import { IPP } from "../types/ipp";

@Entity()
export class IPPEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	name: string;

	@OneToMany((type) => GroupEntity, (group) => group.ipp)
	groups?: GroupEntity[];

	public ToRequestObject(): IPP {
		return {
			id: this.id,
			name: this.name,
		};
	}
}
