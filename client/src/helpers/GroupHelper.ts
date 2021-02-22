import { GroupUser } from "../types/groupUser";
import { GroupUserPresence } from "../types/groupUserPresence";
import { NormProcess } from "../types/normProcess";
import {
	Group,
	GroupTrainingType,
	MRSType,
	ConstripAppeal,
} from "../types/group";
import { ObjectStatus } from "../types/constants";

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

	result +=
		(gr.company !== 0 ? gr.company.toString() : "") +
		(gr.platoon !== 0 ? gr.platoon.toString() : "");
	result += gr.mrs.name;

	return result;
}

export function IsHasGroupUserMark(
	groupUser: GroupUser,
	presence?: GroupUserPresence,
	normProcess?: NormProcess
) {
	let hasByPresence: boolean = false;
	let hasByNormProcess: boolean = false;

	if (presence) {
		hasByPresence =
			presence.mark.current !== 0 ||
			presence.mark.topic !== 0 ||
			presence.mark.subject !== 0;
	}

	if (normProcess) {
		const guMark = normProcess.marks.find((m) => m.userId === groupUser.id);

		if (guMark) {
			hasByNormProcess = guMark.mark !== 0;
		} else {
			hasByNormProcess = false;
		}
	}

	return presence && normProcess
		? hasByPresence && hasByNormProcess
		: presence
		? hasByPresence
		: normProcess
		? hasByNormProcess
		: false;
}

export function IsHasDeactivateGroupUserMark(
	groupUser: GroupUser,
	presence?: GroupUserPresence,
	normProcess?: NormProcess
) {
	if (groupUser.status !== ObjectStatus.NOT_ACTIVE) {
		return true;
	}

	return IsHasGroupUserMark(groupUser, presence, normProcess);
}
