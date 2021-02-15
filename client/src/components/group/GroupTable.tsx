import { Table, Row } from "antd";
import { ColumnsType } from "antd/lib/table/interface";
import React from "react";
import { GroupUser } from "../../types/groupUser";
import { ExcelExporter } from "../ui/excel-exporter/ExcelExporter";
import { GroupExport } from "../ui/excel-exporter/exporters/GroupExporter";
import { Group } from "../../types/group";

interface EditableCellProps {
	onSave: (newValue: any) => void;
	editComponent: JSX.Element;
	value: any;
}

interface GroupTableData {
	data: GroupUser;
	index: number;
}

const GroupColumns = () => {
	const columns: ColumnsType<any> = [
		{
			title: "№ з/п",
			dataIndex: "number",
			key: "number",
			render: (current: any, record: GroupTableData) => {
				return record.index.toString();
			},
		},
		{
			title: "Прізвище, ім’я та по батькові",
			dataIndex: "fullname",
			key: "fullname",
			render: (current: any, record: GroupTableData) => {
				return <div>{record.data.fullname}</div>;
			},
			sorter: (a: GroupTableData, b: GroupTableData) =>
				a.data.fullname < b.data.fullname ? -1 : 1,
			defaultSortOrder: "ascend",
		},
		{
			title: "Військове звання",
			dataIndex: "rank",
			key: "rank",
			render: (current: any, record: GroupTableData) => {
				return <div>{record.data.rank}</div>;
			},
		},
		{
			title: "День народження",
			dataIndex: "birthday",
			key: "birthday",
			render: (current: any, record: GroupTableData) => {
				return <div>{record.data.birthday}</div>;
			},
		},
		{
			title: "Освіта",
			dataIndex: "education",
			key: "education",
			render: (current: any, record: GroupTableData) => {
				return <div>{record.data.education}</div>;
			},
		},
	];

	return columns;
};

export interface GroupTableProps {
	userGroups: Group;
	title?: (data: any) => React.ReactNode;
}

export const GroupTable: React.FC<GroupTableProps> = (
	props: GroupTableProps
) => {
	const tableData: GroupTableData[] = props.userGroups.users
		.sort((a, b) => (a.fullname < b.fullname ? -1 : 1))
		.map(
			(ug, index) =>
				({
					data: ug,
					index: index + 1,
				} as GroupTableData)
		);

	return (
		<div>
			<Row justify="end">
				<ExcelExporter
					bufferFunction={() => {
						return GroupExport(props.userGroups);
					}}
					fileName={`${props.userGroups.company} рота, ${props.userGroups.platoon} взвод, ВОС ${props.userGroups.mrs.number}`}
				></ExcelExporter>
			</Row>
			<Table
				title={props.title}
				pagination={false}
				rowKey={(gu: GroupTableData) => gu.data.id.toString()}
				dataSource={tableData}
				columns={GroupColumns()}
				size="small"
				bordered
			></Table>
		</div>
	);
};
