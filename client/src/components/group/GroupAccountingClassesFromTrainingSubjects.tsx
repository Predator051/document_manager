import {
	Descriptions,
	Popover,
	Row,
	Select,
	Table,
	Tooltip,
	Typography,
} from "antd";
import {
	ColumnGroupType,
	ColumnsType,
	ColumnType,
} from "antd/lib/table/interface";
import React, { useContext, useEffect, useState } from "react";

import { YearContext } from "../../context/YearContext";
import { ConnectionManager } from "../../managers/connetion/connectionManager";
import { ClassEvent } from "../../types/classEvent";
import { Group, GroupTrainingType } from "../../types/group";
import { GroupUser } from "../../types/groupUser";
import {
	GroupUserPresence,
	UserPresenceType,
} from "../../types/groupUserPresence";
import { RequestCode, RequestMessage, RequestType } from "../../types/requests";
import { Subject } from "../../types/subject";
import { User } from "../../types/user";
import { ExcelExporter } from "../ui/excel-exporter/ExcelExporter";
import { GroupAccountingClassesFromTrainingSubjectsExport } from "../ui/excel-exporter/exporters/GroupAccountingClassesFromTrainingSubjectsExport";
import DataGrid, {
	Scrolling,
	Paging,
	Column,
	LoadPanel,
} from "devextreme-react/data-grid";
import DataSource from "devextreme/data/data_source";
import { info } from "console";
import { ObjectStatus } from "../../types/constants";
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

export interface GroupAccountingClassesFromTrainingSubjectsProps {
	title?: () => React.ReactNode;
	group: Group;
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
		<Popover
			content={content}
			style={{
				width: "100%",
			}}
		>
			{actualMark !== 0 ? (
				<div>
					<Typography.Text style={{ color: color }} strong>
						{actualMark}
					</Typography.Text>{" "}
					{presenceSym}
				</div>
			) : (
				<div>
					<Typography.Text>{presenceSym}</Typography.Text>
				</div>
			)}
		</Popover>
	);
};

