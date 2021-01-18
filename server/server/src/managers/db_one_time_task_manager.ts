import { getRepository, SelectQueryBuilder } from "typeorm";

import { NormEntity } from "../entities/norm.entity";
import { RankEntity } from "../entities/rank.entity";
import { OneTimeTaskEntity } from "../entities/one.time.tasks.entity";

export class DBOneTimeTaskManager {
	private static addRelations(
		query: SelectQueryBuilder<OneTimeTaskEntity>
	): SelectQueryBuilder<OneTimeTaskEntity> {
		// query.leftJoinAndSelect("class.selectPath", "selectPath");

		return query;
	}

	public static CreateEmptyEntity(): OneTimeTaskEntity {
		return getRepository(OneTimeTaskEntity).create();
	}

	public static async SaveEntity(gr: OneTimeTaskEntity) {
		const saved = await getRepository(OneTimeTaskEntity).save(gr);

		return DBOneTimeTaskManager.GetById(saved.id);
	}

	public static async GetAll(): Promise<OneTimeTaskEntity[]> {
		const user = this.addRelations(
			getRepository(OneTimeTaskEntity).createQueryBuilder("one")
		).getMany();

		return user;
	}

	public static async GetById(
		id: number
	): Promise<OneTimeTaskEntity | undefined> {
		const result = this.addRelations(
			getRepository(OneTimeTaskEntity).createQueryBuilder("one")
		)
			.where({ id })
			.getOne();

		return result;
	}
}
