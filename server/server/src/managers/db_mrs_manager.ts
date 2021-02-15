import { getRepository, SelectQueryBuilder } from "typeorm";

import { NormEntity } from "../entities/norm.entity";
import { ObjectStatus, STANDART_ONE_TIME_TASK } from "../types/constants";
import { MRSEntity } from "../entities/mrs.entity";
import { MRSType, MRSToString } from "../types/group";
import { DBOneTimeTaskManager } from "./db_one_time_task_manager";

export class DBMRSManager {
	private static addRelations(
		query: SelectQueryBuilder<MRSEntity>
	): SelectQueryBuilder<MRSEntity> {
		// query.leftJoinAndSelect("class.selectPath", "selectPath");

		return query;
	}

	public static CreateEmptyEntity(): MRSEntity {
		return getRepository(MRSEntity).create();
	}

	public static async SaveEntity(gr: MRSEntity) {
		const saved = await getRepository(MRSEntity).save(gr);

		return DBMRSManager.GetById(saved.id);
	}

	public static async GetById(id: number): Promise<MRSEntity | undefined> {
		const result = this.addRelations(
			getRepository(MRSEntity).createQueryBuilder("mrs")
		)
			.where({ id })
			.getOne();

		return result;
	}

	public static async GetAll(): Promise<MRSEntity[]> {
		const result = this.addRelations(
			getRepository(MRSEntity).createQueryBuilder("mrs")
		).getMany();

		return result;
	}

	public static async CreateStandart() {
		const task = await DBOneTimeTaskManager.GetById(
			STANDART_ONE_TIME_TASK.CREATE_STANDART_MRS
		);

		if (task === undefined) {
			const mrskeys = Object.keys(MRSType);

			for (const item of mrskeys) {
				const itemEnum = MRSType[item as keyof typeof MRSType];
				const newMrsEntity = this.CreateEmptyEntity();
				newMrsEntity.number = itemEnum.toString();
				newMrsEntity.name = MRSToString(itemEnum);

				await this.SaveEntity(newMrsEntity);
			}

			const oneTaskEntity = DBOneTimeTaskManager.CreateEmptyEntity();
			oneTaskEntity.id = STANDART_ONE_TIME_TASK.CREATE_STANDART_MRS;
			oneTaskEntity.isFullfilled = true;
			oneTaskEntity.title = "standart mrs types";

			await DBOneTimeTaskManager.SaveEntity(oneTaskEntity);
		}
	}
}
