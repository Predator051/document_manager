import { getRepository, SelectQueryBuilder } from "typeorm";

import { NormMarkEntity } from "../entities/norm.mark.entity";

export class DBNormMarkManager {
	private static addRelations(
		query: SelectQueryBuilder<NormMarkEntity>
	): SelectQueryBuilder<NormMarkEntity> {
		query.leftJoinAndSelect("normMark.norm", "norm");
		query.leftJoinAndSelect("normMark.user", "groupUser");
		query.leftJoinAndSelect("normMark.process", "process");

		return query;
	}

	public static CreateEmptyEntity(): NormMarkEntity {
		return getRepository(NormMarkEntity).create();
	}

	public static async SaveEntity(gr: NormMarkEntity) {
		const saved = await getRepository(NormMarkEntity).save(gr);

		return DBNormMarkManager.GetById(saved.id);
	}

	public static async GetById(id: number): Promise<NormMarkEntity | undefined> {
		const result = this.addRelations(
			getRepository(NormMarkEntity).createQueryBuilder("normMark")
		)
			.where({ id })
			.getOne();

		return result;
	}
}
