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
import { SubjectTopicEntity } from "../entities/subject.topic.entity";
import { SubjectSelectPathEntity } from "../entities/subject.select.path";

export class DBSubjectManager {
	private static addRelations(
		query: SelectQueryBuilder<SubjectEntity>
	): SelectQueryBuilder<SubjectEntity> {
		query.leftJoinAndSelect("subject.trainingPrograms", "trainingPrograms");
		query.leftJoinAndSelect("subject.cycle", "cycle");
		query.leftJoinAndSelect("trainingPrograms.topics", "topics");
		query.leftJoinAndSelect("topics.occupations", "occupations");

		return query;
	}

	public static CreateEmptySubjectEntity(): SubjectEntity {
		return getRepository(SubjectEntity).create();
	}

	public static CreateEmptySubjectSelectPathEntity(): SubjectSelectPathEntity {
		return getRepository(SubjectSelectPathEntity).create();
	}

	public static async Save(entity: SubjectEntity) {
		const result = await getRepository(SubjectEntity).save(entity);

		if (entity.trainingPrograms) {
			for (let pt of entity.trainingPrograms) {
				await getRepository(SubjectTrainingProgramEntity).save(pt);
				if (pt.topics) {
					for (let t of pt.topics) {
						await getRepository(SubjectTopicEntity).save(t);
					}
				}
			}
		}
		return this.GetById(result.id);
	}

	public static async GetAllSubjects(): Promise<SubjectEntity[]> {
		const user = this.addRelations(
			getRepository(SubjectEntity).createQueryBuilder("subject")
		).getMany();

		return user;
	}

	public static async GetByCycle(cycleId: number): Promise<SubjectEntity[]> {
		const user = this.addRelations(
			getRepository(SubjectEntity).createQueryBuilder("subject")
		)
			.where("cycle.id = :cycleId", { cycleId })
			.getMany();

		return user;
	}

	public static async GetById(id: number): Promise<SubjectEntity | undefined> {
		const result = this.addRelations(
			getRepository(SubjectEntity).createQueryBuilder("subject")
		)
			.where("subject.id = :id", { id })
			.getOne();
		return result;
	}

	public static async IsExist(id: number): Promise<boolean> {
		const result = this.addRelations(
			getRepository(SubjectEntity).createQueryBuilder("subject")
		)
			.where("subject.id = :id", { id })
			.getOne();
		return result !== undefined;
	}
}
