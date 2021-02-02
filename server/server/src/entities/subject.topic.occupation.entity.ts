import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { SubjectTopicEntity } from "./subject.topic.entity";
import { SubjectTopicOccupation } from "../types/subjectTopicOccupation";
import { ObjectStatus } from "../types/constants";

@Entity()
export class SubjectTopicOccupationEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	title: string;

	@Column()
	number: number;

	@Column({
		type: "enum",
		enum: ObjectStatus,
		default: ObjectStatus.NORMAL,
	})
	status: ObjectStatus;

	@ManyToOne((type) => SubjectTopicEntity, (topic) => topic.occupations)
	topic?: SubjectTopicEntity;

	public ToRequestObject(): SubjectTopicOccupation {
		return {
			id: this.id,
			number: this.number,
			title: this.title,
			status: this.status,
		};
	}
}
