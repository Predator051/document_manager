import { getConnection, getRepository, SelectQueryBuilder } from "typeorm";
import { ClassEventEntity } from "../entities/class.event.entity";
import { GroupUserMarkEntity } from "../entities/group.user.mark.entity";

export class DBClassManager {
	private static addRelations(
		query: SelectQueryBuilder<ClassEventEntity>
	): SelectQueryBuilder<ClassEventEntity> {
		query.leftJoinAndSelect("class.group", "group");
		query.leftJoinAndSelect("class.cycle", "cycle");
		query.leftJoinAndSelect("class.user", "user");
		query.leftJoinAndSelect("class.selectPath", "selectPath");
		query.leftJoinAndSelect("class.presenses", "presenses");
		query.leftJoinAndSelect("presenses.mark", "mark");
		query.leftJoinAndSelect("presenses.user", "presensesUser");

		return query;
	}

	public static CreateEmptyClassEventEntity(): ClassEventEntity {
		return getRepository(ClassEventEntity).create();
	}

	public static async SaveClassEventEntity(gr: ClassEventEntity) {
		const saved = await getRepository(ClassEventEntity).save(gr);

		if (gr.presenses) {
			for (let presence of gr.presenses) {
				await getRepository(GroupUserMarkEntity).save(presence.mark);
			}
		}

		return DBClassManager.GetClassById(saved.id);
	}

	public static async GetAllClasses(): Promise<ClassEventEntity[]> {
		const user = this.addRelations(
			getRepository(ClassEventEntity).createQueryBuilder("class")
		).getMany();

		return user;
	}

	public static async GetClassById(
		id: number
	): Promise<ClassEventEntity | undefined> {
		const result = this.addRelations(
			getRepository(ClassEventEntity).createQueryBuilder("class")
		)
			.where({ id })
			.getOne();

		return result;
	}

	public static async GetClassesByUserId(
		id: number
	): Promise<ClassEventEntity[]> {
		const result = this.addRelations(
			getRepository(ClassEventEntity).createQueryBuilder("class")
		)
			.where("user.id = :id", { id })
			.getMany();

		return result;
	}

	public static async GetClassesByGroupId(
		id: number
	): Promise<ClassEventEntity[]> {
		const result = this.addRelations(
			getRepository(ClassEventEntity).createQueryBuilder("class")
		)
			.where("group.id = :id", { id })
			.getMany();

		return result;
	}

	public static async GetClassesByGroupIdSubjectIdAndUserId(
		groupId: number,
		subjectId: number,
		userId: number
	): Promise<ClassEventEntity[]> {
		const result = this.addRelations(
			getRepository(ClassEventEntity).createQueryBuilder("class")
		)
			.where("group.id = :groupId", { groupId })
			.andWhere("selectPath.subject = :subjectId", { subjectId })
			.getMany();

		return result;
	}
}
