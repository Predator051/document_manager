import { User } from "../types/user";
import { UserEntity } from "../entities/user.entity";
import { DBUserManager } from "../managers/db_user_manager";
import { RequestCode, RequestMessage } from "../types/requests";
import { DBSessionManager } from "../managers/db_session_manager";
import {
	Group,
	GroupTraining,
	StandartIdByGroupTrainingType,
	GroupTrainingType,
} from "../types/group";
import { DBGroupManager } from "../managers/db_group_manager";
import { CreateEmptyGroup } from "../types/group";
import { GroupUserEntity } from "../entities/group.user.entity";
import { getTreeRepository, getRepository } from "typeorm";
import { SubjectEntity } from "../entities/subject.entity";
import { Subject } from "../types/subject";
import { DBSubjectManager } from "../managers/db_subject_manager";
import { DBSubjectTrainingProgramManager } from "../managers/db_subject_draining_program";
import { DBSubjectTopicManager } from "../managers/db_subject_topic_manager";
import { DBSubjectTopicOccupationManager } from "../managers/db_subject_topic_occupation_manager";
import { ClassEvent } from "../types/classEvent";
import { DBClassManager } from "../managers/db_class_manager";
import { GroupUserPresenceEntity } from "../entities/group.user.presence.entity";
import { DBGroupUserPresenceManager } from "../managers/db_group_user_presence";
import { DBGroupUserMarkManager } from "../managers/db_group_user_mark";
import { SubjectSelectPathEntity } from "../entities/subject.select.path";

export class ClassModel {
	public static async getById(id: number): Promise<RequestMessage<any>> {
		const result = await DBClassManager.GetClassById(id);

		return {
			data: result?.ToRequestObject(),
			messageInfo: `SUCCESS`,
			requestCode: RequestCode.RES_CODE_SUCCESS,
			session: "",
		};
	}

	public static async delete(id: number): Promise<RequestMessage<boolean>> {
		const classEventEntity = await DBClassManager.GetClassById(id);

		if (classEventEntity === undefined) {
			return {
				data: false,
				messageInfo: `class event ${id} does not exist`,
				requestCode: RequestCode.RES_CODE_INTERNAL_ERROR,
				session: "",
			};
		}

		await DBClassManager.Delete(id);
		await getRepository(SubjectSelectPathEntity).delete(
			classEventEntity.selectPath.id
		);

		return {
			data: true,
			messageInfo: `SUCCESS`,
			requestCode: RequestCode.RES_CODE_SUCCESS,
			session: "",
		};
	}

	public static async getMyClasses({
		session,
		data: { year },
	}: RequestMessage<{ year: number }>): Promise<RequestMessage<ClassEvent[]>> {
		const userSessionEntity = await DBSessionManager.GetSession(session);
		if (userSessionEntity === undefined) {
			return {
				data: [],
				messageInfo: `CANNOT GET USER`,
				requestCode: RequestCode.RES_CODE_INTERNAL_ERROR,
				session: "",
			};
		}

		const result = await DBClassManager.GetClassesByUserId(
			userSessionEntity.user.id,
			year
		);

		return {
			data: result.map((classEvent) => classEvent.ToRequestObject()),
			messageInfo: `SUCCESS`,
			requestCode: RequestCode.RES_CODE_SUCCESS,
			session: "",
		};
	}

	public static async getClassesByUser(
		request: RequestMessage<{ userId: number; year: number }>
	): Promise<RequestMessage<ClassEvent[]>> {
		const userSessionEntity = await DBUserManager.GetUserById(
			request.data.userId
		);
		if (userSessionEntity === undefined) {
			return {
				data: [],
				messageInfo: `CANNOT GET USER`,
				requestCode: RequestCode.RES_CODE_INTERNAL_ERROR,
				session: "",
			};
		}

		const result = await DBClassManager.GetClassesByUserId(
			request.data.userId,
			request.data.year
		);

		return {
			data: result.map((classEvent) => classEvent.ToRequestObject()),
			messageInfo: `SUCCESS`,
			requestCode: RequestCode.RES_CODE_SUCCESS,
			session: "",
		};
	}

	public static async getClassesByGroupAndSubject(
		request: RequestMessage<{
			groupId: number;
			subjectId: number;
			userId: number;
		}>
	): Promise<RequestMessage<ClassEvent[]>> {
		const result = await DBClassManager.GetClassesByGroupIdSubjectIdAndUserId(
			request.data.groupId,
			request.data.subjectId,
			request.data.userId
		);

		return {
			data: result.map((classEvent) => classEvent.ToRequestObject()),
			messageInfo: `SUCCESS`,
			requestCode: RequestCode.RES_CODE_SUCCESS,
			session: "",
		};
	}

