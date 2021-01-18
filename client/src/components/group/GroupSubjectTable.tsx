import React from "react";
import { Table, Tag, Popover, Row, Typography, Empty } from "antd";
import { ColumnsType, ColumnType } from "antd/lib/table/interface";
import { GroupUser } from "../../types/groupUser";
import { Group } from "../../types/group";
import { Subject } from "../../types/subject";
import { ClassEvent } from "../../types/classEvent";
import {
	GroupUserPresence,
	UserPresenceType,
} from "../../types/groupUserPresence";

interface EditableCellProps {
	onSave: (newValue: any) => void;
	editComponent: JSX.Element;
	value: any;
}

interface GroupTableData {
	data: GroupUser;
	index: number;
}

export interface GroupSubjectTableProps {
	// userGroups: GroupUser[];
	title?: (data: any[]) => React.ReactNode;
	group: Group;
	subject: Subject;
	classEvents: ClassEvent[];
}

export const PresenceShower: React.FC<{
	presence: GroupUserPresence;
}> = (props: { presence: GroupUserPresence }) => {
	let actualMark: number = 0;
	let color: string = "";
	let content: string = "Оцінка за заняття";
	if (props.presence.mark.subject !== 0) {
		actualMark = props.presence.mark.subject;
		color = "#cd201f";
		content = "Ітогова оцінка за предмет навчання";
	} else if (props.presence.mark.topic !== 0) {
		actualMark = props.presence.mark.topic;
		color = "#108ee9";
		content = "Ітогова оцінка за тему";
	} else {
		actualMark = props.presence.mark.current;
		if (props.presence.mark.current === 0) {
			content = "Не має оцінки";
		}
	}

	let presenceSym = "";
	switch (props.presence.type) {
		case UserPresenceType.BUSSINESS_TRIP:
			presenceSym = "вд";
			content += "; відрядження";
			break;
		case UserPresenceType.OUTFIT:
			presenceSym = "н";
			content += "; наряд";
			break;
		case UserPresenceType.SICK:
			presenceSym = "х";
			content += "; хворий";
			break;
		case UserPresenceType.VACATION:
			presenceSym = "в";
			content += "; відпустка";
			break;
		default:
			presenceSym = "";
			break;
	}

	return (
		<Popover content={content}>
			<Row style={{ width: "100%" }}>
				{/* {&& <Tag color={color}>{actualMark}</Tag>} */}
				{actualMark !== 0 ? (
					<div>
						<Typography.Text style={{ color: color }} strong>
							{actualMark}
						</Typography.Text>{" "}
						{presenceSym}
					</div>
				) : (
					<Typography.Text>{presenceSym}</Typography.Text>
				)}
			</Row>
		</Popover>
	);
};

export const GroupSubjectTable: React.FC<GroupSubjectTableProps> = (
	props: GroupSubjectTableProps
) => {
	const tableData: GroupTableData[] = props.group.users
		.sort((a, b) => (a.fullname < b.fullname ? -1 : 1))
		.map(
			(ug, index) =>
				({
					data: ug,
					index: index,
				} as GroupTableData)
		);

	const columns: ColumnsType<any> = [
		{
			title: "№ з/п",
			key: "number",
			dataIndex: "number",
			render: (value, record: GroupTableData) => {
				return <div>{record.index}</div>;
			},
			fixed: "left",
			width: "max-content",
			ellipsis: true,
		},
		{
			title: "Прізвище, ім’я та по батькові",
			key: "fullname",
			dataIndex: "fullname",
			render: (value, record: GroupTableData) => {
				return <div>{record.data.fullname}</div>;
			},
			fixed: "left",
			width: "max-content",
			ellipsis: true,
		},
		{
			title: "Дата, присутність, успішність",
			key: "data",
			align: "center",
			dataIndex: "data",
			width: "max-content",
			ellipsis: true,
			children: [
				...props.classEvents
					.filter((classEvent) => {
						return classEvent.presences.some(
							(presence) =>
								presence.mark.current !== 0 ||
								presence.mark.topic !== 0 ||
								presence.mark.subject !== 0
						);
					})
					.map((classEvent) => {
						return {
							title: classEvent.date.toLocaleDateString("uk", {
								year: "2-digit",
								month: "2-digit",
								day: "2-digit",
							}),
							key: classEvent.date.toLocaleDateString(),
							dataIndex: classEvent.date.toLocaleDateString(),
							align: "center",
							width: "max-content",
							render: (value, record: GroupTableData) => {
								const presence = classEvent.presences.find(
									(pr) => pr.userId === record.data.id
								);

								return (
									<div>
										<PresenceShower presence={presence}></PresenceShower>
									</div>
								);
							},
						} as ColumnType<any>;
					}),
			],
		},
	];

	// const isHasData =
	// 	props.classEvents.filter((classEvent) => {
	// 		return classEvent.presences.some(
	// 			(presence) =>
	// 				presence.mark.current !== 0 ||
	// 				presence.mark.topic !== 0 ||
	// 				presence.mark.subject !== 0
	// 		);
	// 	}).length > 0;

	// if (!isHasData) {
	// 	return <Empty description="Не має даних"></Empty>;
	// }

	return (
		<div>
			<Table
				title={props.title}
				pagination={false}
				rowKey={(gu: GroupTableData) => gu.data.id.toString()}
				dataSource={tableData}
				columns={columns}
				size="middle"
				bordered
				scroll={{ x: "max-content" }}
			></Table>
		</div>
	);
};
