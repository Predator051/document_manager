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
import { AccountingTeacher } from "../types/accountingTeacher";

@Entity()
export class AccountingEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	content: string;

	@Column()
	date: Date;

	@Column()
	fromPosition: string;

	@Column()
	fromRank: string;

	@Column()
	fromSecondname: string;

	@ManyToOne((type) => UserEntity, (user) => user.accountingFrom)
	from: UserEntity;

	@ManyToOne((type) => UserEntity, (user) => user.accountingTo)
	to: UserEntity;

	public ToRequestObject(): AccountingTeacher {
		return {
			id: this.id,
			content: this.content,
			date: new Date(this.date),
			from: this.from.ToRequestObject(),
			fromPosition: this.fromPosition,
			fromRank: this.fromRank,
			fromSecondname: this.fromSecondname,
			to: this.to.ToRequestObject(),
		};
	}
}