	public static async getClassesByGroup(
		request: RequestMessage<{
			groupId: number;
			year: number;
		}>
	): Promise<RequestMessage<ClassEvent[]>> {
		const result = await DBClassManager.GetClassesByGroupId(
			request.data.groupId,
			request.data.year
		);

		return {
			data: result.map((classEvent) => classEvent.ToRequestObject()),
			messageInfo: `SUCCESS`,
			requestCode: RequestCode.RES_CODE_SUCCESS,
			session: "",
		};
	}

	public static async create({
		data,
		session,
	}: RequestMessage<ClassEvent>): Promise<RequestMessage<any>> {
		const newClassEntity = DBClassManager.CreateEmptyClassEventEntity();

		const userEntity = await DBSessionManager.GetSession(session);
		if (userEntity === undefined) {
			return {
				data: [],
				messageInfo: `CANNOT GET USER`,
				requestCode: RequestCode.RES_CODE_INTERNAL_ERROR,
				session: "",
			};
		}

		newClassEntity.date = new Date(data.date);
		newClassEntity.hours = data.hours;
		newClassEntity.place = data.place;
		newClassEntity.user = userEntity.user;
		newClassEntity.cycle = userEntity.user.cycle;

		const groupEntity = await DBGroupManager.GetById(data.groupId);

		if (groupEntity) {
			newClassEntity.group = groupEntity;
			const presences: GroupUserPresenceEntity[] = [];
			for (let grUser of groupEntity.users) {
				const presenceEntity = DBGroupUserPresenceManager.CreateEmptyEntity();
				presenceEntity.mark = DBGroupUserMarkManager.CreateEmptyEntity();
				presenceEntity.user = grUser;

				presences.push(presenceEntity);
			}
			newClassEntity.presenses = presences;
		} else {
			return {
				data: {},
				messageInfo: `Cannot find group ${data.groupId}`,
				requestCode: RequestCode.RES_CODE_INTERNAL_ERROR,
				session: "",
			};
		}

		const subjectSelectPath = DBSubjectManager.CreateEmptySubjectSelectPathEntity();
		subjectSelectPath.occupation = data.selectPath.occupation;
		subjectSelectPath.programTraining = data.selectPath.programTraining;
		subjectSelectPath.subject = data.selectPath.subject;
		subjectSelectPath.topic = data.selectPath.topic;
		newClassEntity.selectPath = subjectSelectPath;

		const result = await DBClassManager.SaveClassEventEntity(newClassEntity);

		if (result === undefined) {
			return {
				data: {},
				messageInfo: `Cannot create class`,
				requestCode: RequestCode.RES_CODE_INTERNAL_ERROR,
				session: "",
			};
		}

		return {
			data: result.ToRequestObject(),
			messageInfo: `SUCCESS`,
			requestCode: RequestCode.RES_CODE_SUCCESS,
			session: "",
		};
	}

	public static async update(
		inputClass: ClassEvent
	): Promise<RequestMessage<any>> {
		let newClassEntity = await DBClassManager.GetClassById(inputClass.id);

		if (newClassEntity === undefined) {
			newClassEntity = DBClassManager.CreateEmptyClassEventEntity();
		}

		newClassEntity.date = new Date(inputClass.date);
		newClassEntity.hours = inputClass.hours;
		newClassEntity.place = inputClass.place;

		for (let inputPresence of inputClass.presences) {
			const presenceEntity = newClassEntity.presenses.find(
				(pr) => pr.id === inputPresence.id
			);
			if (presenceEntity) {
				presenceEntity.type = inputPresence.type;
				presenceEntity.mark.current = inputPresence.mark.current;
				presenceEntity.mark.subject = inputPresence.mark.subject;
				presenceEntity.mark.topic = inputPresence.mark.topic;
			}
		}

		const result = await DBClassManager.SaveClassEventEntity(newClassEntity);

		if (result === undefined) {
			return {
				data: {},
				messageInfo: `Cannot create class`,
				requestCode: RequestCode.RES_CODE_INTERNAL_ERROR,
				session: "",
			};
		}

		return {
			data: result.ToRequestObject(),
			messageInfo: `SUCCESS`,
			requestCode: RequestCode.RES_CODE_SUCCESS,
			session: "",
		};
	}
}
