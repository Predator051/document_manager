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
import { Subdivision } from "../types/subdivision";
import { ClassEventEntity } from "./class.event.entity";
import { UserEntity } from "./user.entity";
import { SubjectEntity } from "./subject.entity";
import { NormEntity } from "./norm.entity";

@Entity()
export class SubdivisionEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ default: "" })
	title: string;

	@OneToMany((type) => ClassEventEntity, (classes) => classes.cycle)
	classes?: ClassEventEntity[];

	@OneToMany((type) => UserEntity, (user) => user.cycle)
	users?: UserEntity[];

	@OneToMany((type) => SubjectEntity, (subject) => subject.cycle)
	subjects?: UserEntity[];

	@OneToMany((type) => NormEntity, (norm) => norm.cycle)
	norms?: NormEntity[];

	public ToRequestObject(): Subdivision {
		return {
			id: this.id,
			title: this.title,
		};
	}
}
