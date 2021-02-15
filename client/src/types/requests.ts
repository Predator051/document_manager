export enum RequestType {
	MESSAGE = "message",
	LOGIN = "login",
	INIT = "init",
	GET_ALL_GROUPS = "get_all_groups",
	GET_ALL_GROUPS_TRAINING_TYPES = "get_all_groups_training_types",
	CREATE_GROUP = "create_group",
	GET_ALL_SUBJECTS = "get_all_subjects",
	UPDATE_SUBJECTS = "update_subjects",
	CREATE_CLASS = "create_class",
	GET_CLASS_BY_ID = "get_class_by_id",
	GET_GROUP_BY_ID = "get_group_by_id",
	GET_SUBJECT_BY_ID = "get_subject_by_id",
	UPDATE_CLASS = "update_class",
	GET_MY_CLASSES = "get_my_classes",
	GET_NORMS = "get_norms",
	UPDATE_NORMS = "update_norms",
	GET_NORM_PROCESS_BY_DATE_AND_GROUP = "get_norm_process_by_date_and_group",
	UPDATE_NORM_PROCESS = "update_norm_process",
	GET_USER_INFO = "get_user_info",
	GET_CLASSES_BY_USER = "get_classes_by_user",
	GET_NORM_PROCESS_BY_USER = "get_norm_process_by_user",
	GET_SUBJECTS_BY_USER_CYCLE = "get_subjects_by_user_cycle",
	GET_NORMS_BY_USER_CYCLE = "get_norms_by_user_cycle",
	GET_CLASS_EVENTS_BY_SUBJECT_GROUP_AND_USER = "get_class_events_by_subject_group_and_user",
	GET_NORM_PROCESSES_BY_NORM_GROUP_AND_USER = "get_norm_processes_by_norm_group_and_user",
	GET_NORM_BY_IDS = "get_norm_by_ids",
	GET_NORM_PROCESSES_BY_GROUP_AND_USER = "get_norm_processes_by_group_and_user",
	GET_INDIVIDUAL_WORKS_BY_USER = "get_individual_works_by_user",
	UPDATE_INDIVIDUAL_WORK = "update_individual_work",
	GET_ALL_POSITIONS = "get_all_positions",
	UPDATE_POSITIONS = "update_positions",
	GET_ALL_SUBDIVISIONS = "get_all_subdivisions",
	UPDATE_SUBDIVISION = "update_subdivision",
	GET_ALL_USERS = "get_all_users",
	UPDATE_USER = "update_user",
	GET_CLASS_BY_GROUP = "get_class_by_group",
	GET_ACCOUNTING_TEACHER_BY_USER = "get_accounting_teacher_by_user",
	UPDATE_ACCOUNTING_TEACHER = "update_accounting_teacher",
	GET_STANDART_VALUES = "get_standart_values",
	GET_ALL_RANKS = "get_all_ranks",
	UPDATE_RANK = "update_rank",
	UPDATE_GROUP = "update_group",
	GET_NORM_PROCESSES_BY_GROUP = "get_norm_processes_by_group",
	GET_USERS_BY_ID = "get_users_by_ids",
	GET_ALL_MRS = "get_all_mrs",
	UPDATE_MRS = "update_mrs",
	CHECK_GROUP_EXIST = "check_group_exist",
}

export enum RequestCode {
	RES_CODE_SUCCESS = 200,
	RES_CODE_INTERNAL_ERROR = 1,
	RES_CODE_NOT_AUTHORIZED = 2,
	RES_CODE_EQUAL_PASSWORD_AND_LOGIN = 3,
}

export class RequestMessage<T> {
	constructor(messageInfo: string, requestCode: RequestCode, data: T) {
		this.data = data;
		this.messageInfo = messageInfo;
		this.requestCode = requestCode;
	}
	messageInfo: string;
	requestCode: RequestCode;
	data: T;
	session: string;
}
