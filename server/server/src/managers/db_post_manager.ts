import { getRepository, SelectQueryBuilder } from "typeorm";
import { PostEntity } from "../entities/post.entity";

export class DBPostManager {
	private static addRelations(
		query: SelectQueryBuilder<PostEntity>
	): SelectQueryBuilder<PostEntity> {
		// query.leftJoinAndSelect("class.selectPath", "selectPath");

		return query;
	}

	public static CreateEmptyEntity(): PostEntity {
		return getRepository(PostEntity).create();
	}

	public static async SaveEntity(gr: PostEntity) {
		const saved = await getRepository(PostEntity).save(gr);

		return DBPostManager.GetById(saved.id);
	}

	public static async GetAll(): Promise<PostEntity[]> {
		const user = this.addRelations(
			getRepository(PostEntity).createQueryBuilder("rank")
		).getMany();

		return user;
	}

	public static async GetById(id: number): Promise<PostEntity | undefined> {
		const result = this.addRelations(
			getRepository(PostEntity).createQueryBuilder("rank")
		)
			.where({ id })
			.getOne();

		return result;
	}
}
