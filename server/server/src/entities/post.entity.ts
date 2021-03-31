import {
	Column,
	Entity,
	PrimaryGeneratedColumn,
	CreateDateColumn,
} from "typeorm";
import { Post } from "../types/post";

@Entity()
export class PostEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	post: string;

	@Column()
	@CreateDateColumn()
	createAt: Date;

	public ToRequestObject(): Post {
		return {
			id: this.id,
			post: this.post,
			createAt: this.createAt,
		};
	}
}
