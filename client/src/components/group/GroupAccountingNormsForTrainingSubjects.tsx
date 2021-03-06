import { Modal, Row, Spin, Descriptions, Select, Tooltip, Button } from "antd";
import { ColumnsType } from "antd/lib/table/interface";
import React, { useContext, useEffect, useState } from "react";

import { YearContext } from "../../context/YearContext";
import { ConnectionManager } from "../../managers/connetion/connectionManager";
import { Group, GroupTrainingType } from "../../types/group";
import { GroupUser } from "../../types/groupUser";
import { Norm } from "../../types/norm";
import { NormProcess } from "../../types/normProcess";
import { RequestCode, RequestMessage, RequestType } from "../../types/requests";
import { NormInfoShower } from "../norm/NormInfoShower";
import { Subject } from "../../types/subject";
import { User } from "../../types/user";
import { ExcelExporter } from "../ui/excel-exporter/ExcelExporter";
import { GroupAccountingNormsForTrainingSubjectsExport } from "../ui/excel-exporter/exporters/GroupAccountingNormsForTrainingSubjectsExport";
import DataGrid, {
	Scrolling,
	Paging,
	Column,
	LoadPanel,
} from "devextreme-react/data-grid";
import DataSource from "devextreme/data/data_source";
import { ObjectStatus } from "../../types/constants";
import { DateComparer } from "../../helpers/SorterHelper";

interface GroupTableData {
	data: GroupUser;
	index: number;
}

export interface GroupAccountingNormsForTrainingSubjectsProps {
	title?: (data: any) => React.ReactNode;
	group: Group;
}

