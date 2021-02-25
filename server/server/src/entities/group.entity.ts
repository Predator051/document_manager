import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	ManyToOne,
	OneToMany,
} from "typeorm";
import { ClassEventEntity } from "./class.event.entity";
import { GroupUserEntity } from "./group.user.entity";
import { Group, ConstripAppeal, MRSType } from "../types/group";
import { GroupTrainingTypeEntity } from "./group.training.type.entity";
import { NormProcessEntity } from "./norm.process.entity";
import { IndividualWorkEntity } from "./individual.work.entity";
import { ObjectStatus } from "../types/constants";
import { MRSEntity } from "./mrs.entity";
import { IPPEntity } from "./ipp.entity";

@Entity()
export class GroupEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	year: number;

	@Column({
		type: "enum",
		enum: ConstripAppeal,
		default: ConstripAppeal.AUTUMN,
	})
	appeal: ConstripAppeal;

	@Column()
	cycle: number;

	@Column()
	company: number;

	@Column()
	platoon: number;

	@Column()
	quarter: number;

	@ManyToOne((type) => GroupTrainingTypeEntity, (tt) => tt.group)
	trainingType: GroupTrainingTypeEntity;

	@ManyToOne((type) => MRSEntity, (mrs) => mrs.groups, {
		cascade: true,
		nullable: true,
	})
	mrs?: MRSEntity;

	@ManyToOne((type) => IPPEntity, (ipp) => ipp.groups, {
		cascade: true,
		nullable: true,
	})
	ipp?: IPPEntity;

	@Column({
		type: "enum",
		enum: ObjectStatus,
		default: ObjectStatus.NORMAL,
	})
	status: ObjectStatus;

	@OneToMany((type) => ClassEventEntity, (event) => event.group)
	classEvents?: ClassEventEntity[];

	@OneToMany((type) => NormProcessEntity, (norm) => norm.group)
	normProcesses?: NormProcessEntity[];

	@OneToMany((type) => GroupUserEntity, (user) => user.group, { cascade: true })
	users: GroupUserEntity[];

	@ManyToOne((type) => IndividualWorkEntity, (workEntity) => workEntity.group)
	individualWorks?: IndividualWorkEntity;

	public ToRequestObject(): Group {
		return {
			id: this.id,
			company: this.company,
			cycle: this.cycle,
			platoon: this.platoon,
			quarter: this.quarter,
			trainingType: this.trainingType.ToRequestObject(),
			year: this.year,
			appeal: this.appeal,
			mrs: this.mrs?.ToRequestObject(),
			users: this.users.map((u) => u.ToRequestObject()),
			status: this.status,
			ipp: this.ipp?.ToRequestObject(),
		};
	}
}
