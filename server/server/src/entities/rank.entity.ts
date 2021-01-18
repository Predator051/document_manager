import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

import { UserEntity } from "./user.entity";
import { RankType, Rank } from "../types/rank";

@Entity()
export class RankEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	title: string;

	@Column({ type: "enum", enum: RankType, default: RankType.STANDART })
	type: RankType;

	@OneToMany((type) => UserEntity, (user) => user.rank)
	users?: UserEntity[];

	public ToRequestObject(): Rank {
		return {
			id: this.id,
			title: this.title,
			type: this.type,
		};
	}
}
