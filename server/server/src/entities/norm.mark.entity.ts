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
import { NormEntity } from "./norm.entity";
import { NormMark } from "../types/normMark";

@Entity()
export class NormMarkEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	mark: number;

	@ManyToOne((type) => NormEntity, (norm) => norm.marks)
	norm: NormEntity;

	@ManyToOne((type) => GroupUserEntity, (user) => user.normMarks)
	user: GroupUserEntity;

	@ManyToOne((type) => NormProcessEntity, (norm) => norm.marks)
	process: NormProcessEntity;

	public ToRequestObject(): NormMark {
		return {
			id: this.id,
			mark: this.mark,
			normId: this.norm.id,
			processId: this.process.id,
			userId: this.user.id,
		};
	}
}
