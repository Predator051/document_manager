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
import { SubjectEntity } from "../entities/subject.entity";
import { Subject } from "../types/subject";
import { DBSubjectManager } from "../managers/db_subject_manager";
import { DBSubjectTrainingProgramManager } from "../managers/db_subject_draining_program";
import { DBSubjectTopicManager } from "../managers/db_subject_topic_manager";
import { DBSubjectTopicOccupationManager } from "../managers/db_subject_topic_occupation_manager";
import { Norm } from "../types/norm";
import { DBNormManager } from "../managers/db_norm_manager";
import { DBNormProcessManager } from "../managers/db_norm_process_manager";
import { NormProcessEntity } from "../entities/norm.process.entity";
import { NormProcess } from "../types/normProcess";
import { DBNormMarkManager } from "../managers/db_norm_mark_manager";
import e from "express";

export class NormProcessModel {
	public static async getProcessNorm(
		request: RequestMessage<{ gr: Group; date: Date }>
	): Promise<RequestMessage<NormProcess | undefined>> {
		const userEntity = await DBSessionManager.GetSession(request.session);
		if (userEntity === undefined) {
			return {
				data: undefined,
				messageInfo: `CANNOT GET USER`,
				requestCode: RequestCode.RES_CODE_INTERNAL_ERROR,
				session: "",
			};
		}
		const normProcessEntities = await DBNormProcessManager.GetByUserAndGroup(
			userEntity.user.id,
			request.data.gr.id
		);

		const groupEntity = await DBGroupManager.GetById(request.data.gr.id);

		if (!groupEntity) {
			return {
				data: undefined,
				messageInfo: `CANNOT GET GROUP`,
				requestCode: RequestCode.RES_CODE_INTERNAL_ERROR,
				session: "",
			};
		}

		const checkedDate = new Date(request.data.date);
		let result: NormProcessEntity = await DBNormProcessManager.CreateEmptyEntity();
		result.date = checkedDate;
		result.group = groupEntity;
		result.marks = [];
		result.user = userEntity.user;
		result.id = 0;

		for (const iterator of normProcessEntities) {
			const iDate = new Date(iterator.date);
			if (
				iDate.getFullYear() === checkedDate.getFullYear() &&
				iDate.getMonth() === checkedDate.getMonth() &&
				iDate.getDate() === checkedDate.getDate()
			) {
				result = iterator;
				break;
			}
		}

		return {
			data: result.ToRequestObject(),
			messageInfo: `SUCCESS`,
			requestCode: RequestCode.RES_CODE_SUCCESS,
			session: "",
		};
	}

	public static async getProcessNormByUser(
		request: RequestMessage<number>
	): Promise<RequestMessage<NormProcess[]>> {
		const userEntity = await DBUserManager.GetUserById(request.data);
		if (userEntity === undefined) {
			return {
				data: [],
				messageInfo: `CANNOT GET USER`,
				requestCode: RequestCode.RES_CODE_INTERNAL_ERROR,
				session: "",
			};
		}
		const normProcessEntities = await DBNormProcessManager.GetByUser(
			userEntity.id
		);

		return {
			data: normProcessEntities.map((en) => en.ToRequestObject()),
			messageInfo: `SUCCESS`,
			requestCode: RequestCode.RES_CODE_SUCCESS,
			session: "",
		};
	}

	public static async getProcessNormByUserAndGroup(
		request: RequestMessage<{ userId: number; groupId: number }>
	): Promise<RequestMessage<NormProcess[]>> {
		const normProcessEntities = await DBNormProcessManager.GetByUserAndGroup(
			request.data.userId,
			request.data.groupId
		);

		return {
			data: normProcessEntities.map((en) => en.ToRequestObject()),
			messageInfo: `SUCCESS`,
			requestCode: RequestCode.RES_CODE_SUCCESS,
			session: "",
		};
	}

