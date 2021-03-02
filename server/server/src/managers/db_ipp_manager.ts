import { getRepository, SelectQueryBuilder } from "typeorm";

import { NormEntity } from "../entities/norm.entity";
import { ObjectStatus, STANDART_ONE_TIME_TASK } from "../types/constants";
import { MRSType, MRSToString } from "../types/group";
import { DBOneTimeTaskManager } from "./db_one_time_task_manager";
import { IPPEntity } from "../entities/ipp.entity";

export class DBIPPManager {
	private static addRelations(
		query: SelectQueryBuilder<IPPEntity>
	): SelectQueryBuilder<IPPEntity> {
		// query.leftJoinAndSelect("class.selectPath", "selectPath");

		return query;
	}

	public static CreateEmptyEntity(): IPPEntity {
		return getRepository(IPPEntity).create();
	}

	public static async SaveEntity(gr: IPPEntity) {
		const saved = await getRepository(IPPEntity).save(gr);

		return DBIPPManager.GetById(saved.id);
	}

	public static async GetById(id: number): Promise<IPPEntity | undefined> {
		const result = this.addRelations(
			getRepository(IPPEntity).createQueryBuilder("ipp")
		)
			.where({ id })
			.getOne();

		return result;
	}

	public static async GetAll(): Promise<IPPEntity[]> {
		const result = this.addRelations(
			getRepository(IPPEntity).createQueryBuilder("ipp")
		).getMany();

		return result;
	}

	public static async CreateStandart() {
		const task = await DBOneTimeTaskManager.GetById(
			STANDART_ONE_TIME_TASK.CREATE_STANDART_IPP
		);

		if (task === undefined) {
			const ippkeys = [
				"Управління",
				"ЦК ЗВД",
				"ЦК БІУС",
				"ЦК ЗЗЗ",
				"ЦК РЗ",
				"ЦК ТС",
				"ЦК ЗІКБ",
				"ЦК ПМП",
				"ЦК АВТО",
				"1 НБЗ",
				"2 НБЗ",
				"3 НБЗ",
				"1 НТК",
				"2 НТК",
				"НТК ЗІКБ",
				"ІТВ",
				"НРМЗЗ",
				"ВЗВОД НА",
				"АВТОВЗВОД",
				"ВМЗ",
			];

			for (const item of ippkeys) {
				const newIPPEntity = this.CreateEmptyEntity();
				newIPPEntity.name = item;

				await this.SaveEntity(newIPPEntity);
			}

			const oneTaskEntity = DBOneTimeTaskManager.CreateEmptyEntity();
			oneTaskEntity.id = STANDART_ONE_TIME_TASK.CREATE_STANDART_IPP;
			oneTaskEntity.isFullfilled = true;
			oneTaskEntity.title = "standart ipp types";

			await DBOneTimeTaskManager.SaveEntity(oneTaskEntity);
		}
	}
}
