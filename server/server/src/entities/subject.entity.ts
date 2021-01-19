import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	ManyToOne,
	OneToMany,
} from "typeorm";
import { SubjectTopicEntity } from "./subject.topic.entity";
import { ClassEventEntity } from "./class.event.entity";
import { SubjectTrainingProgramEntity } from "./subject.training.program.entity";
import { Subject } from "../types/subject";
import { SubdivisionEntity } from "./subdivision.entity";
import { NormEntity } from "./norm.entity";
import { ObjectStatus } from "../types/constants";

@Entity()
export class SubjectEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	fullTitle: string;

	@Column()
	shortTitle: string;

	@OneToMany((type) => SubjectTrainingProgramEntity, (event) => event.subject, {
		cascade: true,
	})
	trainingPrograms: SubjectTrainingProgramEntity[];

	@ManyToOne((type) => SubdivisionEntity, (cycle) => cycle.subjects)
	cycle: SubdivisionEntity;

	@Column({
		type: "enum",
		enum: ObjectStatus,
		default: ObjectStatus.NORMAL,
	})
	status: ObjectStatus;

	@OneToMany((type) => NormEntity, (norm) => norm.subject)
	norms?: NormEntity[];

	public ToRequestObject(): Subject {
		return {
			id: this.id,
			fullTitle: this.fullTitle,
			shortTitle: this.shortTitle,
			programTrainings: this.trainingPrograms.map((tp) => tp.ToRequestObject()),
			status: this.status,
		};
	}
}