export const GroupAccountingNormsForTrainingSubjects: React.FC<GroupAccountingNormsForTrainingSubjectsProps> = (
	props: GroupAccountingNormsForTrainingSubjectsProps
) => {
	const [normProcesses, setNormProcesses] = useState<NormProcess[]>([]);
	const [norms, setNorms] = useState<Norm[]>([]);
	const [subjects, setSubjects] = useState<Subject[]>([]);
	const yearContext = useContext(YearContext);
	const [loading, setLoading] = useState<boolean>(true);
	const [selectedSubject, setSelectedSubject] = useState<Subject | undefined>(
		undefined
	);
	const [users, setUsers] = useState<User[]>([]);

	useEffect(() => {
		setLoading(true);

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
			RequestType.GET_SUBJECT_BY_ID,
			(data) => {
				const dataMessage = data as RequestMessage<Subject[]>;
				if (dataMessage.requestCode === RequestCode.RES_CODE_INTERNAL_ERROR) {
					console.log(`Error: ${dataMessage.requestCode}`);
					return;
				}
				setSubjects(dataMessage.data);

				setLoading(false);
			}
		);
		ConnectionManager.getInstance().registerResponseOnceHandler(
			RequestType.GET_NORM_PROCESSES_BY_GROUP,
			(data) => {
				const dataMessage = data as RequestMessage<NormProcess[]>;
				if (
					dataMessage.requestCode === RequestCode.RES_CODE_INTERNAL_ERROR &&
					dataMessage.data.length < 1
				) {
					console.log(`Error: ${dataMessage.requestCode}`);
					return;
				}
				dataMessage.data.forEach((normP) => {
					normP.date = new Date(normP.date);
					normP.marks = normP.marks.filter(
						(mark) =>
							props.group.users.findIndex((u) => u.id === mark.userId) > -1
					);
				});
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
				ConnectionManager.getInstance().emit(
					RequestType.GET_USERS_BY_ID,
					dataMessage.data
						.map((ce) => ce.user)
						.filter((value, index, self) => self.indexOf(value) === index)
				);
			}
		);
		ConnectionManager.getInstance().emit(
			RequestType.GET_NORM_PROCESSES_BY_GROUP,
			{
				groupId: props.group.id,
				year: yearContext.year,
			}
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
				setNorms(dataMessage.data);
				ConnectionManager.getInstance().emit(
					RequestType.GET_SUBJECT_BY_ID,
					dataMessage.data
						.map((n) => n.subjectId)
						.filter((value, index, self) => self.indexOf(value) === index)
				);
			}
		);
	}, []);

	if (loading) {
		return (
			<div>
				<Spin></Spin>
			</div>
		);
	}

	const tableData: GroupTableData[] = props.group.users
		// .sort((a, b) => (a.fullname < b.fullname ? -1 : 1))
		.map(
			(ug, index) =>
				({
					data: ug,
					index: index + 1,
				} as GroupTableData)
		);

	const onNormClick = (nId: number) => {
		const modal = Modal.info({
			title: "Інформація про предмет",
			width: window.screen.width * 0.7,
			style: { top: 20 },
			closable: true,
			zIndex: 1050,
		});

		modal.update({
			content: (
				<div
					style={{
						height: "auto",
						// minHeight: "500px",
					}}
				>
					<NormInfoShower
						norm={norms.find((n) => n.id === nId)}
						allowEdit={false}
					></NormInfoShower>
				</div>
			),
		});
	};

	let extremeDynamicColumns: JSX.Element[] = [
		<Column caption={" "} width="auto"></Column>,
	];
	if (selectedSubject) {
		console.log();

		const filteredNormProcesses = normProcesses
			.filter((normProcess) => {
				const marks = normProcess.marks.filter(
					(mark) =>
						norms.some(
							(norm) =>
								norm.id === mark.normId && norm.subjectId === selectedSubject.id
						) && props.group.users.findIndex((u) => u.id === mark.userId) >= 0
				);

				return marks.length > 0;
			})
			.sort((a, b) => DateComparer(a.date, b.date));

		if (filteredNormProcesses.length > 0) {
			extremeDynamicColumns = filteredNormProcesses.map((process) => {
				const date = new Date(process.date);
				const foundUser = users.find((u) => u.id === process.user);

				return (
					<Column
						allowReordering={false}
						key={process.id}
						caption={date.toLocaleDateString("uk", {
							year: "2-digit",
							month: "2-digit",
							day: "2-digit",
						})}
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
											</div>
										}
										style={{
											width: "auto",
										}}
									>
										{caption}
									</Tooltip>
								</div>
							);
						}}
					>
						<Column caption="Оцінка за норматив" allowReordering={false}>
							{norms
								.filter((n) => {
									return (
										n.subjectId === selectedSubject.id &&
										process.marks.findIndex((m) => m.normId === n.id) >= 0
									);
								})
								.map((norm, index, self) => {
									return (
										<Column
											dataField={norm.id + process.id}
											headerCellRender={({ column: { caption } }) => {
												return (
													<div>
														<Tooltip title="Клік для подробиць">
															<Button
																type="link"
																onClick={() => {
																	onNormClick(norm.id);
																}}
																style={{ margin: 0, padding: 0 }}
															>
																№ {norm.number}
															</Button>
														</Tooltip>
													</div>
												);
											}}
											allowReordering={false}
											cellRender={({ data }) => {
												const record = data as GroupTableData;

												const currMark = process.marks.find(
													(m) =>
														m.normId === norm.id && m.userId === record.data.id
												);
												return <div>{currMark?.mark}</div>;
											}}
											width="80px"
											key={norm.id + process.id}
										></Column>
									);
								})}
						</Column>
					</Column>
				);
			});
			extremeDynamicColumns.push(
				<Column caption={" "} width="auto" dataField=" "></Column>
			);
		}
	}

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

	const extremeDataGridSource: DataSource = new DataSource({
		store: {
			type: "array",
			key: "index",
			data: tableData,
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
								return GroupAccountingNormsForTrainingSubjectsExport(
									{
										...props.group,
										users: props.group.users.filter(
											(u) => u.status === ObjectStatus.NORMAL
										),
									},
									selectedSubject,
									norms,
									normProcesses
										.filter((normProcess) => {
											const marks = normProcess.marks.filter(
												(mark) =>
													norms.some(
														(norm) =>
															norm.id === mark.normId &&
															norm.subjectId === selectedSubject.id
													) &&
													props.group.users.findIndex(
														(u) => u.id === mark.userId
													) >= 0
											);

											return marks.length > 0;
										})
										.sort((a, b) => DateComparer(a.date, b.date))
								);
							}}
							fileName={
								props.group.trainingType.type !== GroupTrainingType.IPP
									? `Навчальна група: ${props.group.company} рота, ${props.group.platoon} взвод, предмет: ${selectedSubject.fullTitle} : ${yearContext.year}`
									: `Навчальна група: ${props.group.ipp.name}, предмет ${selectedSubject.fullTitle} : ${yearContext.year}`
							}
							title="Експорт відомісті"
						></ExcelExporter>
					</Row>
					<Row
						justify="center"
						style={{ margin: "1%" }}
						className="fade-in-top"
					>
						<div style={{ width: "99%" }}>
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
									caption="Прізвище, ім’я та по батькові"
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
								{extremeDynamicColumns}
							</DataGrid>
						</div>
					</Row>
				</div>
			)}
		</div>
	);
};
