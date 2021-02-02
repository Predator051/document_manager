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

export class NormModel {
	public static async getNorms(
		request: RequestMessage<{ year?: number }>
	): Promise<RequestMessage<Norm[]>> {
		const userEntity = await DBSessionManager.GetSession(request.session);
		if (userEntity === undefined) {
			return {
				data: [],
				messageInfo: `CANNOT GET USER`,
				requestCode: RequestCode.RES_CODE_INTERNAL_ERROR,
				session: "",
			};
		}
		const normEntities = await DBNormManager.GetByCycle(
			userEntity.user.cycle.id,
			request.data.year
		);
		return {
			data: normEntities.map((ge) => ge.ToRequestObject()),
			messageInfo: `SUCCESS`,
			requestCode: RequestCode.RES_CODE_SUCCESS,
			session: "",
		};
	}

	public static async getNormsByUserCycle(
		request: RequestMessage<{ userId: number; year?: number }>
	): Promise<RequestMessage<Norm[]>> {
		//TODO
		const userEntity = await DBUserManager.GetUserById(request.data.userId);
		if (userEntity === undefined) {
			return {
				data: [],
				messageInfo: `CANNOT GET USER ${request.data.userId}`,
				requestCode: RequestCode.RES_CODE_INTERNAL_ERROR,
				session: "",
			};
		}
		const normEntities = await DBNormManager.GetByCycle(
			userEntity.cycle ? userEntity.cycle.id : 0,
			request.data.year
		);

		return {
			data: normEntities.map((ge) => ge.ToRequestObject()),
			messageInfo: `SUCCESS`,
			requestCode: RequestCode.RES_CODE_SUCCESS,
			session: "",
		};
	}

	public static async getNormByIds(
		ids: number[]
	): Promise<RequestMessage<Norm[]>> {
		const result: Norm[] = [];

		for (let id of ids) {
			const normEntity = await DBNormManager.GetById(id);
			if (normEntity !== undefined) {
				result.push(normEntity.ToRequestObject());
			}
		}

		return {
			data: result,
			messageInfo: `SUCCESS`,
			requestCode: RequestCode.RES_CODE_SUCCESS,
			session: "",
		};
	}

	public static async update(
		request: RequestMessage<Norm[]>
	): Promise<RequestMessage<Norm[]>> {
		const result: Norm[] = [];

		const userEntity = await DBSessionManager.GetSession(request.session);
		if (userEntity === undefined) {
			return {
				data: [],
				messageInfo: `CANNOT GET USER`,
				requestCode: RequestCode.RES_CODE_INTERNAL_ERROR,
				session: "",
			};
		}
		for (let norm of request.data) {
			let normEntity = await DBNormManager.GetById(norm.id);
			if (normEntity === undefined) {
				normEntity = await DBNormManager.CreateEmptyEntity();
				normEntity.cycle = userEntity.user.cycle;
			}
			if (normEntity === undefined) {
				normEntity = await DBNormManager.CreateEmptyEntity();
				normEntity.cycle = userEntity.user.cycle;
			}

			const subjectEntity = await DBSubjectManager.GetById(norm.subjectId);
			if (subjectEntity === undefined) {
				return {
					data: [],
					messageInfo: `CANNOT GET SUBJECT ${norm.subjectId}`,
					requestCode: RequestCode.RES_CODE_INTERNAL_ERROR,
					session: "",
				};
			}

			normEntity.content = norm.content;
			normEntity.excellent = norm.excellent;
			normEntity.good = norm.good;
			normEntity.number = norm.number;
			normEntity.satisfactory = norm.satisfactory;
			normEntity.subject = subjectEntity;
			normEntity.status = norm.status;

			const saveResult = await DBNormManager.SaveEntity(normEntity);
			if (saveResult) {
				result.push(saveResult.ToRequestObject());
			}
		}

		return {
			data: result,
			messageInfo: `SUCCESS`,
			requestCode: RequestCode.RES_CODE_SUCCESS,
			session: "",
		};
	}
}
