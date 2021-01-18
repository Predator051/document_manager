import { User } from "../types/user";
import { UserEntity } from "../entities/user.entity";
import { DBUserManager } from "../managers/db_user_manager";
import { RequestCode, RequestMessage } from "../types/requests";
import { DBSessionManager } from "../managers/db_session_manager";
import { Position } from "../types/position";
import { DBPositionManager } from "../managers/db_position_manager";
import {
	STANDART_VALUES,
	STANDART_KEYS,
	STANDART_ONE_TIME_TASK,
} from "../types/constants";
import { Rank, RankType } from "../types/rank";
import { DBRankManager } from "../managers/db_rank_manager";
import { DBOneTimeTaskManager } from "../managers/db_one_time_task_manager";
import { DBKeyValueManager } from "../managers/db_key_value_manager";

export class RankModel {
	public static async getAll(): Promise<RequestMessage<Rank[]>> {
		const ranks = await DBRankManager.GetAll();

		return {
			data: ranks.map((pos) => pos.ToRequestObject()),
			messageInfo: `SUCCESS`,
			requestCode: RequestCode.RES_CODE_SUCCESS,
			session: "",
		};
	}

	public static async update(
		rank: Rank
	): Promise<RequestMessage<Rank | undefined>> {
		let positionEntity = await DBRankManager.GetById(rank.id);
		if (positionEntity === undefined) {
			positionEntity = DBRankManager.CreateEmptyEntity();
		}

		positionEntity.title = rank.title;
		positionEntity.type = rank.type;

		const res = await DBRankManager.SaveEntity(positionEntity);

		return {
			data: res?.ToRequestObject(),
			messageInfo: `SUCCESS`,
			requestCode: RequestCode.RES_CODE_SUCCESS,
			session: "",
		};
	}

	public static async CreateStandart(): Promise<void> {
		const task = await DBOneTimeTaskManager.GetById(
			STANDART_ONE_TIME_TASK.CREATE_STANDART_RANKS
		);

		if (task === undefined) {
			const ranks = [
				"працівник ЗСУ",
				"молодший лейтенант",
				"лейтенант",
				"старший лейтенант",
				"капітан",
				"майор",
				"підполковник",
				"полковник",
			];

			for (const rankTitle of ranks) {
				const createdRank = await this.update({
					title: rankTitle,
					type: RankType.STANDART,
					id: 0,
				});
				if (rankTitle === "працівник ЗСУ" && createdRank.data) {
					let rankStandartZSU = await DBKeyValueManager.GetById(
						STANDART_KEYS.STANDART_ADMIN_RANK
					);
					if (rankStandartZSU === undefined) {
						rankStandartZSU = DBKeyValueManager.CreateEmptyEntity();
					}
					rankStandartZSU.id = STANDART_KEYS.STANDART_ADMIN_RANK;
					rankStandartZSU.value = createdRank.data.id;

					await DBKeyValueManager.SaveEntity(rankStandartZSU);
				}
			}

			const emptyTask = DBOneTimeTaskManager.CreateEmptyEntity();
			emptyTask.isFullfilled = true;
			emptyTask.title = "Create standart ranks";
			emptyTask.id = STANDART_ONE_TIME_TASK.CREATE_STANDART_RANKS;
			DBOneTimeTaskManager.SaveEntity(emptyTask);
		}
	}
}
