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
import { SubjectEntity } from "./subject.entity";
import { SubjectSelectPathEntity } from "./subject.select.path";
import { ClassEvent } from "../types/classEvent";
import { GroupUserPresenceEntity } from "./group.user.presence.entity";
import { UserEntity } from "./user.entity";
import { SubdivisionEntity } from "./subdivision.entity";

@Entity()
export class ClassEventEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ default: () => "CURRENT_TIMESTAMP" })
	date: Date;

	@Column({ default: () => "CURRENT_TIMESTAMP" })
	creationDate: Date;

	@Column()
	hours: number;

	@Column()
	place: string;

	@ManyToOne((type) => GroupEntity, (group) => group.classEvents)
	group: GroupEntity;

	@OneToMany(
		(type) => GroupUserPresenceEntity,
		(presense) => presense.classEvent,
		{ cascade: true }
	)
	presenses: GroupUserPresenceEntity[];

	@OneToOne((type) => SubjectSelectPathEntity, { cascade: true })
	@JoinColumn()
	selectPath: SubjectSelectPathEntity;

	@ManyToOne((type) => UserEntity, (user) => user.classes)
	user: UserEntity;

	@ManyToOne((type) => SubdivisionEntity, (cycle) => cycle.classes)
	cycle: SubdivisionEntity;

	public ToRequestObject(): ClassEvent {
		return {
			id: this.id,
			date: new Date(this.date),
			groupId: this.group.id,
			hours: this.hours,
			place: this.place,
			selectPath: this.selectPath.ToRequestObject(),
			presences: this.presenses.map((pr) => pr.ToRequestObject()),
			cycle: this.cycle.ToRequestObject(),
			userId: this.user.id,
		};
	}
}
