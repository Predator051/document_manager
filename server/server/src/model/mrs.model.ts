import { DBMRSManager } from "../managers/db_mrs_manager";
import { MRS } from "../types/mrs";
import { RequestCode, RequestMessage } from "../types/requests";

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
