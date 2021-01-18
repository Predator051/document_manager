import { User } from "../types/user";
import { UserEntity } from "../entities/user.entity";
import { DBUserManager } from "../managers/db_user_manager";
import { RequestCode, RequestMessage } from "../types/requests";
import { DBSessionManager } from "../managers/db_session_manager";
import { Position } from "../types/position";
import { DBPositionManager } from "../managers/db_position_manager";
import { STANDART_VALUES, STANDART_KEYS } from "../types/constants";

export class PositionModel {
	public static async getAll(): Promise<RequestMessage<Position[]>> {
		const positions = await DBPositionManager.GetAll();

		return {
			data: positions
				.filter(
					(subd) =>
						subd.id !== STANDART_VALUES.get(STANDART_KEYS.STANDART_POSITION) &&
						subd.id !==
							STANDART_VALUES.get(
								STANDART_KEYS.STANDART_SECOND_ADMIN_POSITION
							) &&
						subd.id !==
							STANDART_VALUES.get(STANDART_KEYS.STANDART_VIEWER_POSITION)
				)
				.map((pos) => pos.ToRequestObject()),
			messageInfo: `SUCCESS`,
			requestCode: RequestCode.RES_CODE_SUCCESS,
			session: "",
		};
	}

	public static async update(
		position: Position
	): Promise<RequestMessage<Position | undefined>> {
		let positionEntity = await DBPositionManager.GetById(position.id);
		if (positionEntity === undefined) {
			positionEntity = DBPositionManager.CreateEmptyEntity();
		}

		positionEntity.title = position.title;
		positionEntity.type = position.type;

		const res = await DBPositionManager.SaveEntity(positionEntity);

		return {
			data: res?.ToRequestObject(),
			messageInfo: `SUCCESS`,
			requestCode: RequestCode.RES_CODE_SUCCESS,
			session: "",
		};
	}
}
