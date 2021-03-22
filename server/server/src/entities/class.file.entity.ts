import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	ManyToMany,
	ManyToOne,
	CreateDateColumn,
} from "typeorm";
import { ClassEventEntity } from "./class.event.entity";
import { ClassFile } from "../types/classFile";
import { SubjectTopicOccupationEntity } from "./subject.topic.occupation.entity";

@Entity()
export class ClassFileEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	filename: string;

	@CreateDateColumn()
	createAt: Date;

	@ManyToOne((type) => SubjectTopicOccupationEntity, (occ) => occ.files, {
		nullable: true,
	})
	occupation?: SubjectTopicOccupationEntity;

	@ManyToMany((type) => ClassEventEntity, (classes) => classes.files)
	classes?: ClassEventEntity[];

	public ToRequestObject(): ClassFile {
		return {
			id: this.id,
			filename: this.filename,
			occupation: this.occupation ? this.occupation.id : 0,
			createAt: new Date(this.createAt),
		};
	}
}
