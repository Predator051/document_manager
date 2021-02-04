import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	ManyToOne,
	OneToMany,
	OneToOne,
	JoinColumn,
} from "typeorm";
import { SubjectTopicEntity } from "./subject.topic.entity";
import { GroupEntity } from "./group.entity";
import { GroupUser } from "../types/groupUser";
import { UserPresenceType } from "../types/groupUserPresence";
import { GroupUserEntity } from "./group.user.entity";
import { GroupUserMark } from "../types/groupUserMark";
import { Norm } from "../types/norm";
import { Group } from "../types/group";
import { NormEntity } from "./norm.entity";
import { NormMarkEntity } from "./norm.mark.entity";
import { NormProcess } from "../types/normProcess";
import { UserEntity } from "./user.entity";

@Entity()
export class NormProcessEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	date: Date;

	@ManyToOne((type) => GroupEntity, (group) => group.normProcesses)
	group: GroupEntity;

	@OneToMany((type) => NormMarkEntity, (mark) => mark.process, {
		cascade: true,
	})
	marks: NormMarkEntity[];

	@ManyToOne((type) => UserEntity, (user) => user.normProcesses)
	user: UserEntity;

	public ToRequestObject(): NormProcess {
		return {
			id: this.id,
			date: new Date(this.date),
			group: this.group.ToRequestObject(),
			marks: this.marks.map((mr) => mr.ToRequestObject()),
			user: this.user.id,
		};
	}
}
