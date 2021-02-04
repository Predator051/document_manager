import { User, UserType } from "../types/user";
import { UserEntity } from "../entities/user.entity";
import { DBUserManager } from "../managers/db_user_manager";
import { RequestCode, RequestMessage } from "../types/requests";
import { DBSessionManager } from "../managers/db_session_manager";
import { STANDART_VALUES, STANDART_KEYS } from "../types/constants";
import { DBPositionManager } from "../managers/db_position_manager";
import { DBSubdivisionManager } from "../managers/db_subdivision_manager";
import { PositionModel } from "./position.model";
import { PositionEntity } from "../entities/position.entity";
import { DBRankManager } from "../managers/db_rank_manager";
import { RankEntity } from "../entities/rank.entity";
import { RankModel } from "./rank.model";

export class UserModel {
	public static async userLogin(
		userLogin: string,
		userPassword: string
	): Promise<RequestMessage<User>> {
		const userEntity = await DBUserManager.GetUser(userLogin);
		if (userEntity !== undefined) {
			if (userEntity.password !== userPassword) {
				return {
					data: User.EmptyUser(),
					messageInfo: `Пароль чи логін не правильний`,
					requestCode: RequestCode.RES_CODE_INTERNAL_ERROR,
					session: "",
				};
			}
			const user = userEntity.ToRequestObject();
			const session = await DBSessionManager.CreateSession(user);
			user.session = session;
			return {
				data: user,
				messageInfo: "OK",
				requestCode:
					user.login === userPassword
						? RequestCode.RES_CODE_EQUAL_PASSWORD_AND_LOGIN
						: RequestCode.RES_CODE_SUCCESS,
				session: "",
			};
		}
		return {
			data: User.EmptyUser(),
			messageInfo: `cannot find a user ${userLogin}`,
			requestCode: RequestCode.RES_CODE_INTERNAL_ERROR,
			session: "",
		};
	}

	public static async getUserInfo(
		userId: number
	): Promise<RequestMessage<User>> {
		const userEntity = await DBUserManager.GetUserById(userId);
		if (userEntity !== undefined) {
			const user = userEntity.ToRequestObject();
			return {
				data: user,
				messageInfo: "OK",
				requestCode: RequestCode.RES_CODE_SUCCESS,
				session: "",
			};
		}
		return {
			data: User.EmptyUser(),
			messageInfo: `cannot find a user ${userId}`,
			requestCode: RequestCode.RES_CODE_INTERNAL_ERROR,
			session: "",
		};
	}

	public static async getUsersById(
		userIds: number[]
	): Promise<RequestMessage<User[]>> {
		const users: UserEntity[] = [];
		for (const id of userIds) {
			const userEntity = await DBUserManager.GetUserById(id);

			if (userEntity === undefined) {
				return {
					data: [],
					messageInfo: `Cannot get user by id ${id}`,
					requestCode: RequestCode.RES_CODE_SUCCESS,
					session: "",
				};
			}
			users.push(userEntity);
		}
		return {
			data: users.map((u) => u.ToRequestObject()),
			messageInfo: "OK",
			requestCode: RequestCode.RES_CODE_SUCCESS,
			session: "",
		};
	}

	public static async getAllUsers(): Promise<RequestMessage<User[]>> {
		const userEntity = await DBUserManager.GetAll();

		return {
			data: userEntity
				.filter(
					(subd) =>
						subd.id !== STANDART_VALUES.get(STANDART_KEYS.STANDART_ADMIN)
				)
				.map((u) => u.ToRequestObject()),
			messageInfo: "OK",
			requestCode: RequestCode.RES_CODE_SUCCESS,
			session: "",
		};
	}

	public static async getUserInfoBySession(
		session: string
	): Promise<RequestMessage<User>> {
		const userEntity = await DBUserManager.GetUserBySession(session);
		if (userEntity !== undefined) {
			const user = userEntity.ToRequestObject();
			user.session = session;
			return {
				data: user,
				messageInfo: "OK",
				requestCode:
					user.login === user.password
						? RequestCode.RES_CODE_EQUAL_PASSWORD_AND_LOGIN
						: RequestCode.RES_CODE_SUCCESS,
				session: "",
			};
		}
		return {
			data: User.EmptyUser(),
			messageInfo: `cannot find a user ${session}`,
			requestCode: RequestCode.RES_CODE_INTERNAL_ERROR,
			session: "",
		};
	}

	public static async updateUser(
		user: User
	): Promise<RequestMessage<User | undefined>> {
		let userEntity = await DBUserManager.GetUserById(user.id);

		if (userEntity === undefined) {
			userEntity = await DBUserManager.CreateEmptyEntity();
		}

		userEntity.firstName = user.firstName;
		userEntity.secondName = user.secondName;
		userEntity.login = user.login;
		userEntity.password =
			user.password === "" ? userEntity.password : user.password;
		userEntity.userType = user.userType;

		if (user.userType === UserType.TEACHER) {
			const positionEntity = await DBPositionManager.GetById(user.position.id);
			const subdivisionEntity = await DBSubdivisionManager.GetById(
				user.cycle.id
			);
			const rankEntity = await DBRankManager.GetById(user.rank.id);

			if (positionEntity && subdivisionEntity && rankEntity) {
				userEntity.position = positionEntity;
				userEntity.cycle = subdivisionEntity;
				userEntity.rank = rankEntity;
			}
		} else if (user.userType === UserType.ADMIN) {
			const positionEntity = await DBPositionManager.GetStandartSecondAdminPosition();
			const subdivisionEntity = await DBSubdivisionManager.GetStandartSecondAdminSubdivision();
			const rankEntity = await DBRankManager.GetStandartSecondAdminRank();

			if (positionEntity && subdivisionEntity && rankEntity) {
				userEntity.position = positionEntity;
				userEntity.cycle = subdivisionEntity;
				userEntity.rank = rankEntity;
			}
		} else if (user.userType === UserType.VIEWER) {
			let positionEntity: PositionEntity | undefined = undefined;

			let created = await PositionModel.update(user.position);
			if (created.data) {
				positionEntity = await DBPositionManager.GetById(created.data.id);
			}

			let rankEntity: RankEntity | undefined = undefined;

			let createdRank = await RankModel.update(user.rank);
			if (createdRank.data) {
				rankEntity = await DBRankManager.GetById(createdRank.data.id);
			}

			const subdivisionEntity = await DBSubdivisionManager.GetStandartViewerSubdivision();

			if (positionEntity && subdivisionEntity && rankEntity) {
				userEntity.position = positionEntity;
				userEntity.cycle = subdivisionEntity;
				userEntity.rank = rankEntity;
			}
		}

		const res = await DBUserManager.Save(userEntity);

		return {
			data: res?.ToRequestObject(),
			messageInfo: `SUCCESS`,
			requestCode: RequestCode.RES_CODE_SUCCESS,
			session: "",
		};
	}

	public static async isSessionValid(session: string) {}
}
