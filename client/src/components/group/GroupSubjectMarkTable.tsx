import React, { useState, useEffect, useContext } from "react";
import { Table, Tag, Popover, Row, Typography, Empty } from "antd";
import {
	ColumnsType,
	ColumnType,
	ColumnGroupType,
} from "antd/lib/table/interface";
import { GroupUser } from "../../types/groupUser";
import { Group, GroupTrainingType } from "../../types/group";
import { Subject } from "../../types/subject";
import { ClassEvent } from "../../types/classEvent";
import {
	GroupUserPresence,
	UserPresenceType,
} from "../../types/groupUserPresence";
import { ConnectionManager } from "../../managers/connetion/connectionManager";
import { RequestType, RequestMessage, RequestCode } from "../../types/requests";
import { GroupUserMark } from "../../types/groupUserMark";

import "../../animations/fade-in-bck.css";
import "../../animations/text-focus-in.css";
import { YearContext } from "../../context/YearContext";
import { ExcelExporter } from "../ui/excel-exporter/ExcelExporter";
import { GroupSubjectMarkExport } from "../ui/excel-exporter/exporters/GroupSubjectMarkExporter";
import { GenerateGroupName } from "../../helpers/GroupHelper";
import { ObjectStatus } from "../../types/constants";
import { DateComparer } from "../../helpers/SorterHelper";

interface GroupTableData {
	data: GroupUser;
	index: number;
}

interface GroupSubjectMarkTableProps {
	group: Group;
	title?: (data: any) => React.ReactNode;
}

export interface MarkObj {
	current: {
		sum: number;
		count: number;
	};
	subject: {
		sum: number;
		count: number;
	};
	topic: {
		sum: number;
		count: number;
	};
}

const MarkDrawer: React.FC<MarkObj> = (props: MarkObj) => {
	let markValue: number = 0;
	let color: string = "";
	if (props.subject.count !== 0) {
		markValue = props.subject.sum / props.subject.count;
		color = "#cd201f";
	} else if (props.topic.count !== 0) {
		markValue = props.topic.sum / props.topic.count;
		color = "#108ee9";
	} else if (props.current.count !== 0) {
		markValue = props.current.sum / props.current.count;
	}

	return (
		<Typography.Text style={{ color: color }} strong>
			{markValue === 0 ? "" : markValue}
		</Typography.Text>
	);
};

