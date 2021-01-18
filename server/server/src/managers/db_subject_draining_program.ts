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
import { SubjectTrainingProgramEntity } from "../entities/subject.training.program.entity";

export class DBSubjectTrainingProgramManager {
	private static addRelations(
		query: SelectQueryBuilder<SubjectTrainingProgramEntity>
	): SelectQueryBuilder<SubjectTrainingProgramEntity> {
		query.leftJoinAndSelect("trainingPrograms.topics", "topics");
		query.leftJoinAndSelect("topics.occupations", "occupations");

		return query;
	}

	public static CreateEmptyTrainingProgramEntity(): SubjectTrainingProgramEntity {
		return getRepository(SubjectTrainingProgramEntity).create();
	}

	public static async GetAllSubjects(): Promise<
		SubjectTrainingProgramEntity[]
	> {
		const user = this.addRelations(
			getRepository(SubjectTrainingProgramEntity).createQueryBuilder(
				"trainingPrograms"
			)
		).getMany();

		return user;
	}

	public static async GetById(
		id: number
	): Promise<SubjectTrainingProgramEntity | undefined> {
		const result = this.addRelations(
			getRepository(SubjectTrainingProgramEntity).createQueryBuilder(
				"trainingPrograms"
			)
		)
			.where("trainingPrograms.id = :id", { id })
			.getOne();
		return result;
	}

	public static async IsExist(id: number): Promise<boolean> {
		const result = this.addRelations(
			getRepository(SubjectTrainingProgramEntity).createQueryBuilder(
				"trainingPrograms"
			)
		)
			.where("trainingPrograms.id = :id", { id })
			.getOne();
		return result !== undefined;
	}
}
