import { DBAccountingTeacherManager } from "../managers/db_accounting_teacher";
import { DBSessionManager } from "../managers/db_session_manager";
import { DBUserManager } from "../managers/db_user_manager";
import { AccountingTeacher } from "../types/accountingTeacher";
import { RequestCode, RequestMessage } from "../types/requests";
import { STANDART_VALUES, STANDART_KEYS } from "../types/constants";

export class AccountingTeacherModel {
	public static async getByUserId(
		userId: number,
		year?: number
	): Promise<RequestMessage<AccountingTeacher[]>> {
		const result = await DBAccountingTeacherManager.GetByUserToId(userId, year);

		return {
			data: result.map((a) => a.ToRequestObject()),
			messageInfo: `SUCCESS`,
			requestCode: RequestCode.RES_CODE_SUCCESS,
			session: "",
		};
	}

	public static async update({
		data,
		session,
	}: RequestMessage<AccountingTeacher>): Promise<
		RequestMessage<AccountingTeacher | undefined>
	> {
		const userEntity = await DBSessionManager.GetSession(session);
		if (userEntity === undefined) {
			return {
				data: undefined,
				messageInfo: `CANNOT GET USER`,
				requestCode: RequestCode.RES_CODE_INTERNAL_ERROR,
				session: "",
			};
		}

		let accountingEntity = await DBAccountingTeacherManager.GetById(data.id);

		if (accountingEntity === undefined) {
			accountingEntity = DBAccountingTeacherManager.CreateEmptyEntity();
		}

		accountingEntity.content = data.content;
		accountingEntity.date = data.date;
		accountingEntity.fromPosition = data.fromPosition;
		accountingEntity.fromRank = data.fromRank;
		accountingEntity.fromSecondname = data.fromSecondname;

		const userFromEntity = await DBUserManager.GetUserById(data.from.id);
		const userToEntity = await DBUserManager.GetUserById(data.to.id);

		if (userFromEntity === undefined || userToEntity === undefined) {
			return {
				data: undefined,
				messageInfo: `CANNOT GET USER ${data.from.id} OR ${data.to.id}`,
				requestCode: RequestCode.RES_CODE_INTERNAL_ERROR,
				session: "",
			};
		}
		accountingEntity.to = userToEntity;
		accountingEntity.from = userFromEntity;

		const result = await DBAccountingTeacherManager.SaveEntity(
			accountingEntity
		);

		return {
			data: result?.ToRequestObject(),
			messageInfo: `SUCCESS`,
			requestCode: RequestCode.RES_CODE_SUCCESS,
			session: "",
		};
	}
}
