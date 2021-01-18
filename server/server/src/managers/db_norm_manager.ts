import { getRepository, SelectQueryBuilder } from "typeorm";

import { NormEntity } from "../entities/norm.entity";

export class DBNormManager {
	private static addRelations(
		query: SelectQueryBuilder<NormEntity>
	): SelectQueryBuilder<NormEntity> {
		query.leftJoinAndSelect("norm.cycle", "cycle");
		query.leftJoinAndSelect("norm.subject", "subject");
		// query.leftJoinAndSelect("class.selectPath", "selectPath");

		return query;
	}

	public static CreateEmptyEntity(): NormEntity {
		return getRepository(NormEntity).create();
	}

	public static async SaveEntity(gr: NormEntity) {
		const saved = await getRepository(NormEntity).save(gr);

		return DBNormManager.GetById(saved.id);
	}

	public static async GetById(id: number): Promise<NormEntity | undefined> {
		const result = this.addRelations(
			getRepository(NormEntity).createQueryBuilder("norm")
		)
			.where({ id })
			.getOne();

		return result;
	}

	public static async GetByCycle(cycleId: number): Promise<NormEntity[]> {
		const result = this.addRelations(
			getRepository(NormEntity).createQueryBuilder("norm")
		)
			.where("cycle.id = :cycleId", { cycleId })
			.getMany();

		return result;
	}
}
