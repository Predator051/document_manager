import { getConnection, getRepository, SelectQueryBuilder } from "typeorm";
import { ClassEventEntity } from "../entities/class.event.entity";
import { GroupUserMarkEntity } from "../entities/group.user.mark.entity";
import { GroupUserPresence } from "../types/groupUserPresence";
import { GroupUserPresenceEntity } from "../entities/group.user.presence.entity";

export class DBGroupUserMarkManager {
	private static addRelations(
		query: SelectQueryBuilder<GroupUserMarkEntity>
	): SelectQueryBuilder<GroupUserMarkEntity> {
		// query.leftJoinAndSelect("class.group", "group");
		// query.leftJoinAndSelect("class.selectPath", "selectPath");

		return query;
	}

	public static CreateEmptyEntity(): GroupUserMarkEntity {
		return getRepository(GroupUserMarkEntity).create();
	}

	public static async SaveEntity(gr: GroupUserMarkEntity) {
		const saved = await getRepository(GroupUserMarkEntity).save(gr);

		return DBGroupUserMarkManager.GetById(saved.id);
	}

	public static async GetById(
		id: number
	): Promise<GroupUserMarkEntity | undefined> {
		const result = this.addRelations(
			getRepository(GroupUserMarkEntity).createQueryBuilder("mark")
		)
			.where({ id })
			.getOne();

		return result;
	}
}
