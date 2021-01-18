import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	ManyToOne,
	OneToMany,
	PrimaryColumn,
} from "typeorm";
import { SubjectTopicEntity } from "./subject.topic.entity";
import { GroupEntity } from "./group.entity";
import { GroupUser } from "../types/groupUser";
import { GroupTrainingType, GroupTraining } from "../types/group";

@Entity()
export class GroupTrainingTypeEntity {
	@PrimaryColumn()
	id: number;

	@Column({
		type: "enum",
		enum: GroupTrainingType,
		default: GroupTrainingType.OTHER,
	})
	type: GroupTrainingType;

	@Column()
	content: string;

	@OneToMany((type) => GroupEntity, (group) => group.trainingType)
	group?: GroupEntity;

	public ToRequestObject(): GroupTraining {
		return {
			id: this.id,
			content: this.content,
			type: this.type,
		};
	}
}
