import { DBNormManager } from "../managers/db_norm_manager";
import { DBSessionManager } from "../managers/db_session_manager";
import { DBSubjectManager } from "../managers/db_subject_manager";
import { Norm } from "../types/norm";
import { RequestCode, RequestMessage } from "../types/requests";
import { IndividualWork } from "../types/individualWork";
import { DBIndividualWorkManager } from "../managers/db_individual_work";
import { DBUserManager } from "../managers/db_user_manager";
import { DBGroupManager } from "../managers/db_group_manager";

export class IndividualWorkModel {
	public static async getByUser(
		request: RequestMessage<number>
	): Promise<RequestMessage<IndividualWork[]>> {
		const userEntity = await DBUserManager.GetUserById(request.data);
		if (userEntity === undefined) {
			return {
				data: [],
				messageInfo: `CANNOT GET USER`,
				requestCode: RequestCode.RES_CODE_INTERNAL_ERROR,
				session: "",
			};
		}

		const result = await DBIndividualWorkManager.GetByUserId(request.data);

		return {
			data: result.map((work) => work.ToRequestObject()),
			messageInfo: `SUCCESS`,
			requestCode: RequestCode.RES_CODE_SUCCESS,
			session: "",
		};
	}

	public static async update(
		request: RequestMessage<IndividualWork>
	): Promise<RequestMessage<IndividualWork | undefined>> {
		let workEntity = await DBIndividualWorkManager.GetById(request.data.id);

		if (!workEntity) {
			workEntity = DBIndividualWorkManager.CreateEmptyEntity();
		}

		const userEntity = await DBUserManager.GetUserById(request.data.userId);
		if (userEntity === undefined) {
			return {
				data: undefined,
				messageInfo: `FAILURE: CANNOT GET USER ${request.data.userId}`,
				requestCode: RequestCode.RES_CODE_INTERNAL_ERROR,
				session: "",
			};
		}

		workEntity.content = request.data.content;
		workEntity.date = request.data.date;
		workEntity.user = userEntity;
		workEntity.users = [];

		const groupEntity = await DBGroupManager.GetById(request.data.groupId);

		if (!groupEntity) {
			return {
				data: undefined,
				messageInfo: `FAILURE: CANNOT GET GROUP ${request.data.groupId}`,
				requestCode: RequestCode.RES_CODE_INTERNAL_ERROR,
				session: "",
			};
		}

		workEntity.group = groupEntity;

		for (const groupUser of request.data.users) {
			const groupUserEntity = await DBGroupManager.GetGroupUserById(
				groupUser.id
			);

			if (!groupUserEntity) {
				return {
					data: undefined,
					messageInfo: `FAILURE: CANNOT GET GROUP USER ${groupUser.id}`,
					requestCode: RequestCode.RES_CODE_INTERNAL_ERROR,
					session: "",
				};
			}

			workEntity.users.push(groupUserEntity);
		}

		const result = await DBIndividualWorkManager.SaveEntity(workEntity);

		return {
			data: result?.ToRequestObject(),
			messageInfo: `SUCCESS`,
			requestCode: RequestCode.RES_CODE_SUCCESS,
			session: "",
		};
	}
}
