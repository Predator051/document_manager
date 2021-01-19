import { User } from "../types/user";
import { UserEntity } from "../entities/user.entity";
import { DBUserManager } from "../managers/db_user_manager";
import { RequestCode, RequestMessage } from "../types/requests";
import { DBSessionManager } from "../managers/db_session_manager";
import {
	Group,
	GroupTraining,
	StandartIdByGroupTrainingType,
	GroupTrainingType,
} from "../types/group";
import { DBGroupManager } from "../managers/db_group_manager";
import { CreateEmptyGroup } from "../types/group";
import { GroupUserEntity } from "../entities/group.user.entity";
import { getTreeRepository } from "typeorm";

export class GroupModel {
	public static async getAllGroups(
		request: RequestMessage<{ year?: number }>
	): Promise<RequestMessage<Group[]>> {
		const groupsEntities = await DBGroupManager.GetAllGroups(request.data.year);

		return {
			data: groupsEntities.map((ge) => ge.ToRequestObject()),
			messageInfo: `SUCCESS`,
			requestCode: RequestCode.RES_CODE_SUCCESS,
			session: "",
		};
	}

	public static async getGroupByIds(
		ids: number[]
	): Promise<RequestMessage<any>> {
		const result: Group[] = [];
		for (const id of ids) {
			const entity = await DBGroupManager.GetById(id);
			if (entity) {
				result.push(entity.ToRequestObject());
			}
		}

		return {
			data: result,
			messageInfo: `SUCCESS`,
			requestCode: RequestCode.RES_CODE_SUCCESS,
			session: "",
		};
	}

	public static async getAllGroupTrainingTypes(): Promise<
		RequestMessage<GroupTraining[]>
	> {
		const resultEntities = await DBGroupManager.GetAllGroupTrainingTypes();

		return {
			data: resultEntities.map((ge) => ge.ToRequestObject()),
			messageInfo: `SUCCESS`,
			requestCode: RequestCode.RES_CODE_SUCCESS,
			session: "",
		};
	}

	public static async createGroup(gr: Group) {
		const newGroupEntity = DBGroupManager.CreateEmptyGroupEntity();
		if (gr.trainingType.id === StandartIdByGroupTrainingType.new) {
			const gttEntity = await DBGroupManager.CreateGroupTrainingType({
				id: (await DBGroupManager.GetGroupTrainingTypeByMaxId()) + 1,
				content: gr.trainingType.content,
				type: GroupTrainingType.OTHER,
			});
			if (gttEntity !== undefined) {
				newGroupEntity.trainingType = gttEntity;
			}
		} else {
			const gttEntity = await DBGroupManager.GetGroupTrainingTypeById(
				gr.trainingType.id
			);
			if (gttEntity !== undefined) {
				newGroupEntity.trainingType = gttEntity;
			}
		}

		const newGroupUserEntities: GroupUserEntity[] = [];
		for (const gu of gr.users) {
			const newGU = DBGroupManager.CreateEmptyGroupUserEntity();
			newGU.birthDay = gu.birthday;
			newGU.education = gu.education;
			newGU.fullname = gu.fullname;
			newGU.rank = gu.rank;
			newGroupUserEntities.push(newGU);
		}

		newGroupEntity.users = newGroupUserEntities;
		newGroupEntity.appeal = gr.appeal;
		newGroupEntity.company = gr.company;
		newGroupEntity.cycle = gr.cycle;
		newGroupEntity.mrs = gr.mrs;
		newGroupEntity.platoon = gr.platoon;
		newGroupEntity.quarter = gr.quarter;
		newGroupEntity.year = gr.year;
		newGroupEntity.status = gr.status;

		DBGroupManager.SaveGroupEntity(newGroupEntity);

		return {
			data: {},
			messageInfo: `SUCCESS`,
			requestCode: RequestCode.RES_CODE_SUCCESS,
			session: "",
		};
	}
}
