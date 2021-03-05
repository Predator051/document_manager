import { Popover, Row, Table, Typography, Spin, Tooltip } from "antd";
import { ColumnsType, ColumnType } from "antd/lib/table/interface";
import React, { useState, useEffect, useContext } from "react";

import { GenerateGroupName } from "../../helpers/GroupHelper";
import { ClassEvent } from "../../types/classEvent";
import { Group, GroupTrainingType } from "../../types/group";
import { GroupUser } from "../../types/groupUser";
import {
	GroupUserPresence,
	UserPresenceType,
} from "../../types/groupUserPresence";
import { Subject } from "../../types/subject";
import { ExcelExporter } from "../ui/excel-exporter/ExcelExporter";
import { GroupSubjectExport } from "../ui/excel-exporter/exporters/GroupSubjectExporter";
import { User } from "../../types/user";
import { ConnectionManager } from "../../managers/connetion/connectionManager";
import { RequestType, RequestMessage, RequestCode } from "../../types/requests";
import { YearContext } from "../../context/YearContext";
import { GroupSubjectBillExport } from "../ui/excel-exporter/exporters/GroupSubjectBillExporter";
import { ObjectStatus } from "../../types/constants";

import DataGrid, {
	Scrolling,
	Paging,
	Column,
	LoadPanel,
} from "devextreme-react/data-grid";
import DataSource from "devextreme/data/data_source";
import { DateComparer } from "../../helpers/SorterHelper";

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
	userId: number;
	title?: (data: any) => React.ReactNode;
	group: Group;
	subject: Subject;
	classEvents: ClassEvent[];
}