	public static async getProcessNormByNormGroupAndUser(
		request: RequestMessage<{ groupId: number; userId: number; normId: number }>
	): Promise<RequestMessage<NormProcess[]>> {
		const normProcessEntities = await DBNormProcessManager.GetByUserGroupAndNorm(
			request.data.userId,
			request.data.groupId,
			request.data.normId
		);

		return {
			data: normProcessEntities.map((en) => en.ToRequestObject()),
			messageInfo: `SUCCESS`,
			requestCode: RequestCode.RES_CODE_SUCCESS,
			session: "",
		};
	}

	public static async update(
		request: RequestMessage<NormProcess>
	): Promise<RequestMessage<NormProcess | undefined>> {
		const userEntity = await DBSessionManager.GetSession(request.session);
		if (userEntity === undefined) {
			return {
				data: undefined,
				messageInfo: `CANNOT GET USER`,
				requestCode: RequestCode.RES_CODE_INTERNAL_ERROR,
				session: "",
			};
		}

		const groupEntity = await DBGroupManager.GetById(request.data.group.id);

		if (!groupEntity) {
			return {
				data: undefined,
				messageInfo: `CANNOT GET GROUP`,
				requestCode: RequestCode.RES_CODE_INTERNAL_ERROR,
				session: "",
			};
		}

		let normProcessEntity = await DBNormProcessManager.GetByDate(
			new Date(request.data.date)
		);

		if (normProcessEntity === undefined) {
			normProcessEntity = await DBNormProcessManager.GetById(request.data.id);
		}

		if (normProcessEntity === undefined) {
			normProcessEntity = DBNormProcessManager.CreateEmptyEntity();
			normProcessEntity.marks = [];
		}
		// console.log("update normProcess", normProcessEntity);

		normProcessEntity.date = request.data.date;
		normProcessEntity.group = groupEntity;
		normProcessEntity.user = userEntity.user;

		for (const inputNormMark of request.data.marks) {
			let normMarkEntity = await DBNormMarkManager.GetById(inputNormMark.id);
			console.log("got mark", normMarkEntity?.id);

			if (normMarkEntity === undefined) {
				normMarkEntity = DBNormMarkManager.CreateEmptyEntity();

				const normEntity = await DBNormManager.GetById(inputNormMark.normId);
				if (normEntity === undefined) {
					return {
						data: undefined,
						messageInfo: `CANNOT GET NORM ${inputNormMark.normId}`,
						requestCode: RequestCode.RES_CODE_INTERNAL_ERROR,
						session: "",
					};
				}
				normMarkEntity.norm = normEntity;
			}

			let groupUserEntity = await DBGroupManager.GetGroupUserById(
				inputNormMark.userId
			);
			if (groupUserEntity === undefined) {
				return {
					data: undefined,
					messageInfo: `CANNOT GET GROUP USER ${inputNormMark.userId}`,
					requestCode: RequestCode.RES_CODE_INTERNAL_ERROR,
					session: "",
				};
			}

			normMarkEntity.mark = inputNormMark.mark;
			normMarkEntity.user = groupUserEntity;
			if (normMarkEntity.id === 0 || normMarkEntity.id === undefined) {
				normProcessEntity.marks.push(normMarkEntity);
			} else if (normMarkEntity) {
				normMarkEntity = await DBNormMarkManager.SaveEntity(normMarkEntity);
				normProcessEntity.marks = [
					...normProcessEntity.marks.filter((m) => m.id !== normMarkEntity.id),
					normMarkEntity,
				];
				console.log(
					"normMarks",
					normProcessEntity.marks.map((mark) => ({
						id: mark.id,
						mark: mark.mark,
					}))
				);
			}

			// if (normMarkEntity.id !== 0) {
			// 	console.log(
			// 		"save mark",
			// 		normMarkEntity.id,
			// 		"mark",
			// 		normMarkEntity.mark
			// 	);
			// 	const updated = await DBNormMarkManager.SaveEntity(normMarkEntity);
			// 	console.log("updated id", updated?.id, "mark", updated?.mark);
			// }
		}
		console.log("save marks", normProcessEntity.marks);

		let result = await DBNormProcessManager.SaveEntity(normProcessEntity);

		return {
			data: result?.ToRequestObject(),
			messageInfo: `SUCCESS`,
			requestCode: RequestCode.RES_CODE_SUCCESS,
			session: "",
		};
	}
}
