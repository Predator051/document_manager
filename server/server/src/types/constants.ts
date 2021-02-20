export const DEFAULT_NAME_DB_CONNECION: string = "roadmap";
export const SESSION_LENGTH: number = 30;

export enum ObjectStatus {
	NORMAL,
	ARCHIVE,
	DELETE,
	NOT_ACTIVE,
}

export enum STANDART_ONE_TIME_TASK {
	CREATE_STANDART_RANKS,
	CREATE_STANDART_MRS,
}

export enum STANDART_KEYS {
	STANDART_POSITION = "standart_position",
	STANDART_ADMIN = "standart_admin",
	STANDART_SUBDIVISION = "standart_subdivision",
	STANDART_SECOND_ADMIN_SUBDIVISION = "standart_second_admin_subdivision",
	STANDART_VIEWER_SUBDIVISION = "standart_viewer_subdivision",
	STANDART_SECOND_ADMIN_POSITION = "standart_second_admin_position",
	STANDART_VIEWER_POSITION = "standart_viewer_position",
	STANDART_VIEWER = "standart_viewer",
	STANDART_ADMIN_RANK = "standart_admin_rank",
}

export const STANDART_VALUES: Map<STANDART_KEYS, number> = new Map<
	STANDART_KEYS,
	number
>([]);
