import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	ManyToOne,
	OneToMany,
} from "typeorm";
import { SubjectTopicEntity } from "./subject.topic.entity";
import { SubjectTopicOccupation } from "../types/subjectTopicOccupation";
import { SubjectEntity } from "./subject.entity";
import { SubjectTrainingProgram } from "../types/subjectTrainingProgram";

@Entity()
export class SubjectTrainingProgramEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	title: string;

	@ManyToOne((type) => SubjectEntity, (subject) => subject.trainingPrograms)
	subject?: SubjectEntity;

	@OneToMany((type) => SubjectTopicEntity, (topic) => topic.programTraining, {
		cascade: true,
	})
	topics: SubjectTopicEntity[];

	public ToRequestObject(): SubjectTrainingProgram {
		return {
			id: this.id,
			title: this.title,
			topics: this.topics.map((t) => t.ToRequestObject()),
		};
	}
}
