import { UploadOutlined } from "@ant-design/icons";
import Parser from "@gregoranders/csv";
import { Button, message, Upload } from "antd";
import { RcFile } from "antd/lib/upload/interface";
import React, { useState } from "react";
import "./GroupUploader.css";
import iconv from "iconv-lite";

import { GroupUser } from "../../../types/groupUser";
import { ObjectStatus } from "../../../types/constants";

export class GroupUserFileParser {
	public parser: Parser<any>;
	private userGroupFields = ["fullname", "rank", "birthday", "education"];

	constructor(fileText: string, separator: string) {
		this.parser = new Parser<any>({
			fieldSeparator: separator,
		});
		this.parser.parse(fileText);
	}

	public checkFields(): boolean {
		console.log("rows", this.parser.rows);
		for (const field of this.userGroupFields) {
			if (!this.parser.rows[0].some((value) => value.trim() === field.trim())) {
				return false;
			}
		}
		return true;
	}

	public toArray(): GroupUser[] {
		let groupUsers: GroupUser[] = [];

		const birthDayIndex = this.parser.rows[0].findIndex(
			(f) => f.trim() === this.userGroupFields[2].trim()
		);
		const educationIndex = this.parser.rows[0].findIndex(
			(f) => f.trim() === this.userGroupFields[3].trim()
		);
		const fullnameIndex = this.parser.rows[0].findIndex(
			(f) => f.trim() === this.userGroupFields[0].trim()
		);
		const rankIndex = this.parser.rows[0].findIndex(
			(f) => f.trim() === this.userGroupFields[1].trim()
		);

		for (let index = 1; index < this.parser.rows.length; index++) {
			groupUsers.push({
				birthday: this.parser.rows[index][birthDayIndex],
				education: this.parser.rows[index][educationIndex],
				fullname: this.parser.rows[index][fullnameIndex],
				rank: this.parser.rows[index][rankIndex],
				groupId: 0,
				id: Math.floor(Math.random() * (100000000 - 1) + 10000000),
				status: ObjectStatus.NORMAL,
			});
		}

		return groupUsers;
	}
}

export interface GroupUserUploaderProps {
	onLoaded: (gu: GroupUser[]) => void;
	encoding: string;
	separator: string;
}

export const GroupUserUploader: React.FC<GroupUserUploaderProps> = (
	props: GroupUserUploaderProps
) => {
	const [fileList, updateFileList] = useState([]);
	const uploadProps = {
		fileList,
		beforeUpload: (file: RcFile) => {
			// if (file.type !== "text/csv") {
			// 	message.error({
			// 		content: `${file.name} це не csv файл`,
			// 	});
			// }

			file.text().then((value) => {});
			file.arrayBuffer().then((buffer) => {
				var value = Buffer.alloc(buffer.byteLength);
				var uinf8Array = new Uint8Array(buffer);
				for (let index = 0; index < value.length; index++) {
					value[index] = uinf8Array[index];
				}

				const conv = iconv
					.encode(iconv.decode(value, props.encoding), "utf8")
					.toString();

				const parser = new GroupUserFileParser(conv, props.separator);

				if (!parser.checkFields()) {
					message.error({
						content: "Файл не містить потрібних стовпчиків (полей)",
					});
					return;
				}
				message.info({
					content: "Файл завантажено",
				});
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
