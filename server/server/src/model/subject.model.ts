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
import { getTreeRepository } from "typeorm";
import { SubjectEntity } from "../entities/subject.entity";
import { Subject } from "../types/subject";
import { DBSubjectManager } from "../managers/db_subject_manager";
import { DBSubjectTrainingProgramManager } from "../managers/db_subject_draining_program";
import { DBSubjectTopicManager } from "../managers/db_subject_topic_manager";
import { DBSubjectTopicOccupationManager } from "../managers/db_subject_topic_occupation_manager";

export class SubjectModel {
	public static async getAllSubjects({
		session,
	}: RequestMessage<Subject[]>): Promise<RequestMessage<Subject[]>> {
		const userEntity = await DBSessionManager.GetSession(session);
		if (userEntity === undefined) {
			return {
				data: [],
				messageInfo: `CANNOT GET USER`,
				requestCode: RequestCode.RES_CODE_INTERNAL_ERROR,
				session: "",
			};
		}
		const subjectsEntities = await DBSubjectManager.GetByCycle(
			userEntity.user.cycle.id
		);

		return {
			data: subjectsEntities.map((ge) => ge.ToRequestObject()),
			messageInfo: `SUCCESS`,
			requestCode: RequestCode.RES_CODE_SUCCESS,
			session: "",
		};
	}

	public static async getAllSubjectsByUserCycle(
		request: RequestMessage<{ userId: number; year: number }>
	): Promise<RequestMessage<Subject[]>> {
		const userEntity = await DBUserManager.GetUserById(request.data.userId);
		if (userEntity === undefined) {
			return {
				data: [],
				messageInfo: `CANNOT GET USER`,
				requestCode: RequestCode.RES_CODE_INTERNAL_ERROR,
				session: "",
			};
		}
		const subjectsEntities = await DBSubjectManager.GetByCycle(
			userEntity.cycle.id,
			request.data.year
		);

		return {
			data: subjectsEntities.map((ge) => ge.ToRequestObject()),
			messageInfo: `SUCCESS`,
			requestCode: RequestCode.RES_CODE_SUCCESS,
			session: "",
		};
	}

	public static async getSubjectById(
		ids: number[]
	): Promise<RequestMessage<Subject[]>> {
		const result: Subject[] = [];

		for (let id of ids) {
			const subj = await DBSubjectManager.GetById(id);
			if (subj !== undefined) {
				result.push(subj.ToRequestObject());
			}
		}

		return {
			data: result,
			messageInfo: `SUCCESS`,
			requestCode: RequestCode.RES_CODE_SUCCESS,
			session: "",
		};
	}

	public static async updateSubjects({
		data,
		session,
	}: RequestMessage<Subject[]>): Promise<RequestMessage<Subject[]>> {
		const subjectsEntities: SubjectEntity[] = [];
		const userEntity = await DBSessionManager.GetSession(session);
		if (userEntity === undefined) {
			return {
				data: [],
				messageInfo: `CANNOT GET USER`,
				requestCode: RequestCode.RES_CODE_INTERNAL_ERROR,
				session: "",
			};
		}
		for (let inputSubject of data) {
			let subjectEntity = await DBSubjectManager.GetById(inputSubject.id);
			if (!subjectEntity) {
				subjectEntity = DBSubjectManager.CreateEmptySubjectEntity();
			}
			subjectEntity.fullTitle = inputSubject.fullTitle;
			subjectEntity.shortTitle = inputSubject.shortTitle;
			subjectEntity.status = inputSubject.status;
			subjectEntity.cycle = userEntity.user.cycle;

			for (let inputTrainingProgram of inputSubject.programTrainings) {
				let tpEntity = await DBSubjectTrainingProgramManager.GetById(
					inputTrainingProgram.id
				);
				if (!tpEntity) {
					tpEntity = DBSubjectTrainingProgramManager.CreateEmptyTrainingProgramEntity();
				}
				tpEntity.title = inputTrainingProgram.title;

				for (let inputTopic of inputTrainingProgram.topics) {
					let topicEntity = await DBSubjectTopicManager.GetById(inputTopic.id);
					if (!topicEntity) {
						topicEntity = DBSubjectTopicManager.CreateEmptyTopicEntity();
					}
					topicEntity.number = inputTopic.number;
					topicEntity.title = inputTopic.title;

					for (let inputOccupation of inputTopic.occupation) {
						let occupationEntity = await DBSubjectTopicOccupationManager.GetById(
							inputOccupation.id
						);

						if (!occupationEntity) {
							occupationEntity = DBSubjectTopicOccupationManager.CreateEmptyOccupationEntity();
						}

						occupationEntity.number = inputOccupation.number;
						occupationEntity.title = inputOccupation.title;

						topicEntity.occupations.push(occupationEntity);
					}

					tpEntity.topics.push(topicEntity);
				}

				subjectEntity.trainingPrograms.push(tpEntity);
			}
			let resultSubjectEntity = await DBSubjectManager.Save(subjectEntity);
			if (resultSubjectEntity !== undefined) {
				subjectsEntities.push(resultSubjectEntity);
			}
		}

		return {
			data: subjectsEntities.map((ge) => ge.ToRequestObject()),
			messageInfo: `SUCCESS`,
			requestCode: RequestCode.RES_CODE_SUCCESS,
			session: "",
		};
	}
}
