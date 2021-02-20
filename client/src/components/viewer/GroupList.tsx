import "../../../node_modules/hover.css/css/hover.css";

import { Table, Button, Card, Modal, Typography, Row } from "antd";
import { ColumnsType } from "antd/lib/table/interface";
import React, { useEffect, useState, useContext } from "react";
import { useHistory } from "react-router-dom";

import { GenerateGroupName } from "../../helpers/GroupHelper";
import { ConnectionManager } from "../../managers/connetion/connectionManager";
import {
	Group,
	MRSToString,
	ConstripAppeal,
	GroupTrainingType,
} from "../../types/group";
import { RequestCode, RequestMessage, RequestType } from "../../types/requests";
import { VIEWER_HREFS } from "../menu/ViewerMenu";
import { YearContext, isYearCurrent } from "../../context/YearContext";
import { User, UserType } from "../../types/user";
import { GroupManipulator } from "../group/creator/GroupManipulator";
import { CloseCircleOutlined } from "@ant-design/icons";

export interface GroupListProps {}

interface GroupListTableData {
	key: number;
	data: Group;
}

enum CKPSortType {
	Cycle,
	Quarter,
	Appeal,
	None,
}

const ckpSortFunction = (
	ckpSortType: CKPSortType,
	a: GroupListTableData,
	b: GroupListTableData
) => {
	const resFunc = () => {
		if (ckpSortType === CKPSortType.Cycle) {
			const ifa =
				a.data.trainingType.type === GroupTrainingType.PROFESSIONAL_CONTRACT;
			const ifb =
				b.data.trainingType.type === GroupTrainingType.PROFESSIONAL_CONTRACT;

			if (ifa && ifb) {
				const cycleA = a.data.cycle;
				const cycleB = b.data.cycle;

				if (cycleA < cycleB) {
					return 1;
				}
				if (cycleA > cycleB) {
					return -1;
				}

				return 0;
			} else if (ifa) {
				return 1;
			} else if (ifb) {
				return -1;
			}
		}
		if (ckpSortType === CKPSortType.Appeal) {
			const ifa =
				a.data.trainingType.type === GroupTrainingType.PROGESSIONAL_CONSCRIPT;
			const ifb =
				b.data.trainingType.type === GroupTrainingType.PROGESSIONAL_CONSCRIPT;

			if (ifa && ifb) {
				const appealA = a.data.appeal.toUpperCase();
				const appealB = b.data.appeal.toUpperCase();

				if (appealA < appealB) {
					return -1;
				}
				if (appealA > appealB) {
					return 1;
				}

				return 0;
			} else if (ifa) {
				return 1;
			} else if (ifb) {
				return -1;
			}
		}
		if (ckpSortType === CKPSortType.Quarter) {
			const ifa =
				a.data.trainingType.type === GroupTrainingType.PROFESSIONAL_SERGEANTS;
			const ifb =
				b.data.trainingType.type === GroupTrainingType.PROFESSIONAL_SERGEANTS;

			if (ifa && ifb) {
				const quarterA = a.data.quarter;
				const quarterB = b.data.quarter;

				if (quarterA < quarterB) {
					return 1;
				}
				if (quarterA > quarterB) {
					return -1;
				}

				return 0;
			} else if (ifa) {
				return 1;
			} else if (ifb) {
				return -1;
			}
		}

		return -1;
	};

	return -1 * resFunc();
};

