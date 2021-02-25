import "../../../node_modules/hover.css/css/hover.css";

import { Empty, Row, Spin, Table, Typography } from "antd";
import { ColumnsType } from "antd/lib/table/interface";
import React, { useContext, useEffect, useState } from "react";

import { YearContext } from "../../context/YearContext";
import { ConnectionManager } from "../../managers/connetion/connectionManager";
import { ClassEvent } from "../../types/classEvent";
import { Group, GroupTrainingType } from "../../types/group";
import { RequestCode, RequestMessage, RequestType } from "../../types/requests";
import { Subject } from "../../types/subject";
import { User } from "../../types/user";
import { ExcelExporter } from "../ui/excel-exporter/ExcelExporter";
import { ExtractClassesExport } from "../ui/excel-exporter/exporters/ExtractClassesExporter";
import DataGrid, {
	Scrolling,
	Paging,
	Column,
	LoadPanel,
} from "devextreme-react/data-grid";
import DataSource from "devextreme/data/data_source";

import "./TeacherExtractClasses.css";

export interface TeacherExtractClassesProps {
	userId: number;
}

interface TeacherExtractClassesTableData {
	classEvent: ClassEvent;
	group: Group;
	id: number;
}

export const TeacherExtractClasses: React.FC<TeacherExtractClassesProps> = (
	props: TeacherExtractClassesProps
) => {
	const yearContext = useContext(YearContext);
	const [classEvents, setClassEvents] = useState<ClassEvent[]>([]);
	const [subjects, setSubjects] = useState<Subject[]>([]);
	const [groups, setGroups] = useState<Group[]>([]);
	const [user, setUser] = useState<User | undefined>(undefined);

	useEffect(() => {
		ConnectionManager.getInstance().registerResponseOnceHandler(
			RequestType.GET_CLASSES_BY_USER,
			(data) => {
				const dataMessage = data as RequestMessage<ClassEvent[]>;
				if (dataMessage.requestCode === RequestCode.RES_CODE_INTERNAL_ERROR) {
					console.log(`Error: ${dataMessage.requestCode}`);
					return;
				}
				dataMessage.data.forEach(
					(classEvent) => (classEvent.date = new Date(classEvent.date))
				);
				setClassEvents(dataMessage.data);

				ConnectionManager.getInstance().emit(
					RequestType.GET_SUBJECT_BY_ID,
					dataMessage.data
						.map((ce) => ce.selectPath.subject)
						.filter((value, index, self) => self.indexOf(value) === index)
				);
				ConnectionManager.getInstance().emit(
					RequestType.GET_GROUP_BY_ID,
					dataMessage.data
						.map((ce) => ce.groupId)
						.filter((value, index, self) => self.indexOf(value) === index)
				);
			}
		);
		ConnectionManager.getInstance().registerResponseOnceHandler(
			RequestType.GET_SUBJECT_BY_ID,
			(data) => {
				const dataMessage = data as RequestMessage<Subject[]>;
				if (dataMessage.requestCode === RequestCode.RES_CODE_INTERNAL_ERROR) {
					console.log(`Error: ${dataMessage.requestCode}`);
					return;
				}
				console.log("receive", dataMessage.data);

				setSubjects(dataMessage.data);
			}
		);
		ConnectionManager.getInstance().registerResponseOnceHandler(
			RequestType.GET_GROUP_BY_ID,
			(data) => {
				const dataMessage = data as RequestMessage<Group[]>;
				if (
					dataMessage.requestCode === RequestCode.RES_CODE_INTERNAL_ERROR &&
					dataMessage.data.length < 1
				) {
					console.log(`Error: ${dataMessage.requestCode}`);
					return;
				}
				console.log("receive", dataMessage.data);

				setGroups(dataMessage.data);
			}
		);
		ConnectionManager.getInstance().emit(RequestType.GET_CLASSES_BY_USER, {
			userId: props.userId,
			year: yearContext.year,
		});

		ConnectionManager.getInstance().registerResponseOnceHandler(
			RequestType.GET_USER_INFO,
			(data) => {
				const dataMessage = data as RequestMessage<User>;
				if (dataMessage.requestCode === RequestCode.RES_CODE_INTERNAL_ERROR) {
					console.log(`Error: ${dataMessage.requestCode}`);
					return;
				}
				setUser(dataMessage.data);
			}
		);
		ConnectionManager.getInstance().emit(
			RequestType.GET_USER_INFO,
			props.userId
		);
	}, []);

	// if (
	// 	subjects.length < 1 ||
	// 	classEvents.length < 1 ||
	// 	groups.length < 1 ||
	// 	user === undefined
	// ) {
	// 	return (
	// 		<div>
	// 			<Empty description="Ще не має записів чи в процессі завантаження"></Empty>
	// 			<Spin></Spin>
	// 		</div>
	// 	);
	// }

	const columns: ColumnsType<any> = [
		{
			title: "Дата",
			dataIndex: "date",
			key: "date",
			width: "100px",
			render: (value, record: TeacherExtractClassesTableData) => {
				const date = new Date(record.classEvent.date);
				return (
					<div>
						{date.toLocaleDateString("uk", {
							year: "numeric",
							month: "2-digit",
							day: "2-digit",
						})}
					</div>
				);
			},
			sorter: (
				a: TeacherExtractClassesTableData,
				b: TeacherExtractClassesTableData
			) => (new Date(a.classEvent.date) < new Date(b.classEvent.date) ? -1 : 1),
			defaultSortOrder: "descend",
		},
		{
			title: "Проведення занять",
			children: [
				{
					title: "Години занять",
					dataIndex: "hours",
					key: "hours",
					render: (value, record: TeacherExtractClassesTableData) => {
						return <div>{record.classEvent.hours}</div>;
					},
				},
				{
					title: "Підрозділ, ВОС",
					dataIndex: "groupInfo",
					key: "groupInfo",
					render: (value, record: TeacherExtractClassesTableData) => {
						if (record.group.trainingType.type === GroupTrainingType.IPP) {
							return <div>{record.group.ipp.name}</div>;
						}

						return (
							<div>
								{record.group.company} рота, {record.group.platoon} взвод, ВОС:{" "}
								{record.group.mrs.number}
							</div>
						);
					},
				},
			],
		},
		{
			title:
				"Предмети навчання, номер теми, її назва, номер заняття, його назва, номери нормативів, що відпрацьовуються",
			dataIndex: "data",
			key: "data",
			render: (value, record: TeacherExtractClassesTableData) => {
				const subject = subjects.find(
					(s) => s.id === record.classEvent.selectPath.subject
				);
				const topic = subject.programTrainings
					.find((pt) => pt.id === record.classEvent.selectPath.programTraining)
					.topics.find((t) => t.id === record.classEvent.selectPath.topic);

				const occupation = topic.occupation.find(
					(oc) => oc.id === record.classEvent.selectPath.occupation
				);

				return (
					<div>
						<Row>
							<Typography.Text strong>{subject.fullTitle}</Typography.Text>
						</Row>
						<Row>
							Тема {topic.number}: {topic.title}
						</Row>
						<Row>
							Заняття {occupation.number}: {occupation.title}
						</Row>
					</div>
				);
			},
		},
		{
			title: "Місце проведення заняття",
			dataIndex: "place",
			key: "place",
			render: (value, record: TeacherExtractClassesTableData) => {
				return <div>{record.classEvent.place}</div>;
			},
		},
		{
			title: "Підпис викладача",
			dataIndex: "signature",
			key: "signature",
		},
	];

	let tableData: TeacherExtractClassesTableData[] = [];
	if (
		subjects.length > 0 &&
		classEvents.length > 0 &&
		groups.length > 0 &&
		user !== undefined
	) {
		tableData = classEvents.map((classEvent) => {
			const group = groups.find((gr) => gr.id === classEvent.groupId);
			return {
				classEvent: classEvent,
				group: group,
				id: group.id,
			};
		});
	}

	const extremeDataGridSource: DataSource = new DataSource({
		store: {
			type: "array",
			key: "id",
			data: tableData,
		},
	});

	return (
		<div style={{ margin: "1%" }}>
			<Row justify="end">
				<ExcelExporter
					bufferFunction={() => {
						return ExtractClassesExport(tableData, subjects);
					}}
					fileName={
						user?.secondName +
						" " +
						user?.firstName +
						": витяг з розкладу занять:" +
						yearContext.year
					}
				></ExcelExporter>
			</Row>
			{/* <Table
				columns={columns}
				bordered
				dataSource={tableData}
				pagination={false}
			></Table> */}
			<DataGrid
				elementAttr={{
					id: "gridContainer",
				}}
				dataSource={extremeDataGridSource}
				showBorders={true}
				showColumnLines={true}
				showRowLines={true}
				style={{ width: "100%" }}
				hoverStateEnabled={true}
				loadPanel={{ enabled: true }}
				wordWrapEnabled={true}
			>
				<LoadPanel enabled={true}></LoadPanel>
				<Scrolling
					rowRenderingMode="virtual"
					// mode="virtual"
					preloadEnabled={true}
				/>
				<Paging enabled={false} />
				<Column
					caption="Дата"
					width={"100px"}
					alignment="center"
					cellRender={({ data: { classEvent } }: any) => {
						const date = new Date(classEvent.date);

						return date.toLocaleDateString("uk", {
							year: "numeric",
							month: "2-digit",
							day: "2-digit",
						});
					}}
					dataField="classEvent"
					sortingMethod={(a: ClassEvent, b: ClassEvent) => {
						return new Date(a.date) < new Date(b.date) ? -1 : 1;
					}}
					defaultSortOrder="desc"
					allowSorting={false}
				></Column>
				<Column caption="Проведення занять" width={"100px"} alignment="center">
					<Column
						caption="Години занять"
						width={"100px"}
						alignment="center"
						cellRender={({ data: { classEvent } }: any) => {
							return (classEvent as ClassEvent).hours;
						}}
					></Column>
					<Column
						caption="Підрозділ, ВОС"
						width={"300px"}
						cellRender={({ data }: any) => {
							const record = data as TeacherExtractClassesTableData;

							if (record.group.trainingType.type === GroupTrainingType.IPP) {
								return <div>{record.group.ipp.name}</div>;
							}

							return (
								<div>
									{record.group.company} рота, {record.group.platoon} взвод,
									ВОС: {record.group.mrs.number}
								</div>
							);
						}}
					></Column>
				</Column>
				<Column
					caption="Предмети навчання, номер теми, її назва, номер заняття, його назва, номери нормативів, що відпрацьовуються"
					width={"auto"}
					alignment="center"
					cellRender={({ data }: any) => {
						const record = data as TeacherExtractClassesTableData;
						const subject = subjects.find(
							(s) => s.id === record.classEvent.selectPath.subject
						);
						const topic = subject.programTrainings
							.find(
								(pt) => pt.id === record.classEvent.selectPath.programTraining
							)
							.topics.find((t) => t.id === record.classEvent.selectPath.topic);

						const occupation = topic.occupation.find(
							(oc) => oc.id === record.classEvent.selectPath.occupation
						);

						return (
							<div>
								<Row>
									<Typography.Text strong>{subject.fullTitle}</Typography.Text>
								</Row>
								<Row>
									Тема {topic.number}: {topic.title}
								</Row>
								<Row>
									Заняття {occupation.number}: {occupation.title}
								</Row>
							</div>
						);
					}}
				></Column>
				<Column
					caption="Місце проведення заняття"
					width={"auto"}
					cellRender={({ data }: any) => {
						const record = data as TeacherExtractClassesTableData;
						return <div>{record.classEvent.place}</div>;
					}}
				></Column>
				<Column
					caption="Підпис викладача"
					width={"auto"}
					alignment="center"
				></Column>
			</DataGrid>
		</div>
	);
};
