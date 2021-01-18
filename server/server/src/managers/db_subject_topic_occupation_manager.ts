import { UserEntity } from "../entities/user.entity";
import { getConnection, getRepository, SelectQueryBuilder } from "typeorm";
import { DEFAULT_NAME_DB_CONNECION } from "../types/constants";
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
import { SubjectEntity } from "../entities/subject.entity";
import { SubjectTopicOccupationEntity } from "../entities/subject.topic.occupation.entity";

export class DBSubjectTopicOccupationManager {
	private static addRelations(
		query: SelectQueryBuilder<SubjectTopicOccupationEntity>
	): SelectQueryBuilder<SubjectTopicOccupationEntity> {
		return query;
	}

	public static CreateEmptyOccupationEntity(): SubjectTopicOccupationEntity {
		return getRepository(SubjectTopicOccupationEntity).create();
	}

	public static async GetAllSubjects(): Promise<
		SubjectTopicOccupationEntity[]
	> {
		const user = this.addRelations(
			getRepository(SubjectTopicOccupationEntity).createQueryBuilder(
				"occupation"
			)
		).getMany();

		return user;
	}

	public static async GetById(
		id: number
	): Promise<SubjectTopicOccupationEntity | undefined> {
		const result = this.addRelations(
			getRepository(SubjectTopicOccupationEntity).createQueryBuilder(
				"occupation"
			)
		)
			.where("occupation.id = :id", { id })
			.getOne();
		return result;
	}

	public static async IsExist(id: number): Promise<boolean> {
		const result = this.addRelations(
			getRepository(SubjectTopicOccupationEntity).createQueryBuilder(
				"occupation"
			)
		)
			.where("occupation.id = :id", { id })
			.getOne();
		return result !== undefined;
	}
}
