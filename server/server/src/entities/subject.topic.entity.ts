import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	ManyToOne,
	OneToMany,
} from "typeorm";
import { SubjectTopicOccupationEntity } from "./subject.topic.occupation.entity";
import { SubjectEntity } from "./subject.entity";
import { SubjectTopic } from "../types/subjectTopic";
import { SubjectTrainingProgramEntity } from "./subject.training.program.entity";

@Entity()
export class SubjectTopicEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	title: string;

	@Column()
	number: number;

	@ManyToOne((type) => SubjectTrainingProgramEntity, (stp) => stp.topics)
	programTraining?: SubjectTrainingProgramEntity;

	@OneToMany(
		(type) => SubjectTopicOccupationEntity,
		(occupation) => occupation.topic,
		{ cascade: true }
	)
	occupations: SubjectTopicOccupationEntity[];

	public ToRequestObject(): SubjectTopic {
		return {
			id: this.id,
			number: this.number,
			title: this.title,
			occupation: this.occupations.map((occ) => occ.ToRequestObject()),
		};
	}
}
