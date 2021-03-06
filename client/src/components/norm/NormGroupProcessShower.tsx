import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import {
	Button,
	Form,
	InputNumber,
	message,
	Spin,
	Table,
	Tag,
	Typography,
	Affix,
	Modal,
	Tooltip,
	Row,
	Input,
} from "antd";
import { ColumnsType } from "antd/lib/table/interface";
import React, {
	useEffect,
	useState,
	useRef,
	useContext,
	ReactText,
} from "react";

import { ConnectionManager } from "../../managers/connetion/connectionManager";
import { Group } from "../../types/group";
import { GroupUser } from "../../types/groupUser";
import { Norm } from "../../types/norm";
import { NormMark } from "../../types/normMark";
import { NormProcess } from "../../types/normProcess";
import { RequestCode, RequestMessage, RequestType } from "../../types/requests";

import "../../../node_modules/hover.css/css/hover.css";
import { Subject } from "../../types/subject";
import { YearContext } from "../../context/YearContext";
import { NormInfoShower } from "./NormInfoShower";
import DataGrid, {
	Scrolling,
	Paging,
	Column,
	LoadPanel,
	Sorting,
} from "devextreme-react/data-grid";
import DataSource from "devextreme/data/data_source";

import { locale, loadMessages } from "devextreme/localization";
import ruMessages from "devextreme/localization/messages/ru.json";
import { ObjectStatus } from "../../types/constants";

interface EditableCellProps {
	onChange: (newValue: any) => void;
	value: any;
}

const EditableCell: React.FC<EditableCellProps> = (
	props: EditableCellProps
) => {
	const [counter, setCounter] = useState<number>(props.value);

	const onValuesChange = (value: React.ReactText) => {
		if (value) {
			if (value.toString().trim() === "") {
				props.onChange(0);
				setCounter(0);
			} else {
				const intValue = parseInt(value.toString());
				if (intValue <= 5 && intValue >= 0) {
					props.onChange(intValue);
					setCounter(intValue);
				}
			}
		} else {
			props.onChange(0);
			setCounter(0);
		}
	};

	return (
		<div>
			<InputNumber
				min={0}
				max={5}
				bordered={false}
				onChange={onValuesChange}
				value={counter}
				style={{ width: "100%", margin: 0, padding: 0 }}
				size="small"
			></InputNumber>
		</div>
	);
};

export interface NormGroupProcessShowerProps {
	group: Group;
	date: Date;
	rerender?: boolean;
}

interface NormGroupProcessShowerTableData {
	groupUser: GroupUser;
	key: number;
	process: NormProcess;
}