export const GroupAccountingClassesFromTrainingSubjects: React.FC<GroupAccountingClassesFromTrainingSubjectsProps> = (
	props: GroupAccountingClassesFromTrainingSubjectsProps
) => {
	const [classEvents, setClassEvents] = useState<ClassEvent[]>([]);
	const [subjects, setSubjects] = useState<Subject[]>([]);
	const [users, setUsers] = useState<User[]>([]);
	const [selectedSubject, setSelectedSubject] = useState<Subject | undefined>(
		undefined
	);
	const yearContext = useContext(YearContext);

	useEffect(() => {
		ConnectionManager.getInstance().registerResponseOnceHandler(
			RequestType.GET_SUBJECT_BY_ID,
			(data) => {
				const dataMessage = data as RequestMessage<Subject[]>;
				if (dataMessage.requestCode === RequestCode.RES_CODE_INTERNAL_ERROR) {
					console.log(`Error: ${dataMessage.requestCode}`);
					return;
				}
				setSubjects(dataMessage.data);
			}
		);
		ConnectionManager.getInstance().registerResponseOnceHandler(
			RequestType.GET_USERS_BY_ID,
			(data) => {
				const dataMessage = data as RequestMessage<User[]>;
				if (dataMessage.requestCode === RequestCode.RES_CODE_INTERNAL_ERROR) {
					console.log(`Error: ${dataMessage.requestCode}`);
					return;
				}
				setUsers(dataMessage.data);
			}
		);
		ConnectionManager.getInstance().registerResponseOnceHandler(
			RequestType.GET_CLASS_BY_GROUP,
			(data) => {
				const dataMessage = data as RequestMessage<ClassEvent[]>;
				if (dataMessage.requestCode === RequestCode.RES_CODE_INTERNAL_ERROR) {
					console.log(`Error: ${dataMessage.requestCode}`);
					return;
				}
				dataMessage.data.forEach((ce) => {
					ce.date = new Date(ce.date);
				});

				setClassEvents(dataMessage.data);

				ConnectionManager.getInstance().emit(
					RequestType.GET_SUBJECT_BY_ID,
					dataMessage.data
						.map((ce) => ce.selectPath.subject)
						.filter((value, index, self) => self.indexOf(value) === index)
				);
				ConnectionManager.getInstance().emit(
					RequestType.GET_USERS_BY_ID,
					dataMessage.data
						.map((ce) => ce.userId)
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

	let columns: ColumnsType<any> = [
		{
			title: "№ з/п",
			key: "number",
			dataIndex: "number",
			render: (value, record: GroupTableData) => {
				return <div>{record.index}</div>;
			},
			fixed: "left",
			width: "2%",
		},
		{
			title: "Прізвище, ім’я та по батькові",
			key: "fullname",
			dataIndex: "fullname",
			render: (value, record: GroupTableData) => {
				return <div>{record.data.fullname}</div>;
			},
			sorter: (a: GroupTableData, b: GroupTableData) =>
				a.data.fullname.localeCompare(b.data.fullname),
			defaultSortOrder: "ascend",
			fixed: "left",
			width: "20%",
			ellipsis: true,
		},
	];

	const descriptionItemLabelStyle: React.CSSProperties = {
		width: "45%",
		backgroundColor: "#2988e2",
		fontSize: "large",
		color: "white",
	};

	const descriptionItemContentStyle: React.CSSProperties = {
		width: "45%",
		backgroundColor: "#fff",
		fontSize: "large",
	};

	const onSubjectSelectChanged = (value: number) => {
		setSelectedSubject(subjects.find((s) => s.id === value));
	};

	let dynamicColumns: ColumnsType<any> = [
		{
			title: " ",
			dataIndex: " ",
			key: " ",
			width: "auto",
		},
	];

	let extremeDynamicColumns: JSX.Element[] = [];
	if (selectedSubject && users.length > 0) {
		const filteredClasses = classEvents
			.filter((ce) => ce.selectPath.subject === selectedSubject.id)
			.sort((a, b) => DateComparer(a.date, b.date));

		if (filteredClasses.length > 0) {
			extremeDynamicColumns = filteredClasses.map((classEvent) => {
				const foundTopic = selectedSubject.programTrainings
					.find((pt) => pt.id === classEvent.selectPath.programTraining)
					.topics.find((t) => t.id === classEvent.selectPath.topic);

				const foundOccupation = foundTopic.occupation.find(
					(occ) => occ.id === classEvent.selectPath.occupation
				);
				const foundUser = users.find((u) => u.id === classEvent.userId);

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
						headerCellRender={({ column: { caption } }) => {
							return (
								<div>
									<Tooltip
										title={
											<div>
												<Row>
													Викладач: {foundUser.secondName} {foundUser.firstName}{" "}
													- {foundUser.cycle.title}
												</Row>
												<Row>
													Тема {foundTopic.number}: {foundTopic.title}
												</Row>
												<Row>
													Заняття {foundOccupation.number}:{" "}
													{foundOccupation.title}
												</Row>
											</div>
										}
										style={{
											width: "100%",
										}}
									>
										{caption}
									</Tooltip>
								</div>
							);
						}}
					></Column>
				);
			});
			extremeDynamicColumns.push(<Column caption={" "} width="auto"></Column>);
		}

		columns.push(...dynamicColumns);
	}

	const extremeDataGridSource: DataSource = new DataSource({
		store: {
			type: "array",
			key: "index",
			data: tableData,
		},
		onLoadingChanged: (isLoading) => {
			console.log("loading", isLoading);
		},
	});

	return (
		<div>
			<Row justify="center">
				<Descriptions style={{ minWidth: "50%" }} bordered>
					<Descriptions.Item
						label="Оберіть предмет"
						span={3}
						labelStyle={descriptionItemLabelStyle}
						contentStyle={descriptionItemContentStyle}
						className="fade-in-top"
					>
						<Select style={{ width: "100%" }} onChange={onSubjectSelectChanged}>
							{subjects.map((subj) => (
								<Select.Option value={subj.id}>{subj.fullTitle}</Select.Option>
							))}
						</Select>
					</Descriptions.Item>
				</Descriptions>
			</Row>
			{selectedSubject && (
				<div>
					<Row justify="end" style={{ marginTop: "1%" }}>
						<ExcelExporter
							bufferFunction={() => {
								return GroupAccountingClassesFromTrainingSubjectsExport(
									{
										...props.group,
										users: props.group.users.filter(
											(u) => u.status === ObjectStatus.NORMAL
										),
									},
									selectedSubject,
									classEvents
										.filter(
											(ce) => ce.selectPath.subject === selectedSubject.id
										)
										.sort((a, b) => DateComparer(a.date, b.date))
								);
							}}
							fileName={
								props.group.trainingType.type !== GroupTrainingType.IPP
									? `Навчальна група: ${props.group.company} рота, ${props.group.platoon} взвод, предмет: ${selectedSubject.fullTitle} : ${yearContext.year}`
									: `Навчальна група: ${props.group.ipp.name}, предмет ${selectedSubject.fullTitle} : ${yearContext.year}`
							}
							title="Експорт"
						></ExcelExporter>
					</Row>
					<Row
						justify="center"
						style={{ marginTop: "1%" }}
						className="fade-in-top"
					>
						<div style={{ width: "95%" }}>
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
											(e.data as GroupTableData).data.status ===
											ObjectStatus.NOT_ACTIVE
										) {
											e.rowElement.classList.add("row_grou-user_deactivate");
										}
									}
								}}
							>
								<LoadPanel enabled={true}></LoadPanel>
								<Scrolling
									columnRenderingMode="virtual"
									preloadEnabled={true}
								/>
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
									allowSorting={false}
								></Column>
								<Column
									caption="Дата, присутність, успішність"
									alignment="center"
								>
									{extremeDynamicColumns}
								</Column>
							</DataGrid>
						</div>
					</Row>
				</div>
			)}
		</div>
	);
};
