import { getConnection, getRepository, SelectQueryBuilder } from "typeorm";
import { ClassFileEntity } from "../entities/class.file.entity";

export class DBClassFileManager {
	private static addRelations(
		query: SelectQueryBuilder<ClassFileEntity>
	): SelectQueryBuilder<ClassFileEntity> {
		query.leftJoinAndSelect("file.occupation", "occupation");

		return query;
	}

	public static CreateEmptyClassFileEntity(): ClassFileEntity {
		return getRepository(ClassFileEntity).create();
	}

	public static async GetById(
		id: number
	): Promise<ClassFileEntity | undefined> {
		const result = this.addRelations(
			getRepository(ClassFileEntity).createQueryBuilder("file")
		)
			.where({ id })
			.getOne();

		return result;
	}

	public static async SaveClassFileEntity(gr: ClassFileEntity) {
		const saved = await getRepository(ClassFileEntity).save(gr);

		return DBClassFileManager.GetById(saved.id);
	}

	public static async GetByOccupation(
		occupation_id: number
	): Promise<ClassFileEntity[]> {
		const result = this.addRelations(
			getRepository(ClassFileEntity).createQueryBuilder("file")
		).where("occupation.id = :id", { id: occupation_id });

		return result.getMany();
	}
}
