import { getRepository, SelectQueryBuilder } from "typeorm";

import { NormEntity } from "../entities/norm.entity";
import { SubdivisionEntity } from "../entities/subdivision.entity";
import { STANDART_VALUES, STANDART_KEYS } from "../types/constants";

export class DBSubdivisionManager {
	private static addRelations(
		query: SelectQueryBuilder<SubdivisionEntity>
	): SelectQueryBuilder<SubdivisionEntity> {
		// query.leftJoinAndSelect("norm.cycle", "cycle");
		// query.leftJoinAndSelect("norm.subject", "subject");
		// query.leftJoinAndSelect("class.selectPath", "selectPath");

		return query;
	}

	public static CreateEmptyEntity(): SubdivisionEntity {
		return getRepository(SubdivisionEntity).create();
	}

	public static async SaveEntity(gr: SubdivisionEntity) {
		const saved = await getRepository(SubdivisionEntity).save(gr);

		return DBSubdivisionManager.GetById(saved.id);
	}

	public static async GetAll(): Promise<SubdivisionEntity[]> {
		const result = this.addRelations(
			getRepository(SubdivisionEntity).createQueryBuilder("subdivision")
		).getMany();

		return result;
	}

	public static async GetById(
		id: number
	): Promise<SubdivisionEntity | undefined> {
		const result = this.addRelations(
			getRepository(SubdivisionEntity).createQueryBuilder("subdivision")
		)
			.where({ id })
			.getOne();

		return result;
	}

	public static async GetStandartViewerSubdivision(): Promise<
		SubdivisionEntity | undefined
	> {
		const posId = STANDART_VALUES.get(
			STANDART_KEYS.STANDART_VIEWER_SUBDIVISION
		);

		if (posId === undefined) return undefined;

		return this.GetById(posId);
	}

	public static async GetStandartSecondAdminSubdivision(): Promise<
		SubdivisionEntity | undefined
	> {
		const posId = STANDART_VALUES.get(
			STANDART_KEYS.STANDART_SECOND_ADMIN_SUBDIVISION
		);

		if (posId === undefined) return undefined;

		return this.GetById(posId);
	}
}
