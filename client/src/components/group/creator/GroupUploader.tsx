import { UploadOutlined } from "@ant-design/icons";
import Parser from "@gregoranders/csv";
import { Button, message, Upload } from "antd";
import { RcFile } from "antd/lib/upload/interface";
import React, { useState } from "react";

import { GroupUser } from "../../../types/groupUser";

export class GroupUserFileParser {
	public parser: Parser<any>;

	constructor(fileText: string) {
		this.parser = new Parser<any>();
		this.parser.parse(fileText);
	}

	public checkFields(): boolean {
		const userGroupFields = ["fullname", "rank", "birthday", "education"];
		debugger;
		for (const field of userGroupFields) {
			if (!this.parser.rows[0].some((value) => value === field)) {
				return false;
			}
		}
		return true;
	}

	public toArray(): GroupUser[] {
		let groupUsers: GroupUser[] = [];

		for (const jsObj of this.parser.json) {
			groupUsers.push({
				birthday: jsObj.birthday,
				education: jsObj.education,
				fullname: jsObj.fullname,
				rank: jsObj.rank,
				groupId: 0,
				id: Math.random() * (100000 - 1) + 1,
			});
		}

		return groupUsers;
	}
}

export interface GroupUserUploaderProps {
	onLoaded: (gu: GroupUser[]) => void;
}

export const GroupUserUploader: React.FC<GroupUserUploaderProps> = (
	props: GroupUserUploaderProps
) => {
	const [fileList, updateFileList] = useState([]);
	const uploadProps = {
		fileList,
		beforeUpload: (file: RcFile) => {
			if (file.type !== "text/csv") {
				message.error(`${file.name} це не csv файл`);
			}

			file.text().then((value) => {
				const parser = new GroupUserFileParser(value);
				message.info("Файл завантажено");
				if (!parser.checkFields()) {
					message.error("Файл не містить потрібних стовпчиків (полей)");
					return;
				}
				props.onLoaded(parser.toArray());
			});
			return file.type === "text/csv";
		},
	};

	return (
		<div>
			<Upload
				{...uploadProps}
				showUploadList={false}
				customRequest={(value: any) => {}}
			>
				<Button icon={<UploadOutlined />}>Завантажити список з *.csv</Button>
			</Upload>
		</div>
	);
};
