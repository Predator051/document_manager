import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	ManyToOne,
	OneToMany,
} from "typeorm";
import { SubjectTopicEntity } from "./subject.topic.entity";
import { GroupEntity } from "./group.entity";
import { GroupUser } from "../types/groupUser";
import { GroupUserPresenceEntity } from "./group.user.presence.entity";
import { NormMarkEntity } from "./norm.mark.entity";
import { IndividualWorkEntity } from "./individual.work.entity";
import { ObjectStatus } from "../types/constants";

@Entity()
export class GroupUserEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	fullname: string;

	@Column()
	rank: string;

	@Column()
	birthDay: string;

	@Column()
	education: string;

	@ManyToOne((type) => GroupEntity, (group) => group.users)
	group: GroupEntity;

	@Column({
		type: "enum",
		enum: ObjectStatus,
		default: ObjectStatus.NORMAL,
	})
	status: ObjectStatus;

	@ManyToOne((type) => IndividualWorkEntity, (workEntity) => workEntity.users)
	individualWorks?: IndividualWorkEntity;

	@OneToMany((type) => GroupUserPresenceEntity, (presence) => presence.user)
	presense?: GroupUserPresenceEntity[];

	@OneToMany((type) => NormMarkEntity, (mark) => mark.user)
	normMarks?: NormMarkEntity[];

	public ToRequestObject(): GroupUser {
		return {
			id: this.id,
			birthday: this.birthDay,
			fullname: this.fullname,
			groupId: 0, //this.group.id,
			rank: this.rank,
			education: this.education,
			status: this.status,
		};
	}
}
