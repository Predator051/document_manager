import { UserEntity } from "../entities/user.entity";
import { getConnection, getRepository, SelectQueryBuilder } from "typeorm";
import { DEFAULT_NAME_DB_CONNECION, ObjectStatus } from "../types/constants";
import { User } from "../types/user";
import { UserSessionEntity } from "../entities/session.entity";
import { DBManager } from "./db_manager";
import {
	Group,
	GroupTraining,
	GroupTrainingType,
	StandartIdByGroupTrainingType,
	TrainingTypeToString,
} from "../types/group";
import { GroupEntity } from "../entities/group.entity";
import { GroupTrainingTypeEntity } from "../entities/group.training.type.entity";
import { GroupUser } from "../types/groupUser";
import { GroupUserEntity } from "../entities/group.user.entity";
import { getStartEndOfYear } from "../helpers/dateHelper";

export class DBGroupManager {
	private static addRelations(
		query: SelectQueryBuilder<GroupEntity>
	): SelectQueryBuilder<GroupEntity> {
		query.leftJoinAndSelect("group.users", "users");
		query.leftJoinAndSelect("group.trainingType", "trainingType");
		query.leftJoinAndSelect("group.mrs", "mrs");

		return query;
	}

	// public static async CreateGroup(group: Group) {
	// 	await (await DBManager.get())
	// 		.getConnection()
	// 		.getRepository(GroupEntity)
	// 		.save({
	// 			login: user.login,
	// 			password: user.password,
	// 		});
	// }

	public static CreateEmptyGroupEntity(): GroupEntity {
		return getRepository(GroupEntity).create();
	}

	public static SaveGroupEntity(gr: GroupEntity) {
		return getRepository(GroupEntity).save(gr);
	}

	public static CreateEmptyGroupUserEntity(): GroupUserEntity {
		return getRepository(GroupUserEntity).create();
	}

	public static async GetAllGroups(year?: number): Promise<GroupEntity[]> {
		const groups = this.addRelations(
			getRepository(GroupEntity).createQueryBuilder("group")
		);

		if (year && year !== new Date().getFullYear()) {
			const { start, end } = getStartEndOfYear(year);
			groups
				.leftJoinAndSelect("group.classEvents", "classevent")
				.leftJoinAndSelect("group.normProcesses", "normprocesses")
				.leftJoinAndSelect("classevent.presenses", "presenses")
				.leftJoinAndSelect("presenses.mark", "mark")
				// .leftJoinAndSelect("group.normProcesses", "normprocess")
				.where("(classevent.date <= :end AND classevent.date >= :start)", {
					end,
					start,
				})
				.orWhere(
					"(normprocesses.date <= :end AND normprocesses.date >= :start)",
					{
						end,
						start,
					}
				);
			// .andWhere("(mark.current > 0 OR mark.topic > 0 OR mark.subject > 0)");
			// .orWhere("(normprocess.date <= :end AND normprocess.date >= :start)", {
			// 	end,
			// 	start,
			// })
		}

		if (year === new Date().getFullYear()) {
			groups.andWhere("group.status = :status", {
				status: ObjectStatus.NORMAL,
			});
		}

		return groups.getMany();
	}

	public static async GetById(id: number): Promise<GroupEntity | undefined> {
		const user = this.addRelations(
			getRepository(GroupEntity).createQueryBuilder("group")
		)
			.where({ id })
			.getOne();

		return user;
	}

	public static async deleteGroupUser(id: number): Promise<boolean> {
		const user = await getRepository(GroupUserEntity).delete(id);

		return true;
	}

	public static async IsExist(group: Group): Promise<[boolean, GroupEntity]> {
		const query = this.addRelations(
			getRepository(GroupEntity).createQueryBuilder("group")
		).where({
			year: group.year,
			company: group.company,
			platoon: group.platoon,
			status: ObjectStatus.NORMAL,
			mrs: {
				id: group.mrs.id,
			},
			trainingType: {
				id: group.trainingType.id,
			},
		});

		// query.andWhere("mrs.id = :id", { id: group.mrs.id });
		if (group.trainingType.type === GroupTrainingType.PROFESSIONAL_CONTRACT) {
			query.andWhere("group.cycle = :cycle", { cycle: group.cycle });
		}

		if (group.trainingType.type === GroupTrainingType.PROFESSIONAL_SERGEANTS) {
			query.andWhere("group.quarter = :quarter", { quarter: group.quarter });
		}

		if (group.trainingType.type === GroupTrainingType.PROFESSIONAL_SERGEANTS) {
			query.andWhere("group.appeal = :appeal", { appeal: group.appeal });
		}

		let result = await query.getOne();

		return [result !== undefined, result];
	}

