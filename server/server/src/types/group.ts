import { GroupUser } from "./groupUser";

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
	mrs: MRSType;
	users: GroupUser[];
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
	}

	return "ЗІКБ";
}

export function CreateEmptyGroup(): Group {
	return {
		id: 0,
		year: 0,
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
		mrs: MRSType.ASU,
		quarter: 0,
	};
}