export const PresenceShower: React.FC<{
	presence: GroupUserPresence;
}> = (props: { presence: GroupUserPresence }) => {
	if (props.presence === undefined) {
		return <div></div>;
	}

	let actualMark: number = 0;
	let color: string = "";
	let content: string = "Оцінка за заняття";
	if (props.presence.mark.subject !== 0) {
		actualMark = props.presence.mark.subject;
		color = "#cd201f";
		content = "Підсумкова оцінка за предмет навчання";
	} else if (props.presence.mark.topic !== 0) {
		actualMark = props.presence.mark.topic;
		color = "#108ee9";
		content = "Підсумкова оцінка за тему";
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
		case UserPresenceType.FREE:
			presenceSym = "вх";
			content += "; вихідний";
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
	const [userInfo, setUserInfo] = useState<User | undefined>();
	const yearContext = useContext(YearContext);

	useEffect(() => {
		ConnectionManager.getInstance().registerResponseOnceHandler(
			RequestType.GET_USER_INFO,
			(data) => {
				const dataMessage = data as RequestMessage<User>;
				if (dataMessage.requestCode === RequestCode.RES_CODE_INTERNAL_ERROR) {
					console.log(`Error: ${dataMessage.requestCode}`);
					return;
				}
				setUserInfo(dataMessage.data);
			}
		);
		ConnectionManager.getInstance().emit(
			RequestType.GET_USER_INFO,
			props.userId
		);
	}, []);

	if (userInfo === undefined) {
		return <Spin size="large"></Spin>;
	}

	const tableData: GroupTableData[] = props.group.users
		.sort((a, b) => a.fullname.localeCompare(b.fullname))
		.map(
			(ug, index) =>
				({
					data: ug,
					index: index + 1,
				} as GroupTableData)
		);

	const filteredClassEvents = props.classEvents.sort((a, b) =>
		DateComparer(a.date, b.date)
	);
	// .filter((classEvent) => {
	// 	return classEvent.presences.some(
	// 		(presence) =>
	// 			presence.mark.current !== 0 ||
	// 			presence.mark.topic !== 0 ||
	// 			presence.mark.subject !== 0
	// 	);
	// });
	// console.log("filtered", filteredClassEvents.length);

	// const columns: ColumnsType<any> = [
	// 	{
	// 		title: "№ з/п",
	// 		key: "number",
	// 		dataIndex: "number",
	// 		render: (value, record: GroupTableData) => {
	// 			return <div>{record.index}</div>;
	// 		},
	// 		fixed: "left",
	// 		width: "40px",
	// 	},
	// 	{
	// 		title: "Прізвище, ім’я та по батькові",
	// 		key: "fullname",
	// 		dataIndex: "fullname",
	// 		render: (value, record: GroupTableData) => {
	// 			return <div>{record.data.fullname}</div>;
	// 		},
	// 		sorter: (a: GroupTableData, b: GroupTableData) =>
	// 			a.data.fullname.localeCompare(b.data.fullname),
	// 		defaultSortOrder: "ascend",
	// 		fixed: "left",
	// 		width: "20%",
	// 		ellipsis: true,
	// 	},
	// 	{
	// 		title: "Дата, присутність, успішність",
	// 		key: "data",
	// 		align: "center",
	// 		dataIndex: "data",
	// 		width: filteredClassEvents.length > 1 ? "max-content" : "auto",
	// 		// ellipsis: true,
	// 		children: [
	// 			...filteredClassEvents.map((classEvent) => {
	// 				const foundTopic = props.subject.programTrainings
	// 					.find((pt) => pt.id === classEvent.selectPath.programTraining)
	// 					.topics.find((t) => t.id === classEvent.selectPath.topic);

	// 				const foundOccupation = foundTopic.occupation.find(
	// 					(occ) => occ.id === classEvent.selectPath.occupation
	// 				);

	// 				return {
	// 					title: (
	// 						<div>
	// 							<Tooltip
	// 								title={
	// 									<div>
	// 										<Row>
	// 											Тема {foundTopic.number}: {foundTopic.title}
	// 										</Row>
	// 										<Row>
	// 											Заняття {foundOccupation.number}:{" "}
	// 											{foundOccupation.title}
	// 										</Row>
	// 									</div>
	// 								}
	// 								style={{
	// 									width: "auto",
	// 								}}
	// 							>
	// 								{classEvent.date.toLocaleDateString("uk", {
	// 									year: "2-digit",
	// 									month: "2-digit",
	// 									day: "2-digit",
	// 								})}
	// 							</Tooltip>
	// 						</div>
	// 					),
	// 					key: classEvent.date.toLocaleDateString(),
	// 					dataIndex: classEvent.date.toLocaleDateString(),
	// 					align: "center",
	// 					width: "10px",
	// 					render: (value, record: GroupTableData) => {
	// 						const presence = classEvent.presences.find(
	// 							(pr) => pr.userId === record.data.id
	// 						);

	// 						return (
	// 							<div>
	// 								<PresenceShower presence={presence}></PresenceShower>
	// 							</div>
	// 						);
	// 					},
	// 				} as ColumnType<any>;
	// 			}),
	// 			{
	// 				title: " ",
	// 				key: " ",
	// 				dataIndex: " ",
	// 				width: "auto",
	// 			},
	// 		],
	// 	},
	// ];

	let extremeDynamicColumns: JSX.Element[] = filteredClassEvents.map(
		(classEvent) => {
			const foundTopic = props.subject.programTrainings
				.find((pt) => pt.id === classEvent.selectPath.programTraining)
				.topics.find((t) => t.id === classEvent.selectPath.topic);

			const foundOccupation = foundTopic.occupation.find(
				(occ) => occ.id === classEvent.selectPath.occupation
			);

			return (
				<Column
					caption={classEvent.date.toLocaleDateString("uk", {
						year: "2-digit",
						month: "2-digit",
						day: "2-digit",
					})}
					width="100px"
					cellRender={({ data }) => {
						const record = data as GroupTableData;

						const presence = classEvent.presences.find(
							(pr) => pr.userId === record.data.id
						);

						return (
							<div>
								<PresenceShower presence={presence}></PresenceShower>
							</div>
						);
					}}
					dataField="data"
					sortingMethod={(a: any, b: any) => {
						const recordA = a as GroupUser;
						const recordB = b as GroupUser;
						const presenceA = classEvent.presences.find(
							(pr) => pr.userId === recordA.id
						);
						const presenceB = classEvent.presences.find(
							(pr) => pr.userId === recordB.id
						);

						let markA = 0;
						let markB = 0;

						if (presenceA) {
							if (presenceA.mark.topic > 0) {
								markA = presenceA.mark.topic;
							} else if (presenceA.mark.subject > 0) {
								markA = presenceA.mark.subject;
							} else {
								markA = presenceA.mark.current;
							}
						}

						if (presenceB) {
							if (presenceB.mark.topic > 0) {
								markB = presenceB.mark.topic;
							} else if (presenceB.mark.subject > 0) {
								markB = presenceB.mark.subject;
							} else {
								markB = presenceB.mark.current;
							}
						}

						return markA === markB ? 0 : markA < markB ? -1 : 1;
					}}
					allowSorting={true}
					headerCellRender={({ column: { caption } }) => {
						return (
							<div>
								<Tooltip
									title={
										<div>
											<Row style={{ wordWrap: "break-word" }}>
												Тема {foundTopic.number}: {foundTopic.title}
											</Row>
											<Row>
												Заняття {foundOccupation.number}:{" "}
												{foundOccupation.title}
											</Row>
										</div>
									}
									style={{
										width: "auto",
									}}
								>
									{classEvent.date.toLocaleDateString("uk", {
										year: "2-digit",
										month: "2-digit",
										day: "2-digit",
									})}
								</Tooltip>
							</div>
						);
					}}
				></Column>
			);
		}
	);
	extremeDynamicColumns.push(<Column caption={" "} width="auto"></Column>);

	const extremeDataGridSource: DataSource = new DataSource({
		store: {
			type: "array",
			key: "index",
			data: tableData,
		},
	});

	return (
		<div>
			<Row justify="end">
				<ExcelExporter
					bufferFunction={() => {
						return GroupSubjectExport(
							{
								...props.group,
								users: props.group.users.filter(
									(u) => u.status === ObjectStatus.NORMAL
								),
							},
							props.subject,
							props.classEvents
						);
					}}
					fileName={
						userInfo.secondName +
						" " +
						userInfo.firstName +
						": " +
						GenerateGroupName(props.group) +
						" облік з " +
						props.subject.fullTitle +
						" " +
						yearContext.year
					}
					title="Поточні оцінки за предмет"
				></ExcelExporter>

				<ExcelExporter
					bufferFunction={() => {
						return GroupSubjectBillExport(
							{
								...props.group,
								users: props.group.users.filter(
									(u) => u.status === ObjectStatus.NORMAL
								),
							},
							props.subject,
							props.classEvents.sort((a, b) => DateComparer(a.date, b.date))
						);
					}}
					fileName={
						props.group.trainingType.type !== GroupTrainingType.IPP
							? `Навчальна група: ${props.group.company} рота, ${props.group.platoon} взвод : ${yearContext.year}`
							: `Навчальна група: ${props.group.ipp.name} : ${yearContext.year}`
					}
					title="Експорт відомісті"
				></ExcelExporter>
			</Row>
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
				renderAsync={true}
				loadPanel={{ enabled: true }}
				wordWrapEnabled={true}
				onRowPrepared={(e) => {
					if (e.rowType === "data") {
						if (
							(e.data as GroupTableData).data.status === ObjectStatus.NOT_ACTIVE
						) {
							e.rowElement.classList.add("row_grou-user_deactivate");
						}
					}
				}}
				allowColumnResizing={true}
			>
				<LoadPanel enabled={true}></LoadPanel>
				<Scrolling columnRenderingMode="virtual" preloadEnabled={true} />
				<Paging enabled={false} />

				<Column
					caption="№ з/п"
					width={"40px"}
					alignment="center"
					dataField="index"
					fixed={true}
				></Column>
				<Column
					caption="ПІБ"
					width={"300px"}
					alignment="center"
					cellRender={({ data: { data } }: any) => {
						return <Row justify="start">{data.fullname}</Row>;
					}}
					fixed={true}
					dataField="data"
					sortingMethod={(a: GroupUser, b: GroupUser) => {
						return a.fullname.localeCompare(b.fullname);
					}}
					defaultSortOrder="asc"
					allowSorting={true}
				></Column>
				<Column caption="Дата, присутність, успішність" alignment="center">
					{extremeDynamicColumns}
				</Column>
			</DataGrid>
		</div>
	);
};
