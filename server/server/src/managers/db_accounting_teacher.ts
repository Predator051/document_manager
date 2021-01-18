import { getRepository, SelectQueryBuilder } from "typeorm";

import { NormEntity } from "../entities/norm.entity";
import { AccountingEntity } from "../entities/accounting.teacher.entity";

export class DBAccountingTeacherManager {
	private static addRelations(
		query: SelectQueryBuilder<AccountingEntity>
	): SelectQueryBuilder<AccountingEntity> {
		query.leftJoinAndSelect("accounting.from", "from");
		query.leftJoinAndSelect("from.cycle", "fromCycle");
		query.leftJoinAndSelect("from.position", "fromPosition");
		query.leftJoinAndSelect("from.rank", "fromRank");
		query.leftJoinAndSelect("accounting.to", "to");
		query.leftJoinAndSelect("to.cycle", "toCycle");
		query.leftJoinAndSelect("to.position", "toPosition");
		query.leftJoinAndSelect("to.rank", "toRank");
		// query.leftJoinAndSelect("class.selectPath", "selectPath");

		return query;
	}

	public static CreateEmptyEntity(): AccountingEntity {
		return getRepository(AccountingEntity).create();
	}

	public static async SaveEntity(gr: AccountingEntity) {
		const saved = await getRepository(AccountingEntity).save(gr);

		return DBAccountingTeacherManager.GetById(saved.id);
	}

	public static async GetById(
		id: number
	): Promise<AccountingEntity | undefined> {
		const result = this.addRelations(
			getRepository(AccountingEntity).createQueryBuilder("accounting")
		)
			.where({ id })
			.getOne();

		return result;
	}

	public static async GetByUserToId(id: number): Promise<AccountingEntity[]> {
		const result = this.addRelations(
			getRepository(AccountingEntity).createQueryBuilder("accounting")
		)
			.where("to.id = :toId", { toId: id })
			.getMany();

		return result;
	}
}
