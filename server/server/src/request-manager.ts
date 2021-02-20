import { RequestType, RequestMessage, RequestCode } from "./types/requests";
import { UserModel } from "./model/user.model";
import { GroupModel } from "./model/group.model";
import { Group } from "./types/group";
import { SubjectModel } from "./model/subject.model";
import { Subject } from "./types/subject";
import { ClassModel } from "./model/class.model";
import { ClassEvent } from "./types/classEvent";
import { DBUserManager } from "./managers/db_user_manager";
import { DBSessionManager } from "./managers/db_session_manager";
import { NormModel } from "./model/norm.model";
import { Norm } from "./types/norm";
import { NormProcessModel } from "./model/norm.process.model";
import { NormProcess } from "./types/normProcess";
import { getConnection } from "typeorm";
import { IndividualWorkModel } from "./model/individual.work.model";
import { IndividualWork } from "./types/individualWork";
import { PositionModel } from "./model/position.model";
import { SubdivisionModel } from "./model/subdivision.model";
import { Position } from "./types/position";
import { Subdivision } from "./types/subdivision";
import { User } from "./types/user";
import { AccountingTeacherModel } from "./model/accounting.teacher.model";
import { AccountingTeacher } from "./types/accountingTeacher";
import { STANDART_VALUES, STANDART_KEYS } from "./types/constants";
import { RankModel } from "./model/rank.model";
import { Rank } from "./types/rank";
import { MRSModel } from "./model/mrs.model";
import { MRS } from "./types/mrs";

export class RequestManager {
	public static m_sessionSocket: Map<string, string> = new Map<
		string,
		string
	>();

