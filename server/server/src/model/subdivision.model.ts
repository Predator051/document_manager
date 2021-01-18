import { User } from "../types/user";
import { UserEntity } from "../entities/user.entity";
import { DBUserManager } from "../managers/db_user_manager";
import { RequestCode, RequestMessage } from "../types/requests";
import { DBSessionManager } from "../managers/db_session_manager";
import { Position } from "../types/position";
import { DBPositionManager } from "../managers/db_position_manager";
import { Subdivision } from "../types/subdivision";
import { DBSubjectManager } from "../managers/db_subject_manager";
import { DBSubdivisionManager } from "../managers/db_subdivision_manager";
import { STANDART_VALUES, STANDART_KEYS } from "../types/constants";

export class SubdivisionModel {
	public static async getAll(): Promise<RequestMessage<Subdivision[]>> {
		const subdivisions = await DBSubdivisionManager.GetAll();

		return {
			data: subdivisions
				.filter(
					(subd) =>
						subd.id !==
							STANDART_VALUES.get(STANDART_KEYS.STANDART_SUBDIVISION) &&
						subd.id !==
							STANDART_VALUES.get(
								STANDART_KEYS.STANDART_SECOND_ADMIN_SUBDIVISION
							) &&
						subd.id !==
							STANDART_VALUES.get(STANDART_KEYS.STANDART_VIEWER_SUBDIVISION)
				)
				.map((sub) => sub.ToRequestObject()),
			messageInfo: `SUCCESS`,
			requestCode: RequestCode.RES_CODE_SUCCESS,
			session: "",
		};
	}

	public static async update(
		subdivision: Subdivision
	): Promise<RequestMessage<Subdivision | undefined>> {
		let subdivisionEntity = await DBSubdivisionManager.GetById(subdivision.id);
		if (subdivisionEntity === undefined) {
			subdivisionEntity = DBSubdivisionManager.CreateEmptyEntity();
		}

		subdivisionEntity.title = subdivision.title;

		const res = await DBSubdivisionManager.SaveEntity(subdivisionEntity);

		return {
			data: res?.ToRequestObject(),
			messageInfo: `SUCCESS`,
			requestCode: RequestCode.RES_CODE_SUCCESS,
			session: "",
		};
	}
}
