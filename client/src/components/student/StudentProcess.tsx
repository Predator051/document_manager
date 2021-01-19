import React, { useEffect, useState, useContext } from "react";

import { GroupUser } from "../../types/groupUser";
import { NormProcess } from "../../types/normProcess";
import { ConnectionManager } from "../../managers/connetion/connectionManager";
import { RequestType, RequestMessage, RequestCode } from "../../types/requests";
import { IndividualWork } from "../../types/individualWork";
import { User } from "../../types/user";
import { ColumnsType } from "antd/lib/table/interface";
import {
	Table,
	Button,
	Divider,
	Modal,
	message,
	Spin,
	Row,
	Typography,
} from "antd";
import { IndividualWorkCreator } from "./IndividualWorkCreator";
import { Group } from "../../types/group";
import { GenerateGroupName } from "../../helpers/GroupHelper";
import { YearContext } from "../../context/YearContext";

export interface StudentProcessProps {}

interface StudentProcessTableData {
	work: IndividualWork;
	key: number;
}

export const StudentProcess: React.FC<StudentProcessProps> = (
	props: StudentProcessProps
) => {
	const [individualWorks, setIndividualWorks] = useState<IndividualWork[]>([]);
	const me = JSON.parse(localStorage.getItem("user")) as User;
	const [groups, setGroups] = useState<Group[]>([]);
	const yearContext = useContext(YearContext);

	const isAllWorksHasGroup = () => {
		for (const work of individualWorks) {
			if (groups.findIndex((gr) => gr.id === work.groupId) < 0) {
				return false;
			}
		}
		return true;
	};

	const loadAllIndividualWorks = () => {
		ConnectionManager.getInstance().registerResponseOnceHandler(
			RequestType.GET_GROUP_BY_ID,
			(data) => {
				const dataMessage = data as RequestMessage<Group[]>;
				if (dataMessage.requestCode === RequestCode.RES_CODE_INTERNAL_ERROR) {
					console.log(`Error: ${dataMessage.requestCode}`);
					return;
				}

				setGroups(dataMessage.data);
			}
		);
		ConnectionManager.getInstance().registerResponseOnceHandler(
			RequestType.GET_INDIVIDUAL_WORKS_BY_USER,
			(data) => {
				const dataMessage = data as RequestMessage<IndividualWork[]>;
				if (dataMessage.requestCode === RequestCode.RES_CODE_INTERNAL_ERROR) {
					console.log(`Error: ${dataMessage.requestCode}`);
					return;
				}
				dataMessage.data.forEach((w) => (w.date = new Date(w.date)));
				setIndividualWorks(dataMessage.data);

				ConnectionManager.getInstance().emit(
					RequestType.GET_GROUP_BY_ID,
					dataMessage.data
						.map((w) => w.groupId)
						.filter((value, index, self) => self.indexOf(value) === index)
				);
			}
		);
		ConnectionManager.getInstance().emit(
			RequestType.GET_INDIVIDUAL_WORKS_BY_USER,
			{ userId: me.id }
		);
	};

	useEffect(() => {
		loadAllIndividualWorks();
	}, []);

	const createIndividualWork = (work: IndividualWork) => {
		ConnectionManager.getInstance().registerResponseOnceHandler(
			RequestType.UPDATE_INDIVIDUAL_WORK,
			(data) => {
				const dataMessage = data as RequestMessage<IndividualWork>;
				if (dataMessage.requestCode === RequestCode.RES_CODE_INTERNAL_ERROR) {
					console.log(`Error: ${dataMessage.requestCode}`);
					message.error("Сталася помилка! Зверніться до адміністратору!");
					return;
				}

				message.success("Успішно!");
				loadAllIndividualWorks();
			}
		);
		ConnectionManager.getInstance().emit(
			RequestType.UPDATE_INDIVIDUAL_WORK,
			work
		);
	};

	const onAddWorkClick = () => {
		const modal = Modal.info({
			title: "Додавання індивідуальної роботи",
			width: window.screen.width * 0.6,
			style: { top: 20 },
			closable: true,
			okButtonProps: {
				style: { visibility: "hidden" },
			},
			zIndex: 1050,
		});
		const onCreate = (work: IndividualWork) => {
			// setSubject(subject);
			// setSelectSubjectPath(path);
			work.userId = me.id;
			createIndividualWork(work);
			modal.destroy();
		};
		const onClose = () => {};
		modal.update({
			content: (
				<div
					style={{
						height: "auto",
						// minHeight: "500px",
					}}
				>
					<IndividualWorkCreator
						onCreate={onCreate}
						onClose={onClose}
					></IndividualWorkCreator>
				</div>
			),
		});
	};

	if (
		individualWorks.length < 1 ||
		groups.length < 1 ||
		!isAllWorksHasGroup()
	) {
		return (
			<div>
				<Button
					block
					type={"dashed"}
					style={{ height: "5%" }}
					onClick={onAddWorkClick}
				>
					Додати індівідуальну роботу
				</Button>
				<Spin size="large"></Spin>
			</div>
		);
	}

	const columns: ColumnsType<any> = [
		{
			title: "Навчальна група",
			dataIndex: "group",
			key: "group",
			ellipsis: true,
			width: "max-content",
			fixed: "left",
			render: (value, record: StudentProcessTableData) => {
				return (
					<Button type="link" style={{ width: "auto" }}>
						{GenerateGroupName(
							groups.find((gr) => gr.id === record.work.groupId)
						)}
					</Button>
				);
			},
		},
		{
			title: "Прізвища та ініціали",
			dataIndex: "fullnames",
			key: "fullnames",
			ellipsis: true,
			width: "max-content",
			render: (value, record: StudentProcessTableData) => {
				return (
					<div>
						{record.work.users.map((user) => (
							<Row>
								<Typography.Text strong>{user.fullname}</Typography.Text>
							</Row>
						))}
					</div>
				);
			},
		},
		{
			title: "Дата та зміст роботи",
			dataIndex: "data",
			key: "data",
			render: (value, record: StudentProcessTableData) => {
				return (
					<div>
						<Row>
							<Typography.Text strong>Дата:</Typography.Text>{" "}
							{record.work.date.toLocaleDateString("uk", {
								year: "2-digit",
								month: "2-digit",
								day: "2-digit",
							})}
						</Row>
						<Row>
							<Typography.Text strong>Зміст:</Typography.Text>{" "}
							{record.work.content}
						</Row>
					</div>
				);
			},
			sorter: (a: StudentProcessTableData, b: StudentProcessTableData) =>
				a.work.date < b.work.date ? -1 : 1,
			defaultSortOrder: "descend",
		},
	];

	const tableData: StudentProcessTableData[] = individualWorks.map<StudentProcessTableData>(
		(individualWork) => {
			return {
				key: individualWork.id,
				work: individualWork,
			};
		}
	);

	return (
		<div>
			<Button
				block
				type={"dashed"}
				style={{ height: "5%" }}
				onClick={onAddWorkClick}
			>
				Додати індівідуальну роботу
			</Button>
			<Divider></Divider>
			<Table
				dataSource={tableData}
				columns={columns}
				bordered
				style={{ width: "auto" }}
				scroll={{ x: "max-content" }}
			></Table>
		</div>
	);
};
