import React, { useEffect, useState, useContext } from "react";
import { User, UserType } from "../../types/user";
import { ConnectionManager } from "../../managers/connetion/connectionManager";
import { RequestType, RequestMessage, RequestCode } from "../../types/requests";
import { AccountingTeacher } from "../../types/accountingTeacher";
import { ColumnsType } from "antd/lib/table/interface";
import {
	Table,
	Button,
	Row,
	Affix,
	Modal,
	message,
	Typography,
	Empty,
	Spin,
} from "antd";
import "../../../node_modules/hover.css/css/hover.css";
import { AccountingTeacherCreator } from "../accounting/AccountingTeacherCreator";
import { STANDART_VALUES, STANDART_KEYS } from "../../types/constants";
import "../../animations/text-focus-in.css";
import { isYearCurrent, YearContext } from "../../context/YearContext";

export interface TeacherAccountingProps {
	userId: number;
}

interface TeacherAccountingTableData {
	key: number;
	data: AccountingTeacher;
}

export const TeacherAccounting: React.FC<TeacherAccountingProps> = (
	props: TeacherAccountingProps
) => {
	const [user, setUser] = useState<User | undefined>(undefined);
	const [accountingTeachers, setAccountingTeachers] = useState<
		AccountingTeacher[]
	>([]);
	const [standartValues, setStandardValues] = useState<
		typeof STANDART_VALUES | undefined
	>(undefined);
	const yearContext = useContext(YearContext);

	const me = JSON.parse(localStorage.getItem("user")) as User;

	const loadAllAccounting = () => {
		ConnectionManager.getInstance().registerResponseOnceHandler(
			RequestType.GET_ACCOUNTING_TEACHER_BY_USER,
			(data) => {
				const dataMessage = data as RequestMessage<AccountingTeacher[]>;
				if (dataMessage.requestCode === RequestCode.RES_CODE_INTERNAL_ERROR) {
					console.log(`Error: ${dataMessage.requestCode}`);
					return;
				}
				console.log("receive", dataMessage.data);
				dataMessage.data.forEach((acc) => (acc.date = new Date(acc.date)));
				setAccountingTeachers(dataMessage.data);
			}
		);
		ConnectionManager.getInstance().emit(
			RequestType.GET_ACCOUNTING_TEACHER_BY_USER,
			{ userId: props.userId, year: yearContext.year }
		);
	};

	useEffect(() => {
		ConnectionManager.getInstance().registerResponseOnceHandler(
			RequestType.GET_ACCOUNTING_TEACHER_BY_USER,
			(data) => {
				const dataMessage = data as RequestMessage<AccountingTeacher[]>;
				if (dataMessage.requestCode === RequestCode.RES_CODE_INTERNAL_ERROR) {
					console.log(`Error: ${dataMessage.requestCode}`);
					return;
				}
				dataMessage.data.forEach((acc) => (acc.date = new Date(acc.date)));
				console.log("receive", dataMessage.data);
				setAccountingTeachers(dataMessage.data);
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
				console.log("receive", dataMessage.data);
				setUser(dataMessage.data);

				ConnectionManager.getInstance().emit(
					RequestType.GET_ACCOUNTING_TEACHER_BY_USER,

					{ userId: props.userId, year: yearContext.year }
				);
			}
		);
		ConnectionManager.getInstance().emit(
			RequestType.GET_USER_INFO,
			props.userId
		);
		ConnectionManager.getInstance().registerResponseOnceHandler(
			RequestType.GET_STANDART_VALUES,
			(data) => {
				const dataMessage = data as RequestMessage<[STANDART_KEYS, number][]>;
				if (dataMessage.requestCode === RequestCode.RES_CODE_INTERNAL_ERROR) {
					console.log(`Error: ${dataMessage.requestCode}`);
					return;
				}

				console.log("recieve", dataMessage);

				setStandardValues(new Map<STANDART_KEYS, number>(dataMessage.data));
			}
		);
		ConnectionManager.getInstance().emit(RequestType.GET_STANDART_VALUES, {});
	}, []);

	const columns: ColumnsType<any> = [
		{
			title: "Дата перевірки",
			dataIndex: "Date",
			key: "Date",
			render: (value, record: TeacherAccountingTableData) => {
				return (
					<div className="text-focus-in">
						{record.data.date.toLocaleDateString("uk", {
							year: "numeric",
							month: "2-digit",
							day: "2-digit",
						})}
					</div>
				);
			},
			sorter: (
				a: TeacherAccountingTableData,
				b: TeacherAccountingTableData
			) => {
				return a.data.date < b.data.date ? -1 : 1;
			},
			defaultSortOrder: "descend",
		},
		{
			title:
				"Зауваження та вказівки щодо проведення заняття, ведення обліку та журналу",
			dataIndex: "Content",
			key: "Content",
			render: (value, record: TeacherAccountingTableData) => {
				return (
					<div
						className="text-focus-in"
						style={{ wordBreak: "break-word", width: "100%" }}
					>
						<Typography.Paragraph
							ellipsis={{
								rows: 1,
								expandable: true,
								symbol: "показати",
							}}
						>
							{record.data.content}
						</Typography.Paragraph>
					</div>
				);
			},
			width: "50%",
		},
		{
			title: "Посада, військове звання, прізвище, підпис того, хто перевіряє",
			dataIndex: "From",
			key: "From",
			render: (value, record: TeacherAccountingTableData) => {
				if (
					record.data.from.id ===
					standartValues.get(STANDART_KEYS.STANDART_VIEWER)
				) {
					return (
						<div className="text-focus-in">
							<Row>
								<div className="hvr-forward">
									{/* <CaretRightOutlined className="hvr-icon"></CaretRightOutlined> */}
									{/* <Typography.Text strong>Посада: </Typography.Text> */}
									{record.data.fromPosition}
								</div>
							</Row>
							<Row>
								<div className="hvr-forward">
									{/* <CaretRightOutlined className="hvr-icon"></CaretRightOutlined> */}
									{/* <Typography.Text strong>Військове звання: </Typography.Text> */}
									{record.data.fromRank}
								</div>
							</Row>
							<Row>
								<div className="hvr-forward">
									{/* <CaretRightOutlined className="hvr-icon"></CaretRightOutlined> */}
									{/* <Typography.Text strong>Прізвище: </Typography.Text> */}
									{record.data.fromSecondname}
								</div>
							</Row>
						</div>
					);
				}

				return (
					<div className="text-focus-in">
						<Row>
							<div className="hvr-forward">
								{/* <Typography.Text strong>Посада: </Typography.Text> */}
								{record.data.from.position.title}
							</div>
						</Row>
						<Row>
							<div className="hvr-forward">
								{/* <Typography.Text strong>Військове звання: </Typography.Text> */}
								{record.data.from.rank.title}
							</div>
						</Row>
						<Row>
							<div className="hvr-forward">
								{/* <Typography.Text strong>Прізвище: </Typography.Text> */}
								{record.data.from.secondName}
							</div>
						</Row>
					</div>
				);
			},
		},
	];

	const tableData: TeacherAccountingTableData[] = accountingTeachers.map<TeacherAccountingTableData>(
		(acc) => ({ data: acc, key: acc.id })
	);

	const updateAccounting = (acc: AccountingTeacher) => {
		ConnectionManager.getInstance().registerResponseOnceHandler(
			RequestType.UPDATE_ACCOUNTING_TEACHER,
			(data) => {
				const dataMessage = data as RequestMessage<User>;
				if (dataMessage.requestCode === RequestCode.RES_CODE_INTERNAL_ERROR) {
					console.log(
						`Error: ${dataMessage.requestCode} ${dataMessage.messageInfo}`
					);
					message.error("Сталася помилка! Зверніться до адміністратора!");
					return;
				}

				loadAllAccounting();
				message.success("Успішно!");
			}
		);
		ConnectionManager.getInstance().emit(
			RequestType.UPDATE_ACCOUNTING_TEACHER,
			acc
		);
	};

	const onCreateClick = () => {
		const modal = Modal.info({
			title: "Додавання зауваження чи вказіки",
			width: window.screen.width * 0.6,
			style: { top: 20 },
			closable: true,
			okButtonProps: {
				style: { visibility: "hidden" },
			},
			zIndex: 1050,
		});
		const onSubjectCreate = (accounting: AccountingTeacher) => {
			updateAccounting({ ...accounting, to: user });
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
					<AccountingTeacherCreator
						onCreate={onSubjectCreate}
						onClose={onSubjectCreatorClose}
					></AccountingTeacherCreator>
				</div>
			),
		});
	};

	return (
		<div className="text-focus-in">
			{me.userType === UserType.VIEWER && isYearCurrent(yearContext) ? (
				<Row
					justify="end"
					align="bottom"
					style={{ height: "auto", marginRight: "1%", marginBottom: "1%" }}
				>
					<Affix offsetTop={10}>
						<Button
							type="primary"
							className="hvr-backward"
							onClick={onCreateClick}
						>
							Додати зауваження чи вказівку
						</Button>
					</Affix>
				</Row>
			) : (
				<div></div>
			)}
			<Row justify="center" style={{ marginBottom: "1%" }}>
				<Table
					columns={columns}
					dataSource={tableData}
					bordered
					size="small"
					pagination={false}
					style={{ width: "80%" }}
				></Table>
			</Row>
		</div>
	);
};
