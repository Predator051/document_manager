import "moment/locale/uk";

import { Button, Descriptions, Input, Row, Select } from "antd";
import * as moment from "moment";
import React, { useEffect, useState } from "react";

import { User, UserType } from "../../../types/user";
import "../../../../node_modules/hover.css/css/hover.css";
import { ConnectionManager } from "../../../managers/connetion/connectionManager";
import {
	RequestType,
	RequestMessage,
	RequestCode,
} from "../../../types/requests";
import { Subdivision } from "../../../types/subdivision";
import { Position, PositionType } from "../../../types/position";
import { Rank, RankType } from "../../../types/rank";

moment.locale("uk");

interface UserCreatorProps {
	onClose: () => void;
	onCreate: (user: User) => void;
}

export const UserCreator: React.FC<UserCreatorProps> = (
	props: UserCreatorProps
) => {
	const [userType, setUserType] = useState<UserType | undefined>(undefined);

	const [login, setLogin] = useState<string>("");
	const [firstname, setFirstname] = useState<string>("");
	const [secondname, setSecondname] = useState<string>("");
	const [customPosition, setCustomPosition] = useState<string>("");
	const [customRank, setCustomRank] = useState<string>("");

	const [ranks, setRanks] = useState<Rank[]>([]);
	const [selectedRank, setSelectedRank] = useState<Rank | undefined>(undefined);

	const [positions, setPositions] = useState<Position[]>([]);
	const [selectedPosition, setSelectedPosition] = useState<
		Position | undefined
	>(undefined);

	const [subdivisions, setSubdivisions] = useState<Subdivision[]>([]);
	const [selectedSubdivision, setSelectedSubdivision] = useState<
		Subdivision | undefined
	>(undefined);

	const loadAllPositions = () => {
		ConnectionManager.getInstance().registerResponseOnceHandler(
			RequestType.GET_ALL_POSITIONS,
			(data) => {
				const dataMessage = data as RequestMessage<Position[]>;
				if (dataMessage.requestCode === RequestCode.RES_CODE_INTERNAL_ERROR) {
					console.log(`Error: ${dataMessage.requestCode}`);
					return;
				}

				setPositions(dataMessage.data);
			}
		);
		ConnectionManager.getInstance().emit(RequestType.GET_ALL_POSITIONS, {});
	};

	const loadAllRanks = () => {
		ConnectionManager.getInstance().registerResponseOnceHandler(
			RequestType.GET_ALL_RANKS,
			(data) => {
				const dataMessage = data as RequestMessage<Rank[]>;
				if (dataMessage.requestCode === RequestCode.RES_CODE_INTERNAL_ERROR) {
					console.log(`Error: ${dataMessage.requestCode}`);
					return;
				}

				setRanks(dataMessage.data);
			}
		);
		ConnectionManager.getInstance().emit(RequestType.GET_ALL_RANKS, {});
	};

	const loadAllSubdivisions = () => {
		ConnectionManager.getInstance().registerResponseOnceHandler(
			RequestType.GET_ALL_SUBDIVISIONS,
			(data) => {
				const dataMessage = data as RequestMessage<Subdivision[]>;
				if (dataMessage.requestCode === RequestCode.RES_CODE_INTERNAL_ERROR) {
					console.log(`Error: ${dataMessage.requestCode}`);
					return;
				}

				setSubdivisions(dataMessage.data);
			}
		);
		ConnectionManager.getInstance().emit(RequestType.GET_ALL_SUBDIVISIONS, {});
	};

	useEffect(() => {
		loadAllPositions();
		loadAllSubdivisions();
		loadAllRanks();
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

	const firstnameChange: (
		event: React.ChangeEvent<HTMLInputElement>
	) => void = ({ target: { value } }) => {
		setFirstname(value);
	};

	const secondnameChange: (
		event: React.ChangeEvent<HTMLInputElement>
	) => void = ({ target: { value } }) => {
		setSecondname(value);
	};

	const customPositionChange: (
		event: React.ChangeEvent<HTMLInputElement>
	) => void = ({ target: { value } }) => {
		setCustomPosition(value);
	};

	const customRankChange: (
		event: React.ChangeEvent<HTMLInputElement>
	) => void = ({ target: { value } }) => {
		setCustomRank(value);
	};

	const loginChange: (event: React.ChangeEvent<HTMLInputElement>) => void = ({
		target: { value },
	}) => {
		setLogin(value);
	};

	const onCreateClick = () => {
		props.onCreate({
			id: 0,
			firstName: firstname,
			login: login,
			password: login,
			position:
				userType === UserType.VIEWER
					? {
							id: 0,
							title: customPosition,
							type: PositionType.CUSTOM,
					  }
					: selectedPosition
					? selectedPosition
					: {
							id: 0,
							title: "",
							type: PositionType.STANDART,
					  },
			rank:
				userType === UserType.VIEWER
					? {
							id: 0,
							title: customRank,
							type: RankType.CUSTOM,
					  }
					: selectedRank
					? selectedRank
					: {
							id: 0,
							title: "",
							type: RankType.STANDART,
					  },
			cycle: selectedSubdivision
				? selectedSubdivision
				: {
						id: 0,
						title: "",
				  },
			secondName: secondname,
			session: "",
			userType: userType,
		});
	};

	return (
		<div style={{ marginTop: "1%" }}>
			<Row justify="center">
				<Descriptions title="" bordered style={{ width: "100%" }}>
					<Descriptions.Item
						label="Введіть логин:"
						span={3}
						labelStyle={descriptionItemLabelStyle}
						contentStyle={descriptionItemContentStyle}
					>
						<div className="hvr-bubble-float-left" style={{ width: "85%" }}>
							<Input style={{ width: "100%" }} onChange={loginChange}></Input>
						</div>
					</Descriptions.Item>
					<Descriptions.Item
						label="Введіть ім`я:"
						span={3}
						labelStyle={descriptionItemLabelStyle}
						contentStyle={descriptionItemContentStyle}
					>
						<div className="hvr-bubble-float-left" style={{ width: "85%" }}>
							<Input
								style={{ width: "100%" }}
								onChange={firstnameChange}
							></Input>
						</div>
					</Descriptions.Item>
					<Descriptions.Item
						label="Введіть прізвище:"
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
					<Descriptions.Item
						label="Оберіть тип користувача:"
						span={3}
						labelStyle={descriptionItemLabelStyle}
						contentStyle={descriptionItemContentStyle}
					>
						<Select
							style={{ width: "100%" }}
							value={userType}
							onChange={(value) => {
								setUserType(value);
								setSelectedPosition(undefined);
								setSelectedSubdivision(undefined);
							}}
						>
							<Select.Option value={UserType.TEACHER}>Викладач</Select.Option>
							<Select.Option value={UserType.VIEWER}>
								Перевіряючий
							</Select.Option>
							<Select.Option value={UserType.ADMIN}>
								Адміністратор
							</Select.Option>
						</Select>
					</Descriptions.Item>
					{userType === UserType.TEACHER && (
						<Descriptions.Item
							label="Оберіть підрозділ:"
							span={3}
							labelStyle={descriptionItemLabelStyle}
							contentStyle={descriptionItemContentStyle}
						>
							<Select
								style={{ width: "100%" }}
								onChange={(value) => {
									setSelectedSubdivision(
										subdivisions.find((s) => s.id === value)
									);
								}}
							>
								{subdivisions.map((sub) => (
									<Select.Option value={sub.id}>{sub.title}</Select.Option>
								))}
							</Select>
						</Descriptions.Item>
					)}
					{userType === UserType.TEACHER && (
						<Descriptions.Item
							label="Оберіть посаду:"
							span={3}
							labelStyle={descriptionItemLabelStyle}
							contentStyle={descriptionItemContentStyle}
						>
							<Select
								style={{ width: "100%" }}
								onChange={(value) => {
									setSelectedPosition(positions.find((p) => p.id === value));
								}}
							>
								{positions
									.filter((pos) => pos.type === PositionType.STANDART)
									.map((pos) => (
										<Select.Option value={pos.id}>{pos.title}</Select.Option>
									))}
							</Select>
						</Descriptions.Item>
					)}
					{userType === UserType.TEACHER && (
						<Descriptions.Item
							label="Оберіть звання:"
							span={3}
							labelStyle={descriptionItemLabelStyle}
							contentStyle={descriptionItemContentStyle}
						>
							<Select
								style={{ width: "100%" }}
								onChange={(value) => {
									setSelectedRank(ranks.find((p) => p.id === value));
								}}
							>
								{ranks
									.filter((r) => r.type === RankType.STANDART)
									.map((pos) => (
										<Select.Option value={pos.id}>{pos.title}</Select.Option>
									))}
							</Select>
						</Descriptions.Item>
					)}
					{userType === UserType.VIEWER && (
						<Descriptions.Item
							label="Введіть посаду:"
							span={3}
							labelStyle={descriptionItemLabelStyle}
							contentStyle={descriptionItemContentStyle}
						>
							<div className="hvr-bubble-float-left" style={{ width: "85%" }}>
								<Input
									style={{ width: "100%" }}
									onChange={customPositionChange}
								></Input>
							</div>
						</Descriptions.Item>
					)}
					{userType === UserType.VIEWER && (
						<Descriptions.Item
							label="Введіть звання:"
							span={3}
							labelStyle={descriptionItemLabelStyle}
							contentStyle={descriptionItemContentStyle}
						>
							<div className="hvr-bubble-float-left" style={{ width: "85%" }}>
								<Input
									style={{ width: "100%" }}
									onChange={customRankChange}
								></Input>
							</div>
						</Descriptions.Item>
					)}
				</Descriptions>
			</Row>

			<Row justify="end" style={{ marginTop: "1%" }}>
				<Button
					type={"primary"}
					disabled={
						login === "" ||
						firstname === "" ||
						secondname === "" ||
						userType === undefined ||
						(userType === UserType.TEACHER
							? selectedPosition === undefined ||
							  selectedSubdivision === undefined
							: userType === UserType.VIEWER
							? customPosition === ""
							: false)
					}
					onClick={onCreateClick}
				>
					Створити
				</Button>
			</Row>
		</div>
	);
};
