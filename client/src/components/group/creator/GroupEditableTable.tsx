import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { Button, Form, Input, Table } from "antd";
import { ColumnsType } from "antd/lib/table/interface";
import moment from "moment";
import React, { useEffect, useState } from "react";

import { GroupUser } from "../../../types/groupUser";
import { ObjectStatus } from "../../../types/constants";

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

const EditableGroupColumns = (
	editable: boolean,
	isCanDelete: boolean,
	onDelete: (guId: number) => void,
	onDeactivate: (guId: number) => void
) => {
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
				return editable && record.data.status === ObjectStatus.NORMAL ? (
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
				return editable && record.data.status === ObjectStatus.NORMAL ? (
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
				return editable && record.data.status === ObjectStatus.NORMAL ? (
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
				return editable && record.data.status === ObjectStatus.NORMAL ? (
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

	if (editable) {
		columns.push({
			title: "Дії",
			dataIndex: "action",
			key: "action",
			render: (current: any, record: EditableGroupTableData) => {
				if (isCanDelete)
					return (
						<Button
							type="link"
							onClick={() => {
								onDelete(record.data.id);
							}}
						>
							Видалити
						</Button>
					);

				// if (record.data.status !== ObjectStatus.NOT_ACTIVE)
				return (
					<Button
						type="link"
						onClick={() => {
							onDeactivate(record.data.id);
						}}
						danger
					>
						{record.data.status !== ObjectStatus.NOT_ACTIVE
							? "Деактивувати"
							: "Активувати"}
					</Button>
				);
			},
		});
	}

	return columns;
};

export interface EditableGroupTableProps {
	userGroups: GroupUser[];
	editUsers: boolean;
	isCanDelete: boolean;
	onDelete: (guId: number) => void;
	onDeactivate: (guId: number) => void;
}

export const EditableGroupTable: React.FC<EditableGroupTableProps> = (
	props: EditableGroupTableProps
) => {
	const tableData: EditableGroupTableData[] = props.userGroups
		.sort((a, b) => a.fullname.localeCompare(b.fullname))
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
				columns={EditableGroupColumns(
					props.editUsers,
					props.isCanDelete,
					props.onDelete,
					props.onDeactivate
				)}
				size="small"
				bordered
				rowClassName={(record, index) => {
					if (record.data.status === ObjectStatus.NOT_ACTIVE)
						return "row_grou-user_deactivate";

					return "";
				}}
			></Table>
		</div>
	);
};
