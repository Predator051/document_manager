import { GroupUser } from "./groupUser";
import { ObjectStatus } from "./constants";
import { MRS } from "./mrs";

export enum GroupTrainingType {
	PROFESSIONAL_CONTRACT = "professional_contract",
	PROGESSIONAL_CONSCRIPT = "professiona_conscript",
	COURSE = "course",
	PROFESSIONAL_SERGEANTS = "professional_sergeants",
	OPERATIVE_RESERVE = "operative_reserve",
	OTHER = "other",
}

export const StandartIdByGroupTrainingType = {
	professional_contract: 1,
	professiona_conscript: 2,
	course: 3,
	professional_sergeants: 4,
	operative_reserve: 5,
	other: 6,
	new: 100,
};

export enum ConstripAppeal {
	AUTUMN = "autumn",
	SPRING = "spring",
}

export enum MRSType {
	ASU = "600, 603",
	TS = "403, 460",
	ZIKB = "474",
	RZ = "423",
	POI = "600",
	BIUS = "603",
	RR = "460",
	TLF = "403",
	FPS = "485",
	REM = "769",
	AVT = "790",
	OTHER = "інше",
}

export class GroupTraining {
	id: number;
	content: string;
	type: GroupTrainingType;
}

export class Group {
	id: number;
	year: number;
	cycle: number;
	appeal: ConstripAppeal;
	company: number;
	platoon: number;
	quarter: number;
	trainingType: GroupTraining;
	mrs: MRS;
	users: GroupUser[];
	status: ObjectStatus;
}

export function TrainingTypeToString(tt: GroupTrainingType) {
	switch (tt) {
		case GroupTrainingType.COURSE:
			return "Курсова";
		case GroupTrainingType.OPERATIVE_RESERVE:
			return "ОР";
		case GroupTrainingType.PROFESSIONAL_CONTRACT:
			return "Фахова контрактники";
		case GroupTrainingType.PROFESSIONAL_SERGEANTS:
			return "Сержанти фахової базового рівня";
		case GroupTrainingType.PROGESSIONAL_CONSCRIPT:
			return "Фахова строковики";

		default:
			break;
	}

	return "Інше";
}

export function ConstripAppealToString(tt: ConstripAppeal) {
	switch (tt) {
		case ConstripAppeal.AUTUMN:
			return "осінь";
	}

	return "весна";
}

export function MRSToString(mrst: MRSType) {
	switch (mrst) {
		case MRSType.ASU:
			return "АСУ";
		case MRSType.RZ:
			return "РЗ";
		case MRSType.TS:
			return "ТС";
		case MRSType.ZIKB:
			return "ЗІКБ";
		case MRSType.AVT:
			return "АВТ";
		case MRSType.BIUS:
			return "БІУС";
		case MRSType.FPS:
			return "ФПС";
		case MRSType.POI:
			return "ПОІ";
		case MRSType.REM:
			return "РЕМ";
		case MRSType.RR:
			return "РР";
		case MRSType.TLF:
			return "ТЛФ";
	}

	return "Інше";
}

export function CreateEmptyGroup(): Group {
	return {
		id: 0,
		year: new Date().getFullYear(),
		company: 0,
		cycle: 0,
		platoon: 0,
		trainingType: {
			content: TrainingTypeToString(GroupTrainingType.OTHER),
			id: 0,
			type: GroupTrainingType.OTHER,
		},
		users: [],
		appeal: ConstripAppeal.AUTUMN,
		mrs: {
			id: 0,
			name: "",
			number: "",
			isCanChange: false,
		},
		quarter: 0,
		status: ObjectStatus.NORMAL,
	};
}
