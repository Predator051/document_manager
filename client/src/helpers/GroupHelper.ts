import {
	Group,
	GroupTrainingType,
	MRSType,
	ConstripAppeal,
} from "../types/group";

const shortTrainingTypeName: Map<GroupTrainingType, string> = new Map<
	GroupTrainingType,
	string
>();
shortTrainingTypeName.set(GroupTrainingType.OTHER, "Інше");
shortTrainingTypeName.set(GroupTrainingType.OPERATIVE_RESERVE, "О");
shortTrainingTypeName.set(GroupTrainingType.COURSE, "Курс");
shortTrainingTypeName.set(GroupTrainingType.PROFESSIONAL_CONTRACT, "К");
shortTrainingTypeName.set(GroupTrainingType.PROFESSIONAL_SERGEANTS, "Б");
shortTrainingTypeName.set(GroupTrainingType.PROGESSIONAL_CONSCRIPT, "С");

export function GenerateGroupName(gr: Group) {
	let result: string = shortTrainingTypeName.get(gr.trainingType.type);
	result += gr.year.toString().substr(gr.year.toString().length - 1);

	switch (gr.trainingType.type) {
		case GroupTrainingType.PROFESSIONAL_CONTRACT: {
			result += gr.cycle.toString();
			break;
		}
		case GroupTrainingType.PROGESSIONAL_CONSCRIPT: {
			result += gr.appeal === ConstripAppeal.AUTUMN ? "осінь" : "весна";
			break;
		}
		case GroupTrainingType.PROFESSIONAL_SERGEANTS: {
			result += gr.quarter.toString();
			break;
		}
	}

	result += gr.company.toString() + gr.platoon.toString();

	switch (gr.mrs) {
		case MRSType.ASU: {
			result += "АСУ";
			break;
		}
		case MRSType.RZ: {
			result += "РЗ";
			break;
		}
		case MRSType.TS: {
			result += "ТС";
			break;
		}
		case MRSType.ZIKB: {
			result += "ЗІКБ";
			break;
		}
	}

	return result;
}
