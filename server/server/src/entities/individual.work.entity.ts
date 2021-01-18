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
import { UserEntity } from "./user.entity";
import { IndividualWork } from "../types/individualWork";

@Entity()
export class IndividualWorkEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	date: Date;

	@Column()
	content: string;

	@OneToMany((type) => GroupUserEntity, (gu) => gu.individualWorks)
	users: GroupUserEntity[];

	@ManyToOne((type) => UserEntity, (user) => user.individualWorks)
	user: UserEntity;

	@ManyToOne((type) => GroupEntity, (group) => group.individualWorks)
	group: GroupEntity;

	public ToRequestObject(): IndividualWork {
		return {
			id: this.id,
			content: this.content,
			date: new Date(this.date),
			userId: this.user.id,
			users: this.users.map((u) => u.ToRequestObject()),
			groupId: this.group.id,
		};
	}
}
