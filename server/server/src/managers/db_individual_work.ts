import { getRepository, SelectQueryBuilder } from "typeorm";

import { NormMarkEntity } from "../entities/norm.mark.entity";
import { IndividualWorkEntity } from "../entities/individual.work.entity";
import { getStartEndOfYear } from "../helpers/dateHelper";

export class DBIndividualWorkManager {
	private static addRelations(
		query: SelectQueryBuilder<IndividualWorkEntity>
	): SelectQueryBuilder<IndividualWorkEntity> {
		query.leftJoinAndSelect("work.users", "users");
		query.leftJoinAndSelect("work.user", "user");
		query.leftJoinAndSelect("work.group", "group");

		return query;
	}

	public static CreateEmptyEntity(): IndividualWorkEntity {
		return getRepository(IndividualWorkEntity).create();
	}

	public static async SaveEntity(gr: IndividualWorkEntity) {
		const saved = await getRepository(IndividualWorkEntity).save(gr);

		return DBIndividualWorkManager.GetById(saved.id);
	}

	public static async GetById(
		id: number
	): Promise<IndividualWorkEntity | undefined> {
		const result = this.addRelations(
			getRepository(IndividualWorkEntity).createQueryBuilder("work")
		)
			.where({ id })
			.getOne();

		return result;
	}

	public static async GetByUserId(
		userId: number,
		year?: number
	): Promise<IndividualWorkEntity[]> {
		const { start, end } = getStartEndOfYear(year);
		const result = this.addRelations(
			getRepository(IndividualWorkEntity).createQueryBuilder("work")
		).where("user.id = :userId", { userId });

		if (year) {
			result.andWhere("(work.date <= :end AND work.date >= :start)", {
				end,
				start,
			});
		}

		return result.getMany();
	}

	public static async GetByGroupId(
		groupId: number
	): Promise<IndividualWorkEntity[]> {
		const result = this.addRelations(
			getRepository(IndividualWorkEntity).createQueryBuilder("work")
		).where("group.id = :groupId", { groupId: groupId });

		return result.getMany();
	}
}