	public static async GetAllGroupTrainingTypes(): Promise<
		GroupTrainingTypeEntity[]
	> {
		const result = getRepository(GroupTrainingTypeEntity)
			.createQueryBuilder("group_training_type")
			.getMany();
		return result;
	}

	public static async GetGroupTrainingTypeById(
		id: number
	): Promise<GroupTrainingTypeEntity | undefined> {
		const result = getRepository(GroupTrainingTypeEntity)
			.createQueryBuilder("group_training_type")
			.where("group_training_type.id = :id", { id })
			.getOne();
		return result;
	}

	public static async GetGroupTrainingTypeByMaxId(): Promise<number> {
		const result = await getRepository(GroupTrainingTypeEntity)
			.createQueryBuilder("group_training_type")
			.select("MAX(group_training_type.id)", "max")
			.getRawOne();
		return result.max;
	}

	public static async IsGroupTrainingTypeExist(id: number): Promise<boolean> {
		const result = await getRepository(GroupTrainingTypeEntity)
			.createQueryBuilder("group_training_type")
			.where("group_training_type.id = :id", { id })
			.getOne();
		return result !== undefined;
	}

	public static async CreateGroupTrainingType(
		gt: GroupTraining
	): Promise<GroupTrainingTypeEntity | undefined> {
		const result = await getRepository(GroupTrainingTypeEntity).save({
			id: gt.id,
			type: gt.type,
			content: gt.content,
		});
		return this.GetGroupTrainingTypeById(result.id);
	}

	public static async CreateGroupUser(
		gu: GroupUser
	): Promise<GroupUserEntity | undefined> {
		const result = await getRepository(GroupUserEntity).save({
			id: gu.id,
			birthDay: gu.birthday,
			education: gu.education,
			fullname: gu.fullname,
			rank: gu.rank,
		});
		return this.GetGroupUserById(result.id);
	}

	public static async GetGroupUserById(
		id: number
	): Promise<GroupUserEntity | undefined> {
		const result = getRepository(GroupUserEntity)
			.createQueryBuilder("group_user")
			.where("group_user.id = :id", { id })
			.getOne();
		return result;
	}

	public static async CreateStandartGroupTrainingTypes() {
		if (
			!(await this.IsGroupTrainingTypeExist(
				StandartIdByGroupTrainingType.course
			))
		) {
			this.CreateGroupTrainingType({
				id: StandartIdByGroupTrainingType.course,
				content: TrainingTypeToString(GroupTrainingType.COURSE),
				type: GroupTrainingType.COURSE,
			});
		}
		if (
			!(await this.IsGroupTrainingTypeExist(
				StandartIdByGroupTrainingType.operative_reserve
			))
		) {
			this.CreateGroupTrainingType({
				id: StandartIdByGroupTrainingType.operative_reserve,
				content: TrainingTypeToString(GroupTrainingType.OPERATIVE_RESERVE),
				type: GroupTrainingType.OPERATIVE_RESERVE,
			});
		}
		if (
			!(await this.IsGroupTrainingTypeExist(
				StandartIdByGroupTrainingType.other
			))
		) {
			this.CreateGroupTrainingType({
				id: StandartIdByGroupTrainingType.other,
				content: TrainingTypeToString(GroupTrainingType.OTHER),
				type: GroupTrainingType.OTHER,
			});
		}
		if (
			!(await this.IsGroupTrainingTypeExist(
				StandartIdByGroupTrainingType.professiona_conscript
			))
		) {
			this.CreateGroupTrainingType({
				id: StandartIdByGroupTrainingType.professiona_conscript,
				content: TrainingTypeToString(GroupTrainingType.PROGESSIONAL_CONSCRIPT),
				type: GroupTrainingType.PROGESSIONAL_CONSCRIPT,
			});
		}

		if (
			!(await this.IsGroupTrainingTypeExist(
				StandartIdByGroupTrainingType.professional_contract
			))
		) {
			this.CreateGroupTrainingType({
				id: StandartIdByGroupTrainingType.professional_contract,
				content: TrainingTypeToString(GroupTrainingType.PROFESSIONAL_CONTRACT),
				type: GroupTrainingType.PROFESSIONAL_CONTRACT,
			});
		}
		if (
			!(await this.IsGroupTrainingTypeExist(
				StandartIdByGroupTrainingType.professional_sergeants
			))
		) {
			this.CreateGroupTrainingType({
				id: StandartIdByGroupTrainingType.professional_sergeants,
				content: TrainingTypeToString(GroupTrainingType.PROFESSIONAL_SERGEANTS),
				type: GroupTrainingType.PROFESSIONAL_SERGEANTS,
			});
		}
	}
}
