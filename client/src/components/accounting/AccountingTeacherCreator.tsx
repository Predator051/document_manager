import "moment/locale/uk";

import {
	Button,
	Descriptions,
	Input,
	Row,
	Select,
	DatePicker,
	Spin,
} from "antd";
import * as momentSpace from "moment";
import moment from "moment";
import React, { useEffect, useState } from "react";

import { User, UserType } from "../../types/user";
import "../../../node_modules/hover.css/css/hover.css";
import { AccountingTeacher } from "../../types/accountingTeacher";
import { STANDART_VALUES, STANDART_KEYS } from "../../types/constants";
import { ConnectionManager } from "../../managers/connetion/connectionManager";
import { RequestType, RequestMessage, RequestCode } from "../../types/requests";
import DatePickerLocal from "antd/es/date-picker/locale/uk_UA";

momentSpace.locale("uk");

interface AccountingTeacherCreatorProps {
	onClose: () => void;
	onCreate: (user: AccountingTeacher) => void;
}

export const AccountingTeacherCreator: React.FC<AccountingTeacherCreatorProps> = (
	props: AccountingTeacherCreatorProps
) => {
	const me = JSON.parse(localStorage.getItem("user")) as User;
	const [accounting, setAccounting] = useState<AccountingTeacher>({
		content: "",
		date: new Date(),
		from: me,
		to: User.EmptyUser(),
		fromPosition: "",
		fromRank: "",
		fromSecondname: "",
		id: 0,
	});
	const [standartValues, setStandardValues] = useState<
		typeof STANDART_VALUES | undefined
	>(undefined);

	useEffect(() => {
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

	const descriptionItemLabelStyle: React.CSSProperties = {
		width: "45%",
		backgroundColor: "#e1e3f0",
		fontSize: "large",
	};

	const descriptionItemContentStyle: React.CSSProperties = {
		width: "45%",
		backgroundColor: "#edf0fc",
		fontSize: "large",
	};
	const secondnameChange: (
		event: React.ChangeEvent<HTMLInputElement>
	) => void = ({ target: { value } }) => {
		setAccounting({ ...accounting, fromSecondname: value });
	};

	const contentChange: (
		event: React.ChangeEvent<HTMLTextAreaElement>
	) => void = ({ target: { value } }) => {
		setAccounting({ ...accounting, content: value });
	};

	const positionChange: (
		event: React.ChangeEvent<HTMLInputElement>
	) => void = ({ target: { value } }) => {
		setAccounting({ ...accounting, fromPosition: value });
	};

	const rankChange: (event: React.ChangeEvent<HTMLInputElement>) => void = ({
		target: { value },
	}) => {
		setAccounting({ ...accounting, fromRank: value });
	};

	const dateChange = (value: momentSpace.Moment) => {
		setAccounting({ ...accounting, date: value.toDate() });
	};

	const onCreateClick = () => {
		props.onCreate(accounting);
	};

	if (standartValues === undefined) {
		return <Spin></Spin>;
	}

	return (
		<div style={{ marginTop: "1%" }}>
			<Row justify="center">
				<Descriptions title="" bordered style={{ width: "100%" }}>
					<Descriptions.Item
						label="Вкажіть дату:"
						span={3}
						labelStyle={descriptionItemLabelStyle}
						contentStyle={descriptionItemContentStyle}
					>
						<DatePicker
							onChange={dateChange}
							value={moment(accounting.date)}
							locale={DatePickerLocal}
							clearIcon={false}
							format="DD-MM-YYYY"
						></DatePicker>
					</Descriptions.Item>
					<Descriptions.Item
						label="Введіть вказівку чи зауваження"
						span={3}
						labelStyle={descriptionItemLabelStyle}
						contentStyle={descriptionItemContentStyle}
					>
						<Input.TextArea
							style={{ width: "100%" }}
							onChange={contentChange}
						></Input.TextArea>
					</Descriptions.Item>
					{me.id === standartValues.get(STANDART_KEYS.STANDART_VIEWER) && (
						<Descriptions.Item
							label="Введіть ваше прізвище:"
							span={3}
							labelStyle={descriptionItemLabelStyle}
							contentStyle={descriptionItemContentStyle}
						>
							<div className="hvr-bubble-float-left" style={{ width: "85%" }}>
								<Input
									style={{ width: "100%" }}
									onChange={secondnameChange}
								></Input>
							</div>
						</Descriptions.Item>
					)}
					{me.id === standartValues.get(STANDART_KEYS.STANDART_VIEWER) && (
						<Descriptions.Item
							label="Введіть вашу посаду:"
							span={3}
							labelStyle={descriptionItemLabelStyle}
							contentStyle={descriptionItemContentStyle}
						>
							<div className="hvr-bubble-float-left" style={{ width: "85%" }}>
								<Input
									style={{ width: "100%" }}
									onChange={positionChange}
								></Input>
							</div>
						</Descriptions.Item>
					)}
					{me.id === standartValues.get(STANDART_KEYS.STANDART_VIEWER) && (
						<Descriptions.Item
							label="Введіть ваше звання:"
							span={3}
							labelStyle={descriptionItemLabelStyle}
							contentStyle={descriptionItemContentStyle}
						>
							<div className="hvr-bubble-float-left" style={{ width: "85%" }}>
								<Input style={{ width: "100%" }} onChange={rankChange}></Input>
							</div>
						</Descriptions.Item>
					)}
				</Descriptions>
			</Row>

			<Row justify="end" style={{ marginTop: "1%" }}>
				<Button
					type={"primary"}
					disabled={
						accounting.content === "" ||
						me.id === standartValues.get(STANDART_KEYS.STANDART_VIEWER)
							? accounting.fromPosition === "" ||
							  accounting.fromRank === "" ||
							  accounting.fromSecondname === ""
							: false
					}
					onClick={onCreateClick}
				>
					Створити
				</Button>
			</Row>
		</div>
	);
};
