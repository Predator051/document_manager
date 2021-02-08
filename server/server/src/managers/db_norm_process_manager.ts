import { getConnection, getRepository, SelectQueryBuilder, Raw } from "typeorm";
import { NormProcessEntity } from "../entities/norm.process.entity";
import { getStartEndOfYear } from "../helpers/dateHelper";
import { ObjectStatus } from "../types/constants";

export class DBNormProcessManager {
	private static addRelations(
		query: SelectQueryBuilder<NormProcessEntity>
	): SelectQueryBuilder<NormProcessEntity> {
		query.leftJoinAndSelect("normProcess.user", "user");
		query.leftJoinAndSelect("normProcess.group", "group");
		query.leftJoinAndSelect("group.users", "groupUsers");
		query.leftJoinAndSelect("group.trainingType", "trainingType");
		query.leftJoinAndSelect("normProcess.marks", "marks");
		query.leftJoinAndSelect("marks.norm", "norm");
		query.leftJoinAndSelect("norm.subject", "subject");
		query.leftJoinAndSelect("marks.process", "process");
		query.leftJoinAndSelect("marks.user", "groupUser");

		return query;
	}

	private static getRelations() {
		return [
			"user",
			"group",
			"group.users",
			"group.trainingType",
			"marks",
			"marks.norm",
			"marks.process",
			"marks.user",
		];
	}

	public static CreateEmptyEntity(): NormProcessEntity {
		return getRepository(NormProcessEntity).create();
	}

	public static async SaveEntity(gr: NormProcessEntity) {
		const saved = await getRepository(NormProcessEntity).save(gr);

		return DBNormProcessManager.GetById(saved.id);
	}

	public static async GetById(
		id: number
	): Promise<NormProcessEntity | undefined> {
		const result = this.addRelations(
			getRepository(NormProcessEntity).createQueryBuilder("normProcess")
		)
			.where({ id })
			.getOne();

		return result;
	}

	public static async GetAll(): Promise<NormProcessEntity[]> {
		const result = this.addRelations(
			getRepository(NormProcessEntity).createQueryBuilder("normProcess")
		).getMany();

		return result;
	}

	public static async GetByUserAndGroup(
		userId: number,
		groupId: number,
		year: number
	): Promise<NormProcessEntity[]> {
		const { start, end } = getStartEndOfYear(year);
		const result = this.addRelations(
			getRepository(NormProcessEntity).createQueryBuilder("normProcess")
		)
			.where("user.id = :userId", { userId })
			.andWhere("group.id = :groupId", { groupId })
			.andWhere("(normProcess.date <= :end AND normProcess.date >= :start)", {
				end,
				start,
			});

		// if (year === new Date().getFullYear()) {
		// 	result.andWhere("norm.status = :status", { status: ObjectStatus.NORMAL });
		// }

		// console.log(result.getSql());
		const r = result.getMany();

		return r;
	}

	public static async GetByUser(
		userId: number,
		year: number
	): Promise<NormProcessEntity[]> {
		const { start, end } = getStartEndOfYear(
			year ? year : new Date().getFullYear()
		);

		const result = this.addRelations(
			getRepository(NormProcessEntity).createQueryBuilder("normProcess")
		)
			.where("user.id = :userId", { userId })
			.andWhere("normProcess.date <= :end", { end })
			.andWhere("normProcess.date >= :start", { start });

		if (year === new Date().getFullYear()) {
			result.andWhere("group.status = :status", {
				status: ObjectStatus.NORMAL,
			});
		}

		// console.log(result.getSql());
		const r = result.getMany();

		return r;
	}

	public static async GetByGroup(
		groupId: number,
		year: number
	): Promise<NormProcessEntity[]> {
		const { start, end } = getStartEndOfYear(
			year ? year : new Date().getFullYear()
		);

		const result = this.addRelations(
			getRepository(NormProcessEntity).createQueryBuilder("normProcess")
		)
			.where("group.id = :groupId", { groupId })
			.andWhere("normProcess.date <= :end", { end })
			.andWhere("normProcess.date >= :start", { start });

		// console.log(result.getSql());
		const r = result.getMany();

		return r;
	}

	public static async GetByDateAndUser(
		date: Date,
		userId: number
	): Promise<NormProcessEntity | undefined> {
		// const result = getRepository(NormProcessEntity).findOne({
		// 	relations: this.getRelations(),
		// 	where: [
		// 		{
		// 			date: Raw(
		// 				(alias) =>
		// 					`date_part('year', ${alias}) = ${date.getFullYear()} AND date_part('month', ${alias}) = ${date.getMonth()} AND date_part('day', ${alias}) = ${date.getDate()}`
		// 			),
		// 		},
		// 		// {
		// 		// 	date: Raw(
		// 		// 		(alias) => `date_part('month', ${alias}) = ${date.getMonth()}`
		// 		// 	),
		// 		// },
		// 		// {
		// 		// 	date: Raw(
		// 		// 		(alias) => `date_part('day', ${alias}) = ${date.getDate()}`
		// 		// 	),
		// 		// },
		// 	],
		// });

		const all = this.GetAll();
		const result = (await all).find((p) => {
			const d = new Date(p.date);

			return (
				d.getFullYear() === date.getFullYear() &&
				d.getMonth() === date.getMonth() &&
				d.getDate() === date.getDate() &&
				p.user.id === userId
			);
		});

		console.log("getByDate", (await result)?.id, "date", date);
		const r = result;

		return r;
	}

	public static async GetByUserGroupAndNorm(
		userId: number,
		groupId: number,
		normId: number
	): Promise<NormProcessEntity[]> {
		const result = this.addRelations(
			getRepository(NormProcessEntity).createQueryBuilder("normProcess")
		)
			.where("user.id = :userId", { userId })
			.andWhere("group.id = :groupId", { groupId })
			.andWhere("norm.id = :normId", { normId });

		// console.log(result.getSql());
		const r = result.getMany();

		return r;
	}
}
