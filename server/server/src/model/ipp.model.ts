import { DBIPPManager } from "../managers/db_ipp_manager";
import { IPP } from "../types/ipp";
import { RequestCode, RequestMessage } from "../types/requests";

export class IPPModel {
	public static async getAll(): Promise<RequestMessage<IPP[]>> {
		const IPPEntities = await DBIPPManager.GetAll();
		return {
			data: IPPEntities.map((ge) => ge.ToRequestObject()),
			messageInfo: `SUCCESS`,
			requestCode: RequestCode.RES_CODE_SUCCESS,
			session: "",
		};
	}

	public static async update(
		request: RequestMessage<IPP[]>
	): Promise<RequestMessage<IPP[]>> {
		const result: IPP[] = [];

		for (const inputIPP of request.data) {
			let IPPEntity = await DBIPPManager.GetById(inputIPP.id);

			if (!IPPEntity) {
				IPPEntity = DBIPPManager.CreateEmptyEntity();
			}

			IPPEntity.name = inputIPP.name;

			const saved = await DBIPPManager.SaveEntity(IPPEntity);

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