export const NormGroupProcessShower: React.FC<NormGroupProcessShowerProps> = (
	props: NormGroupProcessShowerProps
) => {
	const [norms, setNorms] = useState<Norm[]>([]);
	const [normProcess, setNormProcess] = useState<NormProcess | undefined>(
		undefined
	);
	const [subjects, setSubjects] = useState<Subject[]>([]);
	const yearContext = useContext(YearContext);

	const buttonUpdateRef = useRef(null);

	const loadAllNorms = () => {
		loadMessages(ruMessages);
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
			RequestType.GET_NORMS,
			(data) => {
				const dataMessage = data as RequestMessage<Norm[]>;
				if (dataMessage.requestCode === RequestCode.RES_CODE_INTERNAL_ERROR) {
					console.log(`Error: ${dataMessage.requestCode}`);
					return;
				}
				dataMessage.data = dataMessage.data.sort((a, b) => a.number - b.number);
				setNorms(dataMessage.data);
				loadNormProcess(dataMessage.data);

				ConnectionManager.getInstance().emit(
					RequestType.GET_SUBJECT_BY_ID,
					dataMessage.data
						.map((n) => n.subjectId)
						.filter((value, index, self) => self.indexOf(value) === index)
				);
			}
		);
		ConnectionManager.getInstance().emit(RequestType.GET_NORMS, {
			year: yearContext.year,
		});
	};

	const concatNormMarksWithEmpty = (
		marks: NormMark[],
		process: NormProcess,
		inputNorms: Norm[]
	) => {
		const result: NormMark[] = [];
		for (let gu of props.group.users) {
			// const found = marks.find((m) => m.userId === gu.id);
			for (let norm of inputNorms) {
				const found = marks.find(
					(m) => m.userId === gu.id && m.normId === norm.id
				);
				if (found !== undefined) {
					result.push(found);
				} else {
					result.push({
						id: Math.floor(Math.random() * (1000000 - 100000) + 1),
						mark: 0,
						normId: norm.id,
						processId: process.id,
						userId: gu.id,
					});
				}
			}
		}
		return result;
	};

	const loadNormProcess = (inputNorms: Norm[]) => {
		ConnectionManager.getInstance().registerResponseOnceHandler(
			RequestType.GET_NORM_PROCESS_BY_DATE_AND_GROUP,
			(data) => {
				const dataMessage = data as RequestMessage<NormProcess>;
				if (dataMessage.requestCode === RequestCode.RES_CODE_INTERNAL_ERROR) {
					console.log(`Error: ${dataMessage.requestCode}`);
					return;
				}

				dataMessage.data.marks = concatNormMarksWithEmpty(
					dataMessage.data.marks,
					dataMessage.data,
					inputNorms
				);
				console.log("recieve norm process", dataMessage.data);
				setNormProcess(dataMessage.data);
			}
		);
		ConnectionManager.getInstance().emit(
			RequestType.GET_NORM_PROCESS_BY_DATE_AND_GROUP,
			{ gr: props.group, date: props.date, year: yearContext.year }
		);
	};

	const onUpdateProcessClick = () => {
		ConnectionManager.getInstance().registerResponseOnceHandler(
			RequestType.UPDATE_NORM_PROCESS,
			(data) => {
				const dataMessage = data as RequestMessage<any>;
				if (dataMessage.requestCode === RequestCode.RES_CODE_INTERNAL_ERROR) {
					console.log(`Error: ${dataMessage.requestCode}`);

					message.success("Сталася помилка! Зверніться до адміністратора!");
					return;
				}

				message.success("Оновлено");

				loadAllNorms();
			}
		);

		ConnectionManager.getInstance().emit(RequestType.UPDATE_NORM_PROCESS, {
			...normProcess,
			marks: normProcess.marks.filter((mark) => mark.mark !== 0),
		});
	};

	useEffect(() => {
		setNorms([]);
		setNormProcess(undefined);
		loadAllNorms();
	}, [props.rerender]);

	useEffect(() => {
		setNorms([]);
		setNormProcess(undefined);
		loadAllNorms();
	}, [props.date]);

	if (norms.length < 1 || normProcess === undefined) {
		return <Spin></Spin>;
	}

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
						// allowEdit={true}
					></NormInfoShower>
				</div>
			),
		});
	};

	const columns: ColumnsType<any> = [
		{
			key: "fullname",
			title: "Прізвище",
			dataIndex: "fullname",
			render: (value, record: NormGroupProcessShowerTableData) => {
				return <div style={{ width: "auto" }}>{record.groupUser.fullname}</div>;
			},
			sorter: (
				a: NormGroupProcessShowerTableData,
				b: NormGroupProcessShowerTableData
			) => a.groupUser.fullname.localeCompare(b.groupUser.fullname),
			defaultSortOrder: "ascend",
			fixed: "left",
			width: "20%",
			ellipsis: true,
		},
		...norms.map<any>((norm) => ({
			key: norm.id,
			dataIndex: norm.id,
			title: (
				<div>
					<Tooltip title="Клік для подробиць">
						<Button
							type="link"
							onClick={() => {
								onNormClick(norm.id);
							}}
						>
							<Typography.Title level={4} style={{ margin: 0 }}>
								№ {norm.number}{" "}
								{subjects.find((s) => s.id === norm.subjectId)?.shortTitle}
							</Typography.Title>
						</Button>
					</Tooltip>
				</div>
			),
			width: "10px",
			render: (value: any, record: NormGroupProcessShowerTableData) => {
				const foundMark = record.process.marks.find(
					(mark) =>
						mark.normId === norm.id && mark.userId === record.groupUser.id
				);
				if (!foundMark) return <div>Не заватажилось</div>;
				return (
					<EditableCell
						value={foundMark.mark}
						onChange={(value: number) => {
							foundMark.mark = value;
							buttonUpdateRef.current.focus();
						}}
					></EditableCell>
				);
			},
		})),
		{
			key: " ",
			dataIndex: " ",
			title: " ",
			width: "auto",
		},
	];
	let extremeDynamicColumns: JSX.Element[] = [
		...norms.map((norm) => {
			const foundSubject = subjects.find((s) => s.id === norm.subjectId);

			return (
				<Column
					width={(foundSubject?.shortTitle.length * 25).toString() + "px"}
					key={norm.id}
					allowResizing={true}
					headerCellRender={() => {
						return (
							<div>
								<Tooltip title="Клік для подробиць">
									<Button
										type="link"
										onClick={() => {
											onNormClick(norm.id);
										}}
									>
										<Typography.Title level={5} style={{ margin: 0 }}>
											№ {norm.number} {foundSubject?.shortTitle}
										</Typography.Title>
									</Button>
								</Tooltip>
							</div>
						);
					}}
					cellRender={({ data }) => {
						const record = data as NormGroupProcessShowerTableData;

						const foundMark = record.process.marks.find(
							(mark) =>
								mark.normId === norm.id && mark.userId === record.groupUser.id
						);
						if (!foundMark) return <div>Не заватажилось</div>;
						if (record.groupUser.status === ObjectStatus.NOT_ACTIVE) {
							return <div>{foundMark.mark}</div>;
						}
						return (
							<div style={{ maxHeight: "5px" }}>
								<EditableCell
									value={foundMark.mark}
									onChange={(value: number) => {
										foundMark.mark = value;
										buttonUpdateRef.current.focus();
									}}
								></EditableCell>
							</div>
						);
					}}
				></Column>
			);
		}),
		<Column width="auto" dataField=" " allowResizing={true}></Column>,
	];
	const tableData: NormGroupProcessShowerTableData[] = props.group.users.map(
		(user) => {
			return {
				groupUser: user,
				key:
					new Date(normProcess.date).getMilliseconds() +
					user.id +
					props.group.id,
				process: normProcess,
			};
		}
	);

	const extremeDataGridSource: DataSource = new DataSource({
		store: {
			type: "array",
			key: "key",
			data: tableData,
		},
	});

	return (
		<div className="swing-in-top-fwd">
			{/* <Table
				columns={columns}
				dataSource={tableData}
				bordered
				pagination={false}
				scroll={{ x: "max-content" }}
				size="small"
			></Table> */}
			<div style={{ margin: "1%" }}>
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
								(e.data as NormGroupProcessShowerTableData).groupUser.status ===
								ObjectStatus.NOT_ACTIVE
							) {
								e.rowElement.classList.add("row_grou-user_deactivate");
							}
						}
					}}
				>
					<LoadPanel enabled={true}></LoadPanel>
					<Scrolling columnRenderingMode="virtual" preloadEnabled={true} />
					<Paging enabled={false} />
					<Sorting mode={"single"}></Sorting>

					<Column
						caption="ПІБ"
						width={"300px"}
						dataField="groupUser"
						cellRender={({ data: { groupUser } }: any) => {
							return (
								<Row justify="start" style={{ maxHeight: "5px" }}>
									{groupUser.fullname}
								</Row>
							);
							// return (
							// 	<Input value={groupUser.fullname} bordered={false}></Input>
							// );
						}}
						sortingMethod={(a: GroupUser, b: GroupUser) => {
							return a.fullname.localeCompare(b.fullname);
						}}
						defaultSortOrder="asc"
						allowSorting={false}
						fixed={true}
						headerCellRender={() => {
							return (
								<div>
									<Button type="link">
										<Typography.Title level={5} style={{ margin: 0 }}>
											{"ПІБ"}
										</Typography.Title>
									</Button>
								</div>
							);
						}}
					></Column>
					{extremeDynamicColumns}
				</DataGrid>
			</div>
			<Affix offsetBottom={10}>
				<Button
					type="primary"
					onClick={onUpdateProcessClick}
					className="hvr-buzz-out"
					ref={buttonUpdateRef}
				>
					ОНОВИТИ ЗМІНИ ЗА ОБРАНУ ДАТУ
				</Button>
			</Affix>
		</div>
	);
};
