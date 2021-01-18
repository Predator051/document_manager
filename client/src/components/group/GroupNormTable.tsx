import React, { useState, useEffect } from "react";
import { Table, Spin, Empty } from "antd";
import {
	ColumnsType,
	ColumnType,
	ColumnGroupType,
} from "antd/lib/table/interface";
import { GroupUser } from "../../types/groupUser";
import { Group } from "../../types/group";
import { Norm } from "../../types/norm";
import { ConnectionManager } from "../../managers/connetion/connectionManager";
import { RequestType, RequestMessage, RequestCode } from "../../types/requests";
import { NormProcess } from "../../types/normProcess";
import { Subject } from "../../types/subject";

interface GroupTableData {
	data: GroupUser;
	index: number;
}

export interface GroupTableProps {
	// userGroups: GroupUser[];
	title?: (data: any[]) => React.ReactNode;
	userId: number;
	group: Group;
	subject: Subject;
	// norm: Norm;
}

export const GroupNormTable: React.FC<GroupTableProps> = (
	props: GroupTableProps
) => {
	const [normProcesses, setNormProcesses] = useState<NormProcess[]>([]);
	const [norms, setNorms] = useState<Norm[]>([]);

	useEffect(() => {
		ConnectionManager.getInstance().registerResponseOnceHandler(
			RequestType.GET_NORM_PROCESSES_BY_GROUP_AND_USER,
			(data) => {
				const dataMessage = data as RequestMessage<NormProcess[]>;
				if (
					dataMessage.requestCode === RequestCode.RES_CODE_INTERNAL_ERROR &&
					dataMessage.data.length < 1
				) {
					console.log(`Error: ${dataMessage.requestCode}`);
					return;
				}
				console.log("receive process", dataMessage.data);
				dataMessage.data.forEach(
					(normP) => (normP.date = new Date(normP.date))
				);
				setNormProcesses(
					dataMessage.data.sort((a, b) => (a.date < b.date ? -1 : 1))
				);
				let normIds: number[] = [];
				for (const process of dataMessage.data) {
					for (const mark of process.marks) {
						const found = normIds.findIndex((value) => value === mark.normId);
						if (found < 0) {
							normIds.push(mark.normId);
						}
					}
				}

				ConnectionManager.getInstance().emit(
					RequestType.GET_NORM_BY_IDS,
					normIds
				);
			}
		);
		ConnectionManager.getInstance().emit(
			RequestType.GET_NORM_PROCESSES_BY_GROUP_AND_USER,
			{ groupId: props.group.id, userId: props.userId }
		);
		ConnectionManager.getInstance().registerResponseOnceHandler(
			RequestType.GET_NORM_BY_IDS,
			(data) => {
				const dataMessage = data as RequestMessage<Norm[]>;
				if (
					dataMessage.requestCode === RequestCode.RES_CODE_INTERNAL_ERROR &&
					dataMessage.data.length < 1
				) {
					console.log(`Error: ${dataMessage.requestCode}`);
					return;
				}
				console.log("receive", dataMessage.data);

				const filteredNorms: Norm[] = dataMessage.data.filter(
					(norm) => norm.subjectId === props.subject.id
				);

				setNorms(filteredNorms);

				// const filteredProcess = [
				// 	...,
				// ];
				// setNormProcesses(filteredProcess);
			}
		);
	}, []);

	if (norms.length < 1 || normProcesses.length < 1) {
		return (
			<div>
				<Empty description="Ще не має записів чи в процессі завантаження"></Empty>
				<Spin></Spin>
			</div>
		);
	}

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
		...normProcesses
			.filter((normProcess) => {
				normProcess.marks = normProcess.marks.filter((mark) =>
					norms.some((norm) => norm.id === mark.normId)
				);

				return normProcess.marks.length > 0;
			})
			.map((process) => {
				const date = new Date(process.date);

				return {
					title: date.toLocaleDateString("uk", {
						year: "2-digit",
						month: "2-digit",
						day: "2-digit",
					}),
					key: date.toLocaleDateString(),
					dataIndex: date.toLocaleDateString(),
					children: [
						{
							title: "Оцінка за норматив",
							key: process.id,
							dataIndex: process.id,
							children: [
								...norms
									.filter((n) => {
										return (
											process.marks.findIndex((m) => m.normId === n.id) >= 0 &&
											n.subjectId === props.subject.id
										);
									})
									.map((norm, index, self) => {
										return {
											title: <div>№ {norm.number}</div>,
											key: norm.number + process.id,
											dataIndex: norm.number + process.id,
											render: (value, record: GroupTableData) => {
												const currMark = process.marks.find(
													(m) =>
														m.normId === norm.id && m.userId === record.data.id
												);
												return <div>{currMark?.mark}</div>;
											},
										} as ColumnGroupType<any> | ColumnType<any>;
									}),
							],
						},
					],
				} as ColumnGroupType<any> | ColumnType<any>;
			}),
	];

	return (
		<div>
			<Table
				title={props.title}
				pagination={false}
				rowKey={(gu: GroupTableData) => gu.data.id.toString()}
				dataSource={tableData}
				columns={columns}
				size="small"
				scroll={{ x: "max-content" }}
				bordered
			></Table>
		</div>
	);
};
