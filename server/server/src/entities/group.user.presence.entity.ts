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
import {
	UserPresenceType,
	GroupUserPresence,
} from "../types/groupUserPresence";
import { GroupUserEntity } from "./group.user.entity";
import { GroupUserMarkEntity } from "./group.user.mark.entity";
import { ClassEventEntity } from "./class.event.entity";

@Entity()
export class GroupUserPresenceEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({
		type: "enum",
		enum: UserPresenceType,
		default: UserPresenceType.PRESENCE,
	})
	type: UserPresenceType;

	@ManyToOne((type) => ClassEventEntity, (classEvent) => classEvent.presenses, {
		onDelete: "CASCADE",
	})
	classEvent: ClassEventEntity;

	@ManyToOne((type) => GroupUserEntity, (gu) => gu.presense)
	user: GroupUserEntity;

	@OneToOne((type) => GroupUserMarkEntity, { cascade: true })
	@JoinColumn()
	mark: GroupUserMarkEntity;

	public ToRequestObject(): GroupUserPresence {
		return {
			id: this.id,
			mark: this.mark.ToRequestObject(),
			type: this.type,
			userId: this.user.id,
		};
	}
}
