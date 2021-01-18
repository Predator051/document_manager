import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { SubjectTopicEntity } from "./subject.topic.entity";
import { SubjectTopicOccupation } from "../types/subjectTopicOccupation";

@Entity()
export class SubjectTopicOccupationEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	title: string;

	@Column()
	number: number;

	@ManyToOne((type) => SubjectTopicEntity, (topic) => topic.occupations)
	topic?: SubjectTopicEntity;

	public ToRequestObject(): SubjectTopicOccupation {
		return {
			id: this.id,
			number: this.number,
			title: this.title,
		};
	}
}