export const GroupSubjectMarkTable: React.FC<GroupSubjectMarkTableProps> = (
	props: GroupSubjectMarkTableProps
) => {
	const [classEvents, setClassEvents] = useState<ClassEvent[]>([]);
	const [subjects, setSubjects] = useState<Subject[]>([]);
	const yearContext = useContext(YearContext);

	useEffect(() => {
		ConnectionManager.getInstance().registerResponseOnceHandler(
			RequestType.GET_SUBJECT_BY_ID,
			(data) => {
				const dataMessage = data as RequestMessage<Subject[]>;
				if (
					dataMessage.requestCode === RequestCode.RES_CODE_INTERNAL_ERROR &&
					dataMessage.data.length < 1
				) {
					console.log(`Error: ${dataMessage.requestCode}`);
					return;
				}

				setSubjects(dataMessage.data);
			}
		);
		ConnectionManager.getInstance().registerResponseOnceHandler(
			RequestType.GET_CLASS_BY_GROUP,
			(data) => {
				const dataMessage = data as RequestMessage<ClassEvent[]>;
				if (
					dataMessage.requestCode === RequestCode.RES_CODE_INTERNAL_ERROR &&
					dataMessage.data.length < 1
				) {
					console.log(`Error: ${dataMessage.requestCode}`);
					return;
				}
				console.log("recive classes", dataMessage.data);

				dataMessage.data = dataMessage.data
					.filter((ce) =>
						ce.presences.some(
							(p) =>
								p.mark.current !== 0 ||
								p.mark.subject !== 0 ||
								p.mark.topic !== 0
						)
					)
					.sort((a, b) => DateComparer(a.date, b.date));

				setClassEvents(dataMessage.data);

				ConnectionManager.getInstance().emit(
					RequestType.GET_SUBJECT_BY_ID,
					dataMessage.data
						.map((ce) => ce.selectPath.subject)
						.filter((value, index, self) => self.indexOf(value) === index)
				);
			}
		);
		ConnectionManager.getInstance().emit(RequestType.GET_CLASS_BY_GROUP, {
			groupId: props.group.id,
			year: yearContext.year,
		});
	}, []);

	const tableData: GroupTableData[] = props.group.users
		.sort((a, b) => a.fullname.localeCompare(b.fullname))
		.map(
			(ug, index) =>
				({
					data: ug,
					index: index + 1,
				} as GroupTableData)
		);

	const columns: ColumnsType<any> = [
		{
			title: "№ з/п",
			key: "number",
			dataIndex: "number",
			render: (value, record: GroupTableData) => {
				return <div className="text-focus-in">{record.index}</div>;
			},
			fixed: "left",
			width: "40px",
			ellipsis: true,
		},
		{
			title: "Прізвище, ім’я та по батькові",
			key: "fullname",
			dataIndex: "fullname",
			render: (value, record: GroupTableData) => {
				return <div className="text-focus-in">{record.data.fullname}</div>;
			},
			sorter: (a: GroupTableData, b: GroupTableData) =>
				a.data.fullname.localeCompare(b.data.fullname),
			defaultSortOrder: "ascend",
			fixed: "left",
			width: "20%",
			ellipsis: true,
		},
		{
			title: "Предмет навчання",
			key: "data",
			dataIndex: "data",
			children: [
				...subjects.map<ColumnGroupType<any> | ColumnType<any>>((subject) => ({
					title: subject.shortTitle,
					key: subject.id,
					dataIndex: subject.id,
					width: "100px",
					render: (value, record: GroupTableData) => {
						const ceBySubject = classEvents.filter(
							(ce) => ce.selectPath.subject === subject.id
						);

						const allMarksByUser: GroupUserMark[] = [];
						ceBySubject
							.sort((a, b) => (a.date < b.date ? -1 : 1))
							.forEach((ce) =>
								allMarksByUser.push(
									...ce.presences
										.filter((pr) => pr.userId === record.data.id)
										.map((pr) => pr.mark)
								)
							);

						const markObj: MarkObj = {
							current: {
								sum: 0,
								count: 0,
							},
							subject: {
								sum: 0,
								count: 0,
							},
							topic: {
								sum: 0,
								count: 0,
							},
						};

						allMarksByUser.forEach((mark) => {
							if (mark.subject !== 0) {
								markObj.subject.count = 1;
								markObj.subject.sum = mark.subject;
							} else if (mark.topic !== 0) {
								markObj.topic.count += 1;
								markObj.topic.sum += mark.topic;
							} else if (mark.current !== 0) {
								markObj.current.count += 1;
								markObj.current.sum += mark.current;
							}
						});

						return (
							<div className="text-focus-in">
								<MarkDrawer {...markObj}></MarkDrawer>
							</div>
						);
					},
				})),
				{
					title: " ",
					dataIndex: " ",
					key: " ",
					width: "auto",
				},
			],
		},
	];

	return (
		<div className="fade-in-top">
			<Row justify="end">
				<ExcelExporter
					bufferFunction={() => {
						return GroupSubjectMarkExport(
							{
								...props.group,
								users: props.group.users.filter(
									(u) => u.status === ObjectStatus.NORMAL
								),
							},
							subjects,
							classEvents.sort((a, b) => DateComparer(a.date, b.date))
						);
					}}
					fileName={
						props.group.trainingType.type !== GroupTrainingType.IPP
							? `Навчальна група: ${props.group.company} рота, ${props.group.platoon} взвод : ${yearContext.year}`
							: `Навчальна група: ${props.group.ipp.name} : ${yearContext.year}`
					}
				></ExcelExporter>
			</Row>
			<Table
				// className="text-focus-in"
				title={props.title}
				pagination={false}
				rowKey={(gu: GroupTableData) => gu.data.id.toString()}
				dataSource={tableData}
				columns={columns}
				size="small"
				bordered
				scroll={{ x: "max-content" }}
				rowClassName={(record: GroupTableData, index) => {
					if (record.data.status === ObjectStatus.NOT_ACTIVE)
						return "row_grou-user_deactivate";

					return "";
				}}
			></Table>
		</div>
	);
};
