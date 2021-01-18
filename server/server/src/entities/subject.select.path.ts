import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	ManyToOne,
	OneToMany,
} from "typeorm";
import { SubjectTopicEntity } from "./subject.topic.entity";
import { GroupEntity } from "./group.entity";
import { SubjectEntity } from "./subject.entity";
import { SubjectSelectPath } from "../types/subjectSelectPath";

@Entity()
export class SubjectSelectPathEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	subject: number;

	@Column()
	programTraining: number;

	@Column()
	topic: number;

	@Column()
	occupation: number;

	public ToRequestObject(): SubjectSelectPath {
		return {
			id: this.id,
			occupation: this.occupation,
			programTraining: this.programTraining,
			subject: this.subject,
			topic: this.topic,
		};
	}
}
