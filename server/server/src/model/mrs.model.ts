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
import { MRSEntity } from "../entities/mrs.entity";
import { DBMRSManager } from "../managers/db_mrs_manager";
import { MRS } from "../types/mrs";

export class MRSModel {
	public static async getAll(): Promise<RequestMessage<MRS[]>> {
		const mrsEntities = await DBMRSManager.GetAll();
		return {
			data: mrsEntities
				.sort((a, b) =>
					a.isCanChange === b.isCanChange ? 0 : a.isCanChange ? -1 : 1
				)
				.map((ge) => ge.ToRequestObject()),
			messageInfo: `SUCCESS`,
			requestCode: RequestCode.RES_CODE_SUCCESS,
			session: "",
		};
	}

	public static async update(
		request: RequestMessage<MRS[]>
	): Promise<RequestMessage<MRS[]>> {
		const result: MRS[] = [];

		for (const inputMrs of request.data) {
			let mrsEntity = await DBMRSManager.GetById(inputMrs.id);

			if (!mrsEntity) {
				mrsEntity = DBMRSManager.CreateEmptyEntity();
			}

			mrsEntity.name = inputMrs.name;
			mrsEntity.number = inputMrs.number;

			const saved = await DBMRSManager.SaveEntity(mrsEntity);

			result.push(saved.ToRequestObject());
		}

		return {
			data: result,
			messageInfo: `SUCCESS`,
			requestCode: RequestCode.RES_CODE_SUCCESS,
			session: "",
		};
	}
}
