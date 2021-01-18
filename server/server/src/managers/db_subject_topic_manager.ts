import { UserEntity } from "../entities/user.entity";
import { getConnection, getRepository, SelectQueryBuilder } from "typeorm";

import { SubjectTopicEntity } from "../entities/subject.topic.entity";

export class DBSubjectTopicManager {
	private static addRelations(
		query: SelectQueryBuilder<SubjectTopicEntity>
	): SelectQueryBuilder<SubjectTopicEntity> {
		query.leftJoinAndSelect("topic.occupations", "occupations");

		return query;
	}

	public static CreateEmptyTopicEntity(): SubjectTopicEntity {
		return getRepository(SubjectTopicEntity).create();
	}

	public static async GetAllSubjects(): Promise<SubjectTopicEntity[]> {
		const user = this.addRelations(
			getRepository(SubjectTopicEntity).createQueryBuilder("topic")
		).getMany();

		return user;
	}

	public static async GetById(
		id: number
	): Promise<SubjectTopicEntity | undefined> {
		const result = this.addRelations(
			getRepository(SubjectTopicEntity).createQueryBuilder("topic")
		)
			.where("topic.id = :id", { id })
			.getOne();
		return result;
	}

	public static async IsExist(id: number): Promise<boolean> {
		const result = this.addRelations(
			getRepository(SubjectTopicEntity).createQueryBuilder("topic")
		)
			.where("topic.id = :id", { id })
			.getOne();
		return result !== undefined;
	}
}
