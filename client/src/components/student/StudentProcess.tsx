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
	Col,
} from "antd";
import { IndividualWorkCreator } from "./IndividualWorkCreator";
import { Group } from "../../types/group";
import { GenerateGroupName } from "../../helpers/GroupHelper";
import { YearContext } from "../../context/YearContext";
import { ExcelExporter } from "../ui/excel-exporter/ExcelExporter";
import { IndividualWorkExport } from "../ui/excel-exporter/exporters/IndividualWorkExporter";
import { BackPage } from "../ui/BackPage";

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
			width: window.screen.width * 0.9,
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

	// if (
	// 	individualWorks.length < 1 ||
	// 	groups.length < 1 ||
	// 	!isAllWorksHasGroup()
	// ) {
	// 	return (
	// 		<div>
	// 			<BackPage></BackPage>
	// 			<Row style={{ width: "100%" }} justify="center">
	// 				<Col flex="auto">
	// 					<Button
	// 						type={"dashed"}
	// 						style={{ width: "100%" }}
	// 						onClick={onAddWorkClick}
	// 						className="fade-in-left"
	// 					>
	// 						Додати індівідуальну роботу
	// 					</Button>
	// 				</Col>
	// 			</Row>
	// 			<Spin size="large"></Spin>
	// 		</div>
	// 	);
	// }

	const columns: ColumnsType<any> = [
		{
			title: "Навчальна група",
			dataIndex: "group",
			key: "group",
			// ellipsis: true,
			// width: "max-content",
			// fixed: "left",
			render: (value, record: StudentProcessTableData) => {
				return (
					<Button type="link" style={{ width: "auto" }}>
						{groups.length > 0 &&
							GenerateGroupName(
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
			// ellipsis: true,
			// width: "max-content",
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
				console.log("content", record.work.content);

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
							<Typography.Text strong>Зміст:</Typography.Text>
							<Typography.Paragraph
								ellipsis={{ rows: 3, symbol: "показати", expandable: true }}
								style={{ wordBreak: "break-word", whiteSpace: "pre-wrap" }}
							>
								{record.work.content}
							</Typography.Paragraph>
						</Row>
					</div>
				);
			},
			sorter: (a: StudentProcessTableData, b: StudentProcessTableData) =>
				a.work.date < b.work.date ? -1 : 1,
			defaultSortOrder: "descend",
			width: "70%",
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
			<BackPage></BackPage>
			<Row justify="end">
				<Row style={{ width: "30%" }}>
					<Col flex="auto">
						<Button
							type={"dashed"}
							style={{ width: "100%" }}
							onClick={onAddWorkClick}
							className="fade-in-left"
						>
							Додати індівідуальну роботу
						</Button>
					</Col>
					<Col flex="30%">
						<ExcelExporter
							bufferFunction={() => {
								return IndividualWorkExport(
									tableData.map((d) =>
										groups.find((gr) => gr.id === d.work.groupId)
									),
									tableData.map((d) => d.work)
								);
							}}
							fileName={
								me.secondName +
								" " +
								me.firstName +
								": індивідуальна робота з курсантами"
							}
						></ExcelExporter>
					</Col>
				</Row>
			</Row>

			<Divider></Divider>
			<Row
				justify="center"
				style={{ marginBottom: "1%" }}
				className="swing-in-top-fwd"
			>
				<Table
					dataSource={tableData}
					columns={columns}
					bordered
					style={{ width: "80%" }}
					size="small"
					pagination={false}
					//scroll={{ x: "" }}
				></Table>
			</Row>
		</div>
	);
};