export const GroupList: React.FC<GroupListProps> = (props: GroupListProps) => {
	const history = useHistory();
	const [groups, setGroups] = useState<Group[]>([]);
	const [ckpSortType, setSkpSortType] = useState<CKPSortType>(CKPSortType.None);
	const [sortInfo, setSortInfo] = useState<
		{ order: "descend" | "ascend"; columnKey: string } | undefined
	>(undefined);
	const yearContext = useContext(YearContext);
	const me = JSON.parse(localStorage.getItem("user")) as User;

	const loadAllGroups = () => {
		ConnectionManager.getInstance().registerResponseOnceHandler(
			RequestType.GET_ALL_GROUPS,
			(data) => {
				const dataMessage = data as RequestMessage<Group[]>;
				if (dataMessage.requestCode === RequestCode.RES_CODE_INTERNAL_ERROR) {
					console.log(`Error: ${dataMessage.requestCode}`);
					return;
				}
				setGroups([...dataMessage.data]);
			}
		);
		ConnectionManager.getInstance().emit(
			RequestType.GET_ALL_GROUPS,
			// isYearCurrent(yearContext)
			// 	? {}
			// 	: {
			{
				year: yearContext.year, //TODO ARCHIVE
			}
		);
	};
	useEffect(() => {
		loadAllGroups();
	}, [yearContext.year]);

	const columns: ColumnsType<any> = [
		{
			title: "Код группи",
			key: "key",
			dataIndex: "key",
			render: (value, record: GroupListTableData) => (
				<div>
					<Button
						type="link"
						onClick={() => {
							history.push(VIEWER_HREFS.GROUP_INFO + record.data.id.toString());
						}}
					>
						{GenerateGroupName(record.data)}
					</Button>
				</div>
			),
		},
		{
			title: (
				<div>
					<Button
						type="link"
						style={{ padding: 0 }}
						onClick={() => {
							setSkpSortType(CKPSortType.Cycle);
						}}
					>
						Цикл
					</Button>
					,{" "}
					<Button
						type="link"
						style={{ padding: 0 }}
						onClick={() => {
							setSkpSortType(CKPSortType.Quarter);
						}}
					>
						квартал
					</Button>
					,{" "}
					<Button
						type="link"
						style={{ padding: 0 }}
						onClick={() => {
							setSkpSortType(CKPSortType.Appeal);
						}}
					>
						призов
					</Button>
				</div>
			),
			key: "ckp",
			dataIndex: "ckp",
			render: (value, record: GroupListTableData) => (
				<div>
					{record.data.trainingType.type ===
					GroupTrainingType.PROFESSIONAL_CONTRACT
						? "Цикл: " + record.data.cycle
						: record.data.trainingType.type ===
						  GroupTrainingType.PROFESSIONAL_SERGEANTS
						? "Квартал: " + record.data.quarter
						: record.data.trainingType.type ===
						  GroupTrainingType.PROGESSIONAL_CONSCRIPT
						? record.data.appeal === ConstripAppeal.AUTUMN
							? "Призов: осінь"
							: "Призов: весна"
						: ""}
				</div>
			),
			sorter: ckpSortFunction.bind(null, ckpSortType),
			sortDirections: ["ascend"],
			defaultSortOrder: "ascend",
			sortOrder:
				sortInfo && sortInfo.columnKey === "ckp" ? sortInfo.order : null,
			showSorterTooltip: false,
			onHeaderCell: (header) => {
				return {
					onClick: () => {
						setSortInfo({
							columnKey: "ckp",
							order: "ascend",
						});
					},
				};
			},
		},
		{
			title: "Рота",
			key: "company",
			dataIndex: "company",
			render: (value, record: GroupListTableData) => (
				<div>{record.data.company}</div>
			),
			sorter: (a: GroupListTableData, b: GroupListTableData) => {
				return a.data.company - b.data.company;
			},
			onHeaderCell: (header) => {
				return {
					onClick: () => {
						// setSkpSortType(CKPSortType.None);
						if (sortInfo) {
							setSortInfo({
								columnKey: "company",
								order: sortInfo.order === "ascend" ? "descend" : "ascend",
							});
						} else {
							setSortInfo({
								columnKey: "company",
								order: "ascend",
							});
						}
					},
				};
			},
			sortDirections: ["ascend", "descend"],
			sortOrder:
				sortInfo && sortInfo.columnKey === "company" ? sortInfo.order : null,
		},
		{
			title: "Взвод",
			key: "platoon",
			dataIndex: "platoon",
			render: (value, record: GroupListTableData) => (
				<div>{record.data.platoon}</div>
			),
		},
		{
			title: "Фах",
			key: "fah",
			dataIndex: "fah",
			render: (value, record: GroupListTableData) => (
				<div>{record.data.mrs.name}</div>
			),
			sorter: (a: GroupListTableData, b: GroupListTableData) => {
				const mrsA = a.data.mrs.id;
				const mrsB = b.data.mrs.id;

				if (mrsA < mrsB) {
					return -1;
				}
				if (mrsA > mrsB) {
					return 1;
				}

				return 0;
			},
			onHeaderCell: (header) => {
				return {
					onClick: () => {
						// setSkpSortType(CKPSortType.None);
						if (sortInfo) {
							setSortInfo({
								columnKey: "fah",
								order: sortInfo.order === "ascend" ? "descend" : "ascend",
							});
						} else {
							setSortInfo({
								columnKey: "fah",
								order: "ascend",
							});
						}
					},
				};
			},
			sortDirections: ["ascend", "descend"],
			sortOrder:
				sortInfo && sortInfo.columnKey === "fah" ? sortInfo.order : null,
		},
		{
			title: "ВОС",
			key: "mrs",
			dataIndex: "mrs",
			render: (value, record: GroupListTableData) => (
				<div>{record.data.mrs.number}</div>
			),
		},
		{
			title: "Вид підготовки",
			key: "trainingType",
			dataIndex: "trainingType",
			render: (value, record: GroupListTableData) => (
				<div>{record.data.trainingType.content}</div>
			),
			sorter: (a: GroupListTableData, b: GroupListTableData) => {
				const mrsA = a.data.trainingType.type.toUpperCase();
				const mrsB = b.data.trainingType.type.toUpperCase();

				if (mrsA < mrsB) {
					return -1;
				}
				if (mrsA > mrsB) {
					return 1;
				}

				return 0;
			},
			onHeaderCell: (header) => {
				return {
					onClick: () => {
						// setSkpSortType(CKPSortType.None);
						if (sortInfo) {
							setSortInfo({
								columnKey: "trainingType",
								order: sortInfo.order === "ascend" ? "descend" : "ascend",
							});
						} else {
							setSortInfo({
								columnKey: "trainingType",
								order: "ascend",
							});
						}
					},
				};
			},
			sortDirections: ["ascend", "descend"],
			sortOrder:
				sortInfo && sortInfo.columnKey === "trainingType"
					? sortInfo.order
					: null,
		},
		{
			title: "Дії",
			key: "actions",
			dataIndex: "actions",
			render: (value, record: GroupListTableData) => {
				if (me.userType === UserType.VIEWER) {
					return (
						<div>
							<Button
								type="link"
								onClick={() => {
									onGroupInfoClick(record.data.id, true);
								}}
							>
								Переглянути
							</Button>
						</div>
					);
				}
				return (
					<div>
						<Button
							type="link"
							onClick={() => {
								onGroupInfoClick(record.data.id, false);
							}}
						>
							Редагувати
						</Button>
					</div>
				);
			},
		},
	];

	function onCreatedEditedGroupExist(
		modal: ReturnType<typeof Modal.info>,
		visibleMode: boolean,
		existedGroup: Group
	) {
		const createdModal = Modal.confirm({
			title: (
				<Typography.Text>
					Група{" "}
					<Typography.Text strong>
						{GenerateGroupName(existedGroup)}
					</Typography.Text>{" "}
					вже існує. Переглянути існуючу групу?
				</Typography.Text>
			),
			closable: true,
			okText: "Так",
			cancelText: "Ні",
			zIndex: 1050,
			icon: <CloseCircleOutlined></CloseCircleOutlined>,

			onOk: () => {
				// modal.destroy();
				onGroupInfoClick(existedGroup.id, visibleMode);
				createdModal.destroy();
			},
		});
	}

	function onGroupInfoClick(groupId: number, visibleMode: boolean) {
		const modal = Modal.info({
			title: "Інформація про групу",
			width: window.screen.width * 0.9,
			style: { top: 20 },
			closable: true,
			okButtonProps: {
				style: { visibility: "hidden" },
			},
			zIndex: 1050,
		});
		const onGroupUpdate = (group: Group) => {
			if (!visibleMode) {
				ConnectionManager.getInstance().registerResponseOnceHandler(
					RequestType.UPDATE_GROUP,
					(data) => {
						const dataMessage = data as RequestMessage<any>;
						if (
							dataMessage.requestCode === RequestCode.RES_CODE_INTERNAL_ERROR
						) {
							console.log(`Error: ${dataMessage.requestCode}`);
							return;
						}

						loadAllGroups();
					}
				);
				ConnectionManager.getInstance().emit(RequestType.UPDATE_GROUP, group);
			}
			modal.destroy();
		};
		const onSubjectCreatorClose = () => {};
		modal.update({
			content: (
				<div
					style={{
						height: "auto",
						// minHeight: "500px",
					}}
				>
					<GroupManipulator
						onCreate={onGroupUpdate}
						onClose={onSubjectCreatorClose}
						onExist={onCreatedEditedGroupExist.bind(null, modal, visibleMode)}
						group={groups.find((gr) => gr.id === groupId)}
						createText={visibleMode ? "ОК" : "Оновити"}
						visibleMode={visibleMode}
					></GroupManipulator>
				</div>
			),
		});
	}

	function onCreateGroupClick() {
		const modal = Modal.info({
			title: "Створення группи",
			width: window.screen.width * 0.9,
			style: { top: 20 },
			closable: true,
			okButtonProps: {
				style: { visibility: "hidden" },
			},
			zIndex: 1050,
		});
		const onGroupCreate = (group: Group) => {
			ConnectionManager.getInstance().registerResponseOnceHandler(
				RequestType.CREATE_GROUP,
				(data) => {
					const dataMessage = data as RequestMessage<any>;
					if (dataMessage.requestCode === RequestCode.RES_CODE_INTERNAL_ERROR) {
						console.log(`Error: ${dataMessage.requestCode}`);
						return;
					}

					loadAllGroups();
				}
			);
			ConnectionManager.getInstance().emit(RequestType.CREATE_GROUP, group);
			modal.destroy();
		};
		const onGroupCreatorClose = () => {};
		modal.update({
			content: (
				<div
					style={{
						height: "auto",
					}}
				>
					<GroupManipulator
						onCreate={onGroupCreate}
						onClose={onGroupCreatorClose}
						onExist={onCreatedEditedGroupExist.bind(null, modal, false)}
						visibleMode={false}
					></GroupManipulator>
				</div>
			),
		});
	}

	const tableData: GroupListTableData[] = groups.map((g) => ({
		key: g.id,
		data: g,
	}));

	return (
		<div>
			{me.userType !== UserType.VIEWER && (
				<Row justify="end" style={{ padding: "5px" }}>
					<Button type="primary" onClick={onCreateGroupClick}>
						Створити нову групу
					</Button>{" "}
				</Row>
			)}

			<div>
				<Table
					pagination={false}
					dataSource={tableData}
					columns={columns}
					bordered
					size="small"
				></Table>
			</div>
		</div>
	);
};
