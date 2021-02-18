import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { Button, Form, Input, Table } from "antd";
import { ColumnsType } from "antd/lib/table/interface";
import moment from "moment";
import React, { useEffect, useState } from "react";

import { GroupUser } from "../../../types/groupUser";

interface EditableCellProps {
	onChange: (newValue: any) => void;
	value: string;
}

const EditableCell: React.FC<EditableCellProps> = (
	props: EditableCellProps
) => {
	const [value, setValue] = useState<typeof props.value>(props.value);

	const onFinish = (value: string) => {
		props.onChange(value);
		setValue(value);
	};

	return (
		<div>
			<Input
				bordered={false}
				value={value}
				onChange={({ target: { value } }) => {
					onFinish(value);
				}}
			></Input>
		</div>
	);
};

interface EditableGroupTableData {
	data: GroupUser;
	index: number;
}

const EditableGroupColumns = (editable: boolean) => {
	const columns: ColumnsType<any> = [
		{
			title: "№ з/п",
			dataIndex: "number",
			key: "number",
			render: (current: any, record: EditableGroupTableData) => {
				return record.index.toString();
			},
		},
		{
			title: "Прізвище, ім’я та по батькові",
			dataIndex: "fullname",
			key: "fullname",
			render: (current: any, record: EditableGroupTableData) => {
				return editable ? (
					<EditableCell
						onChange={(value: any) => {
							record.data.fullname = value;
						}}
						value={record.data.fullname}
					></EditableCell>
				) : (
					record.data.fullname
				);
			},
		},
		{
			title: "Військове звання",
			dataIndex: "rank",
			key: "rank",
			render: (current: any, record: EditableGroupTableData) => {
				return editable ? (
					<EditableCell
						onChange={(value: any) => {
							record.data.rank = value;
						}}
						value={record.data.rank}
					></EditableCell>
				) : (
					record.data.rank
				);
			},
		},
		{
			title: "День народження",
			dataIndex: "birthday",
			key: "birthday",
			render: (current: any, record: EditableGroupTableData) => {
				return editable ? (
					<EditableCell
						onChange={(value: any) => {
							record.data.birthday = value;
						}}
						value={record.data.birthday}
					></EditableCell>
				) : (
					record.data.birthday
				);
			},
		},
		{
			title: "Освіта",
			dataIndex: "education",
			key: "education",
			render: (current: any, record: EditableGroupTableData) => {
				return editable ? (
					<EditableCell
						onChange={(value: any) => {
							record.data.education = value;
						}}
						value={record.data.education}
					></EditableCell>
				) : (
					record.data.education
				);
			},
		},
	];

	return columns;
};

export interface EditableGroupTableProps {
	userGroups: GroupUser[];
	editUsers: boolean;
}

export const EditableGroupTable: React.FC<EditableGroupTableProps> = (
	props: EditableGroupTableProps
) => {
	const tableData: EditableGroupTableData[] = props.userGroups
		.sort((a, b) => (a.fullname < b.fullname ? -1 : 1))
		.map(
			(ug, index) =>
				({
					data: ug,
					index: index + 1,
				} as EditableGroupTableData)
		);

	return (
		<div>
			<Table
				pagination={false}
				rowKey={(gu: EditableGroupTableData) => gu.data.id.toString()}
				dataSource={tableData}
				columns={EditableGroupColumns(props.editUsers)}
				size="small"
				bordered
			></Table>
		</div>
	);
};
