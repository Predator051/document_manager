import { getRepository, SelectQueryBuilder } from "typeorm";

import { StandartKeyValueEntity } from "../entities/standart.key.value.entity";

export class DBKeyValueManager {
	private static addRelations(
		query: SelectQueryBuilder<StandartKeyValueEntity>
	): SelectQueryBuilder<StandartKeyValueEntity> {
		return query;
	}

	public static CreateEmptyEntity(): StandartKeyValueEntity {
		return getRepository(StandartKeyValueEntity).create();
	}

	public static async SaveEntity(gr: StandartKeyValueEntity) {
		const saved = await getRepository(StandartKeyValueEntity).save(gr);

		return DBKeyValueManager.GetById(saved.id);
	}

	public static async GetById(
		id: string
	): Promise<StandartKeyValueEntity | undefined> {
		const result = this.addRelations(
			getRepository(StandartKeyValueEntity).createQueryBuilder("norm")
		)
			.where({ id })
			.getOne();

		return result;
	}
}
