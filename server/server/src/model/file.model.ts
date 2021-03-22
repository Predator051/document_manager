import { RequestCode, RequestMessage } from "../types/requests";
import { DBClassFileManager } from "../managers/db_class_file_manager";
import { ClassFile } from "../types/classFile";
import { ClassFileEntity } from "../entities/class.file.entity";
import { DBSubjectTopicOccupationManager } from "../managers/db_subject_topic_occupation_manager";

export class FileModel {
	public static async Update(
		class_file: ClassFile
	): Promise<RequestMessage<ClassFile>> {
		let original = await DBClassFileManager.GetById(class_file.id);

		if (!original) {
			original = DBClassFileManager.CreateEmptyClassFileEntity();
		}

		original.filename = class_file.filename;

		original.occupation = await DBSubjectTopicOccupationManager.GetById(
			class_file.occupation
		);

		original = await DBClassFileManager.SaveClassFileEntity(original);

		return {
			data: original.ToRequestObject(),
			messageInfo: `SUCCESS`,
			requestCode: RequestCode.RES_CODE_SUCCESS,
			session: "",
		};
	}

	public static async GetByOccupation(
		occupation: number
	): Promise<RequestMessage<ClassFile[]>> {
		const result = await DBClassFileManager.GetByOccupation(occupation);

		return {
			data: result.map((f) => f.ToRequestObject()),
			messageInfo: `SUCCESS`,
			requestCode: RequestCode.RES_CODE_SUCCESS,
			session: "",
		};
	}

	public static BuildFilePath(file: ClassFile, baseDirname: string) {
		return baseDirname + "/files/" + file.id + file.filename;
	}
}
