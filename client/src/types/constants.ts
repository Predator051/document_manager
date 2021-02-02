export const DEFAULT_NAME_DB_CONNECION: string = "roadmap";
export const SESSION_LENGTH: number = 30;

export enum ObjectStatus {
	NORMAL,
	ARCHIVE,
	DELETE,
}

export const ObjectStatusToString = (status: ObjectStatus) => {
	if (status === ObjectStatus.ARCHIVE) {
		return "Не актуально";
	}
	if (status === ObjectStatus.DELETE) {
		return "Видалено";
	}

	return "Використовується";
};

export enum STANDART_KEYS {
	STANDART_POSITION = "standart_position",
	STANDART_ADMIN = "standart_admin",
	STANDART_SUBDIVISION = "standart_subdivision",
	STANDART_SECOND_ADMIN_SUBDIVISION = "standart_second_admin_subdivision",
	STANDART_VIEWER_SUBDIVISION = "standart_viewer_subdivision",
	STANDART_SECOND_ADMIN_POSITION = "standart_second_admin_position",
	STANDART_VIEWER_POSITION = "standart_viewer_position",
	STANDART_VIEWER = "standart_viewer",
}

export const STANDART_VALUES: Map<STANDART_KEYS, number> = new Map<
	STANDART_KEYS,
	number
>([]);
