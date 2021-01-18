import { UserEntity } from "../entities/user.entity";
import { getConnection, getRepository, SelectQueryBuilder } from "typeorm";
import { DEFAULT_NAME_DB_CONNECION } from "../types/constants";
import { User } from "../types/user";
import { UserSessionEntity } from "../entities/session.entity";
import { DBManager } from "./db_manager";

export class DBUserManager {
	private static addRelations(
		query: SelectQueryBuilder<UserEntity>
	): SelectQueryBuilder<UserEntity> {
		query.leftJoinAndSelect("user.cycle", "cycle");
		query.leftJoinAndSelect("user.position", "position");
		query.leftJoinAndSelect("user.rank", "rank");

		return query;
	}

	public static async CreateUser(user: User) {
		await (await DBManager.get())
			.getConnection()
			.getRepository(UserEntity)
			.save({
				login: user.login,
				password: user.password,
			});
	}

	public static async CreateEmptyEntity() {
		return getRepository(UserEntity).create();
	}

	public static async Save(user: UserEntity) {
		const saved = await getRepository(UserEntity).save(user);

		return this.GetUserById(saved.id);
	}

	public static async GetUser(login: string): Promise<UserEntity | undefined> {
		const user = this.addRelations(
			getRepository(UserEntity).createQueryBuilder("user")
		)
			.where("user.login = :login", { login })
			.getOne();
		return user;
	}

	public static async GetUserById(id: number): Promise<UserEntity | undefined> {
		const user = this.addRelations(
			getRepository(UserEntity).createQueryBuilder("user")
		)
			.where("user.id = :id", { id })
			.getOne();
		return user;
	}

	public static async GetAll(): Promise<UserEntity[]> {
		const user = this.addRelations(
			getRepository(UserEntity).createQueryBuilder("user")
		).getMany();
		return user;
	}

	public static async GetUserBySession(
		session: string
	): Promise<UserEntity | undefined> {
		const sessionEntity = await getRepository(UserSessionEntity)
			.createQueryBuilder("session")
			.leftJoinAndSelect("session.user", "user")
			.where("session.session = :session", { session })
			.getOne();

		console.log("passed", sessionEntity);

		return this.addRelations(
			getRepository(UserEntity).createQueryBuilder("user")
		)
			.where("user.id = :id", { id: sessionEntity?.user.id })
			.getOne();
	}
}
