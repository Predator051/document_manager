import React, { useEffect, useState } from "react";
import { ConnectionManager } from "../../../managers/connetion/connectionManager";
import {
	RequestType,
	RequestMessage,
	RequestCode,
} from "../../../types/requests";
import { Position, PositionType } from "../../../types/position";
import { User } from "../../../types/user";
import {
	Spin,
	Select,
	Row,
	Col,
	Typography,
	List,
	Divider,
	Input,
	Button,
	Modal,
	Tabs,
	Table,
	Tag,
} from "antd";
import Avatar from "antd/lib/avatar/avatar";
import { message } from "antd";
import { PlusOutlined, CloseCircleOutlined } from "@ant-design/icons";
import {
	Group,
	GroupTrainingType,
	ConstripAppeal,
	MRSToString,
} from "../../../types/group";
import { ColumnsType } from "antd/lib/table/interface";
import { GenerateGroupName } from "../../../helpers/GroupHelper";
import { GroupCreator } from "../../group/creator/GroupCreator";
import { ObjectStatusToString, ObjectStatus } from "../../../types/constants";

export interface GroupManipulationPageProps {}

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

const GroupStatusShower: React.FC<{ status: ObjectStatus }> = (props: {
	status: ObjectStatus;
}) => {
	console.log("props GroupStatusShower", props.status === ObjectStatus.ARCHIVE);

	let color: string = "green";

	if (props.status === ObjectStatus.ARCHIVE) {
		color = "purple";
	} else if (props.status === ObjectStatus.DELETE) {
		color = "red";
	}

	return (
		<div>
			<Tag color={color}>{ObjectStatusToString(props.status)}</Tag>
		</div>
	);
};

export const GroupManipulationPage: React.FC<GroupManipulationPageProps> = (
	props: GroupManipulationPageProps
) => {
	const [groups, setGroups] = useState<Group[]>([]);
	const [ckpSortType, setSkpSortType] = useState<CKPSortType>(CKPSortType.None);
	const [sortInfo, setSortInfo] = useState<
		{ order: "descend" | "ascend"; columnKey: string } | undefined
	>(undefined);
	const [loading, setLoading] = useState<boolean>(false);

	const loadAllGroups = () => {
		ConnectionManager.getInstance().registerResponseOnceHandler(
			RequestType.GET_ALL_GROUPS,
			(data) => {
				const dataMessage = data as RequestMessage<Group[]>;
				if (dataMessage.requestCode === RequestCode.RES_CODE_INTERNAL_ERROR) {
					console.log(`Error: ${dataMessage.requestCode}`);
					return;
				}

				setGroups(dataMessage.data);
				setLoading(false);
			}
		);
		ConnectionManager.getInstance().emit(RequestType.GET_ALL_GROUPS, {});
		setLoading(true);
	};

	useEffect(() => {
		loadAllGroups();
	}, []);

	// if (users.length < 1) {
	// 	return <Spin size="large"></Spin>;
	// }

	function onCreatedEditedGroupExist(
		modal: ReturnType<typeof Modal.info>,
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
				onGroupInfoClick(existedGroup.id);
				createdModal.destroy();
			},
		});
	}

	function onGroupInfoClick(groupId: number) {
		const modal = Modal.info({
			title: "Інформація про групу",
			width: window.screen.width * 0.6,
			style: { top: 20 },
			closable: true,
			okButtonProps: {
				style: { visibility: "hidden" },
			},
			zIndex: 1050,
		});
		const onGroupUpdate = (group: Group) => {
			ConnectionManager.getInstance().registerResponseOnceHandler(
				RequestType.UPDATE_GROUP,
				(data) => {
					const dataMessage = data as RequestMessage<any>;
					if (dataMessage.requestCode === RequestCode.RES_CODE_INTERNAL_ERROR) {
						console.log(`Error: ${dataMessage.requestCode}`);
						return;
					}

					loadAllGroups();
				}
			);
			ConnectionManager.getInstance().emit(RequestType.UPDATE_GROUP, group);
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
					<GroupCreator
						onCreate={onGroupUpdate}
						onClose={onSubjectCreatorClose}
						onExist={onCreatedEditedGroupExist.bind(null, modal)}
						group={groups.find((gr) => gr.id === groupId)}
						createText="Оновити"
						archiveButton
					></GroupCreator>
				</div>
			),
		});
	}

	const columns: ColumnsType<any> = [
		{
			title: "Код группи",
			key: "key",
			dataIndex: "key",
			render: (value, record: GroupListTableData) => {
				return (
					<div>
						<Button
							type="link"
							onClick={() => {
								// history.push(VIEWER_HREFS.GROUP_INFO + record.data.id.toString());
								onGroupInfoClick(record.data.id);
							}}
						>
							{GenerateGroupName(record.data)}
						</Button>
					</div>
				);
			},
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
			title: "Рік",
			key: "year",
			dataIndex: "year",
			render: (value, record: GroupListTableData) => (
				<div>{record.data.year}</div>
			),
			sorter: (a: GroupListTableData, b: GroupListTableData) => {
				return a.data.year - b.data.year;
			},
			onHeaderCell: (header) => {
				return {
					onClick: () => {
						// setSkpSortType(CKPSortType.None);
						if (sortInfo) {
							setSortInfo({
								columnKey: "year",
								order: sortInfo.order === "ascend" ? "descend" : "ascend",
							});
						} else {
							setSortInfo({
								columnKey: "year",
								order: "ascend",
							});
						}
					},
				};
			},
			sortDirections: ["ascend", "descend"],
			sortOrder:
				sortInfo && sortInfo.columnKey === "year" ? sortInfo.order : null,
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
			title: "Статус",
			key: "status",
			dataIndex: "status",
			render: (value, record: GroupListTableData) => (
				<GroupStatusShower status={record.data.status}></GroupStatusShower>
			),
			sorter: (a: GroupListTableData, b: GroupListTableData) => {
				const statusA = a.data.status.toString().toUpperCase();
				const statusB = b.data.status.toString().toUpperCase();

				if (statusA < statusB) {
					return -1;
				}
				if (statusA > statusB) {
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
								columnKey: "status",
								order: sortInfo.order === "ascend" ? "descend" : "ascend",
							});
						} else {
							setSortInfo({
								columnKey: "status",
								order: "ascend",
							});
						}
					},
				};
			},
			sortDirections: ["ascend", "descend"],
			sortOrder:
				sortInfo && sortInfo.columnKey === "status" ? sortInfo.order : null,
		},
	];

	const tableData: GroupListTableData[] = groups.map((g) => ({
		key: g.id,
		data: g,
	}));

	function onCreateGroupClick() {
		const modal = Modal.info({
			title: "Створення группи",
			width: window.screen.width * 0.6,
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
					<GroupCreator
						onCreate={onGroupCreate}
						onClose={onGroupCreatorClose}
						onExist={onCreatedEditedGroupExist.bind(null, modal)}
					></GroupCreator>
				</div>
			),
		});
	}

	return (
		<div style={{ margin: "1%" }}>
			<Row justify="end" style={{ margin: "3px" }}>
				<Button type="primary" onClick={onCreateGroupClick}>
					Створити групу
				</Button>
			</Row>
			<Table dataSource={tableData} columns={columns} loading={loading}></Table>
		</div>
	);
};
