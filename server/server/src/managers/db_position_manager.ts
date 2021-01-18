import { UserEntity } from "../entities/user.entity";
import { getConnection, getRepository, SelectQueryBuilder } from "typeorm";
import {
	DEFAULT_NAME_DB_CONNECION,
	STANDART_VALUES,
	STANDART_KEYS,
} from "../types/constants";
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
import { PositionEntity } from "../entities/position.entity";

export class DBPositionManager {
	private static addRelations(
		query: SelectQueryBuilder<PositionEntity>
	): SelectQueryBuilder<PositionEntity> {
		// query.leftJoinAndSelect("position.users", "users");

		return query;
	}

	public static async SaveEntity(
		gr: PositionEntity
	): Promise<PositionEntity | undefined> {
		const saved = await getRepository(PositionEntity).save(gr);
		return this.GetById(saved.id);
	}

	public static CreateEmptyEntity(): PositionEntity {
		return getRepository(PositionEntity).create();
	}

	public static async GetAll(): Promise<PositionEntity[]> {
		const user = this.addRelations(
			getRepository(PositionEntity).createQueryBuilder("position")
		).getMany();

		return user;
	}

	public static async GetById(id: number): Promise<PositionEntity | undefined> {
		const user = this.addRelations(
			getRepository(PositionEntity).createQueryBuilder("position")
		)
			.where({ id })
			.getOne();

		return user;
	}

	public static async GetStandartSecondAdminPosition(): Promise<
		PositionEntity | undefined
	> {
		const posId = STANDART_VALUES.get(
			STANDART_KEYS.STANDART_SECOND_ADMIN_POSITION
		);

		if (posId === undefined) return undefined;

		return this.GetById(posId);
	}

	public static async GetStandartViewerPosition(): Promise<
		PositionEntity | undefined
	> {
		const posId = STANDART_VALUES.get(STANDART_KEYS.STANDART_VIEWER_POSITION);

		if (posId === undefined) return undefined;

		return this.GetById(posId);
	}

	public static async CreateStandart() {}
}
