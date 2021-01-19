import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	ManyToOne,
	OneToMany,
	OneToOne,
} from "typeorm";
import { SubjectTopicEntity } from "./subject.topic.entity";
import { GroupEntity } from "./group.entity";
import { GroupUser } from "../types/groupUser";
import { UserPresenceType } from "../types/groupUserPresence";
import { GroupUserEntity } from "./group.user.entity";
import { GroupUserMark } from "../types/groupUserMark";
import { Norm } from "../types/norm";
import { NormProcessEntity } from "./norm.process.entity";
import { SubdivisionEntity } from "./subdivision.entity";
import { NormMarkEntity } from "./norm.mark.entity";
import { SubjectEntity } from "./subject.entity";
import { ObjectStatus } from "../types/constants";

@Entity()
export class NormEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	number: number;

	@Column()
	content: string;

	@Column()
	excellent: string;

	@Column()
	good: string;

	@Column()
	satisfactory: string;

	@ManyToOne((type) => SubdivisionEntity, (cycle) => cycle.norms)
	cycle: SubdivisionEntity;

	@ManyToOne((type) => SubjectEntity, (subject) => subject.norms)
	subject: SubjectEntity;

	@Column({
		type: "enum",
		enum: ObjectStatus,
		default: ObjectStatus.NORMAL,
	})
	status: ObjectStatus;

	@OneToMany((type) => NormMarkEntity, (mark) => mark.norm)
	marks?: NormMarkEntity[];

	public ToRequestObject(): Norm {
		return {
			id: this.id,
			content: this.content,
			excellent: this.excellent,
			good: this.good,
			number: this.number,
			satisfactory: this.satisfactory,
			subjectId: this.subject.id,
			status: this.status,
		};
	}
}
