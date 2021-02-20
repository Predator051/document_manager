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
import { DBMRSManager } from "../managers/db_mrs_manager";
import { ClassModel } from "./class.model";
import { DBClassManager } from "../managers/db_class_manager";
import { DBNormManager } from "../managers/db_norm_manager";
import { DBNormProcessManager } from "../managers/db_norm_process_manager";
import { DBIndividualWorkManager } from "../managers/db_individual_work";
import { ObjectStatus } from "../types/constants";
import { DBGroupUserPresenceManager } from "../managers/db_group_user_presence";
import { DBGroupUserMarkManager } from "../managers/db_group_user_mark";

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

	public static async isGroupHasActivity(
		id: number
	): Promise<RequestMessage<boolean>> {
		let result: boolean = true;

		const classes = await DBClassManager.GetClassesByGroupId(id);

		if (classes.length <= 0) {
			const currYear = new Date().getFullYear();
			const normProcess = [
				...(await DBNormProcessManager.GetByGroup(id, currYear)),
				...(await DBNormProcessManager.GetByGroup(id, currYear - 1)),
			];

			if (normProcess.length <= 0) {
				const indWors = await DBIndividualWorkManager.GetByGroupId(id);

				if (indWors.length <= 0) {
					result = false;
				}
			}
		}

		return {
			data: result,
			messageInfo: `SUCCESS`,
			requestCode: RequestCode.RES_CODE_SUCCESS,
			session: "",
		};
	}

	public static async checkGroupExist(
		group: Group
	): Promise<RequestMessage<[boolean, Group | undefined]>> {
		try {
			console.log("group", group);
			console.log("mrs", group.mrs);

			const [isExist, groupEntity] = await DBGroupManager.IsExist(group);

			return {
				data: [isExist, groupEntity?.ToRequestObject()],
				messageInfo: `SUCCESS`,
				requestCode: RequestCode.RES_CODE_SUCCESS,
				session: "",
			};
		} catch (e) {
			console.error(e);

			return {
				data: [false, undefined],
				messageInfo: `ERROR`,
				requestCode: RequestCode.RES_CODE_INTERNAL_ERROR,
				session: "",
			};
		}
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

	public static async deleteGroupUser(
		id: number
	): Promise<RequestMessage<boolean>> {
		return {
			data: await DBGroupManager.deleteGroupUser(id),
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

		const mrsEntity = await DBMRSManager.GetById(gr.mrs.id);
		newGroupEntity.mrs = mrsEntity;

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

	public static async updateGroup(gr: Group) {
		let newGroupEntity = await DBGroupManager.GetById(gr.id);

		if (newGroupEntity === undefined) {
			newGroupEntity = DBGroupManager.CreateEmptyGroupEntity();
		}

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
			newGU.id = gu.id;
			newGroupUserEntities.push(newGU);
		}

		newGroupEntity.users = newGroupUserEntities;
		newGroupEntity.appeal = gr.appeal;
		newGroupEntity.company = gr.company;
		newGroupEntity.cycle = gr.cycle;

		const mrsEntity = await DBMRSManager.GetById(gr.mrs.id);
		newGroupEntity.mrs = mrsEntity;

		newGroupEntity.platoon = gr.platoon;
		newGroupEntity.quarter = gr.quarter;
		newGroupEntity.year = gr.year;
		newGroupEntity.status = gr.status;

		const allGroupClasses = await DBClassManager.GetClassesByGroupId(
			newGroupEntity.id
		);

		const saved = await DBGroupManager.SaveGroupEntity(newGroupEntity);
		if (saved) {
			const updatedGroup = await DBGroupManager.GetById(saved.id);

			for (const groupUser of updatedGroup.users) {
				if (groupUser.status === ObjectStatus.NORMAL) {
					for (const classEvent of allGroupClasses) {
						const presense = classEvent.presenses.find(
							(pr) => pr.user.id === groupUser.id
						);

						if (!presense) {
							const presenceEntity = DBGroupUserPresenceManager.CreateEmptyEntity();
							presenceEntity.mark = DBGroupUserMarkManager.CreateEmptyEntity();
							presenceEntity.user = groupUser;

							classEvent.presenses.push(presenceEntity);
							await DBClassManager.SaveClassEventEntity(classEvent);
							console.log("saved new presenses", presenceEntity);
						}
					}
				}
			}
		} else {
			return {
				data: {},
				messageInfo: `CANNOT SAVE GROUP BY ID ${newGroupEntity.id}`,
				requestCode: RequestCode.RES_CODE_INTERNAL_ERROR,
				session: "",
			};
		}

		return {
			data: {},
			messageInfo: `SUCCESS`,
			requestCode: RequestCode.RES_CODE_SUCCESS,
			session: "",
		};
	}
}
