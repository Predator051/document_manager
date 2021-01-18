import { getRepository, SelectQueryBuilder } from "typeorm";

import { NormEntity } from "../entities/norm.entity";
import { RankEntity } from "../entities/rank.entity";
import { STANDART_VALUES, STANDART_KEYS } from "../types/constants";

export class DBRankManager {
	private static addRelations(
		query: SelectQueryBuilder<RankEntity>
	): SelectQueryBuilder<RankEntity> {
		// query.leftJoinAndSelect("class.selectPath", "selectPath");

		return query;
	}

	public static CreateEmptyEntity(): RankEntity {
		return getRepository(RankEntity).create();
	}

	public static async SaveEntity(gr: RankEntity) {
		const saved = await getRepository(RankEntity).save(gr);

		return DBRankManager.GetById(saved.id);
	}

	public static async GetAll(): Promise<RankEntity[]> {
		const user = this.addRelations(
			getRepository(RankEntity).createQueryBuilder("rank")
		).getMany();

		return user;
	}

	public static async GetStandartSecondAdminRank(): Promise<
		RankEntity | undefined
	> {
		const posId = STANDART_VALUES.get(STANDART_KEYS.STANDART_ADMIN_RANK);

		if (posId === undefined) return undefined;

		return this.GetById(posId);
	}

	public static async GetById(id: number): Promise<RankEntity | undefined> {
		const result = this.addRelations(
			getRepository(RankEntity).createQueryBuilder("rank")
		)
			.where({ id })
			.getOne();

		return result;
	}
}
