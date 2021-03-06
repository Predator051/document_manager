import {
	Empty,
	Row,
	Spin,
	Table,
	Tooltip,
	Button,
	Typography,
	Modal,
} from "antd";
import {
	ColumnGroupType,
	ColumnsType,
	ColumnType,
} from "antd/lib/table/interface";
import React, { useContext, useEffect, useState } from "react";

import { YearContext } from "../../context/YearContext";
import { GenerateGroupName } from "../../helpers/GroupHelper";
import { ConnectionManager } from "../../managers/connetion/connectionManager";
import { Group } from "../../types/group";
import { GroupUser } from "../../types/groupUser";
import { Norm } from "../../types/norm";
import { NormProcess } from "../../types/normProcess";
import { RequestCode, RequestMessage, RequestType } from "../../types/requests";
import { Subject } from "../../types/subject";
import { ExcelExporter } from "../ui/excel-exporter/ExcelExporter";
import { GroupNormExport } from "../ui/excel-exporter/exporters/GroupNormExporter";
import { User } from "../../types/user";
import { NormInfoShower } from "../norm/NormInfoShower";
import { ObjectStatus } from "../../types/constants";

import DataGrid, {
	Scrolling,
	Paging,
	Column,
	LoadPanel,
} from "devextreme-react/data-grid";
import DataSource from "devextreme/data/data_source";
import { DateComparer } from "../../helpers/SorterHelper";

interface GroupTableData {
	data: GroupUser;
	index: number;
}

export interface GroupTableProps {
	title?: (data: any) => React.ReactNode;
	userId: number;
	group: Group;
	subject: Subject;
	reload: boolean;
}

export const GroupNormTable: React.FC<GroupTableProps> = (
	props: GroupTableProps
) => {
	const [normProcesses, setNormProcesses] = useState<NormProcess[]>([]);
	const [norms, setNorms] = useState<Norm[]>([]);
	const yearContext = useContext(YearContext);
	const [userInfo, setUserInfo] = useState<User | undefined>();
	const [loading, setLoading] = useState<boolean>(true);

	useEffect(() => {
		console.log("TAKE EFFECT");
		setLoading(true);

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
			{
				groupId: props.group.id,
				userId: props.userId,
				year: yearContext.year,
				subjectId: props.subject.id,
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
				console.log("receive", dataMessage.data);

				const filteredNorms: Norm[] = dataMessage.data.filter(
					(norm) => norm.subjectId === props.subject.id
				);

				setNorms(filteredNorms);
				setLoading(false);
			}
		);

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
	}, [props.reload]);

	if (userInfo === undefined || loading) {
		return (
			<div>
				<Empty description="Ще не має записів чи в процессі завантаження"></Empty>
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

	let normProcessColumns: ColumnsType<any> = [
		{
			title: " ",
			key: " ",
			dataIndex: " ",
			width: "auto",
		},
	];
	let extremeDynamicColumns: JSX.Element[] = [
		<Column caption={" "} width="auto"></Column>,
	];
	const filteredNormProcesses = normProcesses
		.filter((normProcess) => {
			normProcess.marks = normProcess.marks.filter((mark) =>
				norms.some((norm) => norm.id === mark.normId)
			);

			return normProcess.marks.length > 0;
		})
		.sort((a, b) => DateComparer(a.date, b.date));

	if (filteredNormProcesses.length > 0) {
		// normProcessColumns = filteredNormProcesses.map((process) => {
		// 	const date = new Date(process.date);

		// 	return {
		// 		title: date.toLocaleDateString("uk", {
		// 			year: "2-digit",
		// 			month: "2-digit",
		// 			day: "2-digit",
		// 		}),
		// 		key: date.toLocaleDateString(),
		// 		dataIndex: date.toLocaleDateString(),
		// 		children: [
		// 			{
		// 				title: "Оцінка за норматив",
		// 				key: process.id,
		// 				dataIndex: process.id,
		// 				children: [
		// 					...norms
		// 						.filter((n) => {
		// 							return (
		// 								process.marks.findIndex((m) => m.normId === n.id) >= 0 &&
		// 								n.subjectId === props.subject.id
		// 							);
		// 						})
		// 						.map((norm, index, self) => {
		// 							return {
		// 								title: (
		// 									<div>
		// 										<Tooltip title="Клік для подробиць">
		// 											<Button
		// 												type="link"
		// 												onClick={() => {
		// 													onNormClick(norm.id);
		// 												}}
		// 											>
		// 												№ {norm.number}
		// 											</Button>
		// 										</Tooltip>
		// 									</div>
		// 								),
		// 								key: norm.number + process.id,
		// 								dataIndex: norm.number + process.id,
		// 								width: "10px",
		// 								render: (value, record: GroupTableData) => {
		// 									const currMark = process.marks.find(
		// 										(m) =>
		// 											m.normId === norm.id && m.userId === record.data.id
		// 									);
		// 									return <div>{currMark?.mark}</div>;
		// 								},
		// 							} as ColumnGroupType<any> | ColumnType<any>;
		// 						}),
		// 				],
		// 			},
		// 		],
		// 	} as ColumnGroupType<any> | ColumnType<any>;
		// });
		// normProcessColumns.push({
		// 	title: " ",
		// 	key: " ",
		// 	dataIndex: " ",
		// 	width: "auto",
		// });
		extremeDynamicColumns = filteredNormProcesses.map((process) => {
			const date = new Date(process.date);

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
						return <div>{caption}</div>;
					}}
				>
					<Column caption="Оцінка за норматив" allowReordering={false}>
						{norms
							.filter((n) => {
								return (
									process.marks.findIndex((m) => m.normId === n.id) >= 0 &&
									n.subjectId === props.subject.id
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

	const columns: ColumnsType<any> = [
		{
			title: "№ з/п",
			key: "number",
			dataIndex: "number",
			render: (value, record: GroupTableData) => {
				return <div>{record.index}</div>;
			},
			fixed: "left",
			width: "40px",
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
		...normProcessColumns,
	];

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
						return GroupNormExport(
							{
								...props.group,
								users: props.group.users.filter(
									(u) => u.status === ObjectStatus.NORMAL
								),
							},
							props.subject,
							norms,
							normProcesses
								.filter((normProcess) => {
									normProcess.marks = normProcess.marks.filter((mark) =>
										norms.some((norm) => norm.id === mark.normId)
									);

									return normProcess.marks.length > 0;
								})
								.sort((a, b) => DateComparer(a.date, b.date))
						);
					}}
					fileName={
						userInfo.secondName +
						" " +
						userInfo.firstName +
						": " +
						GenerateGroupName(props.group) +
						" облік виконання нормативів з " +
						props.subject.fullTitle +
						"_ " +
						yearContext.year
					}
				></ExcelExporter>
			</Row>
			{/* <Table
				title={props.title}
				pagination={false}
				rowKey={(gu: GroupTableData) => gu.data.id.toString()}
				dataSource={tableData}
				columns={columns}
				size="small"
				scroll={{ x: "max-content" }}
				bordered
				rowClassName={(record, index) => {
					if (record.data.status === ObjectStatus.NOT_ACTIVE)
						return "row_grou-user_deactivate";

					return "";
				}}
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
	);
};
