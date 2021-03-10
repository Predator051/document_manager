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
import { GroupUserPresenceEntity } from "./group.user.presence.entity";

@Entity()
export class GroupUserMarkEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ default: 0 })
	current: number;

	@Column({ default: 0 })
	topic: number;

	@Column({ default: 0 })
	subject: number;

	@OneToOne((type) => GroupUserPresenceEntity, {
		onDelete: "CASCADE",
	})
	mark?: GroupUserPresenceEntity;

	public ToRequestObject(): GroupUserMark {
		return {
			id: this.id,
			current: this.current,
			subject: this.subject,
			topic: this.topic,
		};
	}
}