	public static on(socket: SocketIO.Socket, io: SocketIO.Server) {
		socket.use(async (packet: SocketIO.Packet, next: any) => {
			if (packet[1].session !== undefined && packet[0] !== RequestType.LOGIN) {
				const sessionUser = await DBSessionManager.GetSession(
					packet[1].session
				);
				if (sessionUser === undefined) {
					const err = new Error("NOT AUTHORIZED");

					return next(err);
				}
				this.m_sessionSocket.set(packet[1].session, socket.id);
			}
			// packet[1].id = (this.makeid(5) + ":" + this.makeid(8)).toUpperCase();
			console.log("type: ", packet[0], "packet", packet);

			return next();
		});

		socket.on(RequestType.INIT, async (m: RequestMessage<any>) => {
			console.log("[server](message): %s", JSON.stringify(m));

			const result = await UserModel.getUserInfoBySession(m.session);

			socket.emit(RequestType.INIT, result);
		});

		socket.on(RequestType.LOGIN, async (m: RequestMessage<any>) => {
			console.log("[server](message): %s", JSON.stringify(m));

			const response = await UserModel.userLogin(
				m.data.username,
				m.data.password
			);

			socket.emit(RequestType.LOGIN, response);
		});

		socket.on(RequestType.GET_USER_INFO, async (m: RequestMessage<number>) => {
			console.log("[server](message): %s", JSON.stringify(m));

			const response = await UserModel.getUserInfo(m.data);

			socket.emit(RequestType.GET_USER_INFO, response);
		});

		socket.on(
			RequestType.GET_USERS_BY_ID,
			async (m: RequestMessage<number[]>) => {
				console.log("[server](message): %s", JSON.stringify(m));

				const response = await UserModel.getUsersById(m.data);

				socket.emit(RequestType.GET_USERS_BY_ID, response);
			}
		);

		socket.on(
			RequestType.GET_ALL_GROUPS,
			async (m: RequestMessage<{ year?: number }>) => {
				console.log("[server](message): %s", JSON.stringify(m));

				const response = await GroupModel.getAllGroups(m);

				socket.emit(RequestType.GET_ALL_GROUPS, response);
			}
		);

		socket.on(
			RequestType.GET_GROUP_BY_ID,
			async (m: RequestMessage<number[]>) => {
				console.log("[server](message): %s", JSON.stringify(m));

				const response = await GroupModel.getGroupByIds(m.data);

				socket.emit(RequestType.GET_GROUP_BY_ID, response);
			}
		);

		socket.on(RequestType.GET_ALL_GROUPS_TRAINING_TYPES, async (m: any) => {
			console.log("[server](message): %s", JSON.stringify(m));

			const response = await GroupModel.getAllGroupTrainingTypes();

			socket.emit(RequestType.GET_ALL_GROUPS_TRAINING_TYPES, response);
		});

		socket.on(RequestType.CREATE_GROUP, async (m: RequestMessage<Group>) => {
			console.log("[server](message): %s", JSON.stringify(m));

			const response = await GroupModel.createGroup(m.data);

			socket.emit(RequestType.CREATE_GROUP, response);
		});

		socket.on(RequestType.UPDATE_GROUP, async (m: RequestMessage<Group>) => {
			console.log("[server](message): %s", JSON.stringify(m));

			const response = await GroupModel.updateGroup(m.data);

			socket.emit(RequestType.UPDATE_GROUP, response);
		});

		socket.on(
			RequestType.CREATE_CLASS,
			async (m: RequestMessage<ClassEvent>) => {
				console.log("[server](message): %s", JSON.stringify(m));

				const response = await ClassModel.create(m);

				socket.emit(RequestType.CREATE_CLASS, response);
			}
		);

		socket.on(
			RequestType.GET_CLASS_BY_ID,
			async (m: RequestMessage<{ id: number }>) => {
				console.log("[server](message): %s", JSON.stringify(m));

				const response = await ClassModel.getById(m.data.id);

				socket.emit(RequestType.GET_CLASS_BY_ID, response);
			}
		);

		socket.on(
			RequestType.GET_CLASS_BY_GROUP,
			async (
				m: RequestMessage<{
					groupId: number;
					year: number;
				}>
			) => {
				console.log("[server](message): %s", JSON.stringify(m));

				const response = await ClassModel.getClassesByGroup(m);

				socket.emit(RequestType.GET_CLASS_BY_GROUP, response);
			}
		);

		socket.on(
			RequestType.GET_MY_CLASSES,
			async (m: RequestMessage<{ year: number }>) => {
				console.log("[server](message): %s", JSON.stringify(m));

				const response = await ClassModel.getMyClasses(m);

				socket.emit(RequestType.GET_MY_CLASSES, response);
			}
		);

		socket.on(
			RequestType.GET_CLASS_EVENTS_BY_SUBJECT_GROUP_AND_USER,
			async (
				m: RequestMessage<{
					groupId: number;
					subjectId: number;
					userId: number;
				}>
			) => {
				console.log("[server](message): %s", JSON.stringify(m));

				const response = await ClassModel.getClassesByGroupAndSubject(m);

				socket.emit(
					RequestType.GET_CLASS_EVENTS_BY_SUBJECT_GROUP_AND_USER,
					response
				);
			}
		);

		socket.on(
			RequestType.GET_CLASSES_BY_USER,
			async (m: RequestMessage<{ userId: number; year: number }>) => {
				console.log("[server](message): %s", JSON.stringify(m));

				const response = await ClassModel.getClassesByUser(m);

				socket.emit(RequestType.GET_CLASSES_BY_USER, response);
			}
		);

		socket.on(RequestType.GET_ALL_SUBJECTS, async (m: any) => {
			console.log("[server](message): %s", JSON.stringify(m));

			const response = await SubjectModel.getAllSubjects(m);

			socket.emit(RequestType.GET_ALL_SUBJECTS, response);
		});

		socket.on(RequestType.GET_SUBJECTS_BY_USER_CYCLE, async (m: any) => {
			console.log("[server](message): %s", JSON.stringify(m));

			const response = await SubjectModel.getAllSubjectsByUserCycle(m);

			socket.emit(RequestType.GET_SUBJECTS_BY_USER_CYCLE, response);
		});

		socket.on(
			RequestType.GET_SUBJECT_BY_ID,
			async (m: RequestMessage<number[]>) => {
				console.log("[server](message): %s", JSON.stringify(m));

				const response = await SubjectModel.getSubjectById(m.data);

				socket.emit(RequestType.GET_SUBJECT_BY_ID, response);
			}
		);

		socket.on(
			RequestType.UPDATE_SUBJECTS,
			async (m: RequestMessage<Subject[]>) => {
				console.log("[server](message): %s", JSON.stringify(m));

				const response = await SubjectModel.updateSubjects(m);

				socket.emit(RequestType.UPDATE_SUBJECTS, response);
			}
		);

		socket.on(
			RequestType.UPDATE_CLASS,
			async (m: RequestMessage<ClassEvent>) => {
				console.log("[server](message): %s", JSON.stringify(m));

				const response = await ClassModel.update(m.data);

				socket.emit(RequestType.UPDATE_CLASS, response);
			}
		);

		socket.on(RequestType.GET_NORMS, async (m: RequestMessage<any>) => {
			console.log("[server](message): %s", JSON.stringify(m));

			const response = await NormModel.getNorms(m);

			socket.emit(RequestType.GET_NORMS, response);
		});

		socket.on(
			RequestType.GET_NORM_BY_IDS,
			async (m: RequestMessage<number[]>) => {
				console.log("[server](message): %s", JSON.stringify(m));

				const response = await NormModel.getNormByIds(m.data);

				socket.emit(RequestType.GET_NORM_BY_IDS, response);
			}
		);

		socket.on(RequestType.UPDATE_NORMS, async (m: RequestMessage<Norm[]>) => {
			console.log("[server](message): %s", JSON.stringify(m));

			const response = await NormModel.update(m);

			socket.emit(RequestType.UPDATE_NORMS, response);
		});

		socket.on(
			RequestType.GET_NORM_PROCESS_BY_DATE_AND_GROUP,
			async (m: RequestMessage<{ gr: Group; date: Date; year?: number }>) => {
				console.log("[server](message): %s", JSON.stringify(m));

				const response = await NormProcessModel.getProcessNorm(m);

				socket.emit(RequestType.GET_NORM_PROCESS_BY_DATE_AND_GROUP, response);
			}
		);

		socket.on(
			RequestType.GET_NORM_PROCESSES_BY_GROUP_AND_USER,
			async (
				m: RequestMessage<{
					userId: number;
					groupId: number;
					subjectId: number;
					year: number;
				}>
			) => {
				console.log("[server](message): %s", JSON.stringify(m));

				const response = await NormProcessModel.getProcessNormByUserAndGroup(m);

				socket.emit(RequestType.GET_NORM_PROCESSES_BY_GROUP_AND_USER, response);
			}
		);

		socket.on(
			RequestType.GET_NORM_PROCESS_BY_USER,
			async (m: RequestMessage<{ userId: number; year: number }>) => {
				console.log("[server](message): %s", JSON.stringify(m));

				const response = await NormProcessModel.getProcessNormByUser(m);

				socket.emit(RequestType.GET_NORM_PROCESS_BY_USER, response);
			}
		);

		socket.on(
			RequestType.GET_NORM_PROCESSES_BY_GROUP,
			async (m: RequestMessage<{ groupId: number; year: number }>) => {
				console.log("[server](message): %s", JSON.stringify(m));

				const response = await NormProcessModel.getProcessNormByGroup(m);

				socket.emit(RequestType.GET_NORM_PROCESSES_BY_GROUP, response);
			}
		);

		socket.on(
			RequestType.GET_NORM_PROCESSES_BY_NORM_GROUP_AND_USER,
			async (
				m: RequestMessage<{ groupId: number; userId: number; normId: number }>
			) => {
				console.log("[server](message): %s", JSON.stringify(m));

				const response = await NormProcessModel.getProcessNormByNormGroupAndUser(
					m
				);

				socket.emit(
					RequestType.GET_NORM_PROCESSES_BY_NORM_GROUP_AND_USER,
					response
				);
			}
		);

		socket.on(
			RequestType.GET_NORMS_BY_USER_CYCLE,
			async (m: RequestMessage<{ userId: number; year?: number }>) => {
				console.log("[server](message): %s", JSON.stringify(m));

				const response = await NormModel.getNormsByUserCycle(m);

				socket.emit(RequestType.GET_NORMS_BY_USER_CYCLE, response);
			}
		);

		socket.on(
			RequestType.UPDATE_NORM_PROCESS,
			async (m: RequestMessage<NormProcess>) => {
				console.log("[server](message): %s", JSON.stringify(m));

				const response = await NormProcessModel.update(m);

				socket.emit(RequestType.UPDATE_NORM_PROCESS, response);
			}
		);

		socket.on(
			RequestType.UPDATE_INDIVIDUAL_WORK,
			async (m: RequestMessage<IndividualWork>) => {
				console.log("[server](message): %s", JSON.stringify(m));

				const response = await IndividualWorkModel.update(m);

				socket.emit(RequestType.UPDATE_INDIVIDUAL_WORK, response);
			}
		);

		socket.on(
			RequestType.GET_INDIVIDUAL_WORKS_BY_USER,
			async (m: RequestMessage<{ userId: number; year: number }>) => {
				console.log("[server](message): %s", JSON.stringify(m));

				const response = await IndividualWorkModel.getByUser(m);

				socket.emit(RequestType.GET_INDIVIDUAL_WORKS_BY_USER, response);
			}
		);

		socket.on(RequestType.GET_ALL_USERS, async (m: RequestMessage<any>) => {
			console.log("[server](message): %s", JSON.stringify(m));

			const response = await UserModel.getAllUsers();

			socket.emit(RequestType.GET_ALL_USERS, response);
		});

		socket.on(RequestType.GET_ALL_POSITIONS, async (m: RequestMessage<any>) => {
			console.log("[server](message): %s", JSON.stringify(m));

			const response = await PositionModel.getAll();

			socket.emit(RequestType.GET_ALL_POSITIONS, response);
		});

		socket.on(
			RequestType.GET_ALL_SUBDIVISIONS,
			async (m: RequestMessage<any>) => {
				console.log("[server](message): %s", JSON.stringify(m));

				const response = await SubdivisionModel.getAll();

				socket.emit(RequestType.GET_ALL_SUBDIVISIONS, response);
			}
		);

		socket.on(RequestType.GET_ALL_RANKS, async (m: RequestMessage<any>) => {
			console.log("[server](message): %s", JSON.stringify(m));

			const response = await RankModel.getAll();

			socket.emit(RequestType.GET_ALL_RANKS, response);
		});

		socket.on(RequestType.UPDATE_RANK, async (m: RequestMessage<Rank>) => {
			console.log("[server](message): %s", JSON.stringify(m));

			const response = await RankModel.update(m.data);

			socket.emit(RequestType.UPDATE_RANK, response);
		});

		socket.on(
			RequestType.UPDATE_POSITIONS,
			async (m: RequestMessage<Position>) => {
				console.log("[server](message): %s", JSON.stringify(m));

				const response = await PositionModel.update(m.data);

				socket.emit(RequestType.UPDATE_POSITIONS, response);
			}
		);

		socket.on(
			RequestType.UPDATE_SUBDIVISION,
			async (m: RequestMessage<Subdivision>) => {
				console.log("[server](message): %s", JSON.stringify(m));

				const response = await SubdivisionModel.update(m.data);

				socket.emit(RequestType.UPDATE_SUBDIVISION, response);
			}
		);

		socket.on(RequestType.UPDATE_USER, async (m: RequestMessage<User>) => {
			console.log("[server](message): %s", JSON.stringify(m));

			const response = await UserModel.updateUser(m.data);

			socket.emit(RequestType.UPDATE_USER, response);
		});

		socket.on(
			RequestType.GET_ACCOUNTING_TEACHER_BY_USER,
			async (m: RequestMessage<{ userId: number; year: number }>) => {
				console.log("[server](message): %s", JSON.stringify(m));

				const response = await AccountingTeacherModel.getByUserId(
					m.data.userId,
					m.data.year
				);

				socket.emit(RequestType.GET_ACCOUNTING_TEACHER_BY_USER, response);
			}
		);

		socket.on(
			RequestType.UPDATE_ACCOUNTING_TEACHER,
			async (m: RequestMessage<AccountingTeacher>) => {
				console.log("[server](message): %s", JSON.stringify(m));

				const response = await AccountingTeacherModel.update(m);

				socket.emit(RequestType.UPDATE_ACCOUNTING_TEACHER, response);
			}
		);

		socket.on(
			RequestType.GET_STANDART_VALUES,
			async (m: RequestMessage<any>) => {
				console.log("[server](message): %s", JSON.stringify(m));

				const response: RequestMessage<[STANDART_KEYS, number][]> = {
					data: Array.from(STANDART_VALUES),
					messageInfo: "SUCCESS",
					requestCode: RequestCode.RES_CODE_SUCCESS,
					session: "",
				};

				socket.emit(RequestType.GET_STANDART_VALUES, response);
			}
		);

		socket.on(RequestType.GET_ALL_MRS, async (m: RequestMessage<any>) => {
			console.log("[server](message): %s", JSON.stringify(m));

			const response = await MRSModel.getAll();
			socket.emit(RequestType.GET_ALL_MRS, response);
		});

		socket.on(RequestType.UPDATE_MRS, async (m: RequestMessage<MRS[]>) => {
			console.log("[server](message): %s", JSON.stringify(m));

			const response = await MRSModel.update(m);

			socket.emit(RequestType.UPDATE_MRS, response);
		});

		socket.on(
			RequestType.CHECK_GROUP_EXIST,
			async (m: RequestMessage<Group>) => {
				console.log("[server](message): %s", JSON.stringify(m));

				const response = await GroupModel.checkGroupExist(m.data);

				socket.emit(RequestType.CHECK_GROUP_EXIST, response);
			}
		);

		socket.on(
			RequestType.IS_GROUP_HAS_ACTIVITY,
			async (m: RequestMessage<number>) => {
				console.log("[server](message): %s", JSON.stringify(m));

				const response = await GroupModel.isGroupHasActivity(m.data);

				socket.emit(RequestType.IS_GROUP_HAS_ACTIVITY, response);
			}
		);

		socket.on(
			RequestType.DELETE_GROUP_USER,
			async (m: RequestMessage<number>) => {
				console.log("[server](message): %s", JSON.stringify(m));

				const response = await GroupModel.deleteGroupUser(m.data);

				socket.emit(RequestType.DELETE_GROUP_USER, response);
			}
		);

		socket.on("disconnect", () => {
			console.log("Client disconnected");
		});
	}
}
