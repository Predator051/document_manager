import { getConnection, getRepository, SelectQueryBuilder } from "typeorm";
import { ClassEventEntity } from "../entities/class.event.entity";
import { GroupUserMarkEntity } from "../entities/group.user.mark.entity";
import { GroupUserPresence } from "../types/groupUserPresence";
import { GroupUserPresenceEntity } from "../entities/group.user.presence.entity";

export class DBGroupUserPresenceManager {
	private static addRelations(
		query: SelectQueryBuilder<GroupUserPresenceEntity>
	): SelectQueryBuilder<GroupUserPresenceEntity> {
		// query.leftJoinAndSelect("class.group", "group");
		// query.leftJoinAndSelect("class.selectPath", "selectPath");

		return query;
	}

	public static CreateEmptyEntity(): GroupUserPresenceEntity {
		return getRepository(GroupUserPresenceEntity).create();
	}

	public static async SaveEntity(gr: GroupUserPresenceEntity) {
		const saved = await getRepository(GroupUserPresenceEntity).save(gr);

		return DBGroupUserPresenceManager.GetById(saved.id);
	}

	public static async GetById(
		id: number
	): Promise<GroupUserPresenceEntity | undefined> {
		const result = this.addRelations(
			getRepository(GroupUserPresenceEntity).createQueryBuilder("presence")
		)
			.where({ id })
			.getOne();

		return result;
	}
}
