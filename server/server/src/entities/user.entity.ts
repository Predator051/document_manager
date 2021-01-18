import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	OneToMany,
	ManyToOne,
} from "typeorm";
import { UserSessionEntity } from "./session.entity";
import { User, UserType } from "../types/user";
import { ClassEventEntity } from "./class.event.entity";
import { SubdivisionEntity } from "./subdivision.entity";
import { NormProcessEntity } from "./norm.process.entity";
import { NormProcess } from "../types/normProcess";
import { IndividualWorkEntity } from "./individual.work.entity";
import { PositionEntity } from "./position.entity";
import { AccountingEntity } from "./accounting.teacher.entity";
import { RankEntity } from "./rank.entity";

@Entity()
export class UserEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	login: string;

	@Column()
	password: string;

	@Column({ default: "" })
	firstName: string;

	@Column({ default: "" })
	secondName: string;

	@Column({ default: () => "CURRENT_TIMESTAMP" })
	dateCreation?: Date;

	@OneToMany((type) => UserSessionEntity, (session) => session.user)
	sessions?: UserSessionEntity[];

	@OneToMany((type) => ClassEventEntity, (classes) => classes.user)
	classes?: ClassEventEntity[];

	@OneToMany((type) => NormProcessEntity, (process) => process.user)
	normProcesses?: NormProcessEntity[];

	@ManyToOne((type) => SubdivisionEntity, (cycle) => cycle.users)
	cycle: SubdivisionEntity;

	@ManyToOne((type) => PositionEntity, (position) => position.users)
	position: PositionEntity;

	@ManyToOne((type) => RankEntity, (rank) => rank.users)
	rank: RankEntity;

	@OneToMany((type) => IndividualWorkEntity, (workEntity) => workEntity.user)
	individualWorks?: IndividualWorkEntity[];

	@OneToMany((type) => AccountingEntity, (accounting) => accounting.from)
	accountingFrom?: AccountingEntity[];

	@OneToMany((type) => AccountingEntity, (accounting) => accounting.to)
	accountingTo?: AccountingEntity[];

	@Column({
		type: "enum",
		enum: UserType,
		default: UserType.TEACHER,
	})
	userType: UserType;

	public ToRequestObject(): User {
		return {
			id: this.id,
			login: this.login,
			password: this.password,
			session: "",
			userType: this.userType,
			cycle: this.cycle.ToRequestObject(),
			position: this.position.ToRequestObject(),
			firstName: this.firstName,
			secondName: this.secondName,
			rank: this.rank.ToRequestObject(),
		};
	}
}
