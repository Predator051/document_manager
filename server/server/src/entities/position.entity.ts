import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { Position, PositionType } from '../types/position';
import { UserEntity } from './user.entity';

@Entity()
export class PositionEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	title: string;

	@Column({ type: "enum", enum: PositionType, default: PositionType.STANDART })
	type: PositionType;

	@OneToMany((type) => UserEntity, (user) => user.position)
	users?: UserEntity[];

	public ToRequestObject(): Position {
		return {
			id: this.id,
			title: this.title,
			type: this.type,
		};
	}
}
