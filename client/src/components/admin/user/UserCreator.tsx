import "moment/locale/uk";

import {
	Button,
	Descriptions,
	Input,
	Row,
	Select,
	message,
	Divider,
	Modal,
} from "antd";
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
import { PlusOutlined } from "@ant-design/icons";

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

	const updatePosition = (position: Position) => {
		ConnectionManager.getInstance().registerResponseOnceHandler(
			RequestType.UPDATE_POSITIONS,
			(data) => {
				const dataMessage = data as RequestMessage<any>;
				if (dataMessage.requestCode === RequestCode.RES_CODE_INTERNAL_ERROR) {
					console.log(`Error: ${dataMessage.requestCode}`);
					message.error(
						"Сталася помилка! Спробуйте ще раз чи зверніться до адміністратора!"
					);
					return;
				}

				message.success("Успішно");
				loadAllPositions();
			}
		);
		ConnectionManager.getInstance().emit(
			RequestType.UPDATE_POSITIONS,
			position
		);
	};

	const updateRank = (rank: Rank) => {
		ConnectionManager.getInstance().registerResponseOnceHandler(
			RequestType.UPDATE_RANK,
			(data) => {
				const dataMessage = data as RequestMessage<any>;
				if (dataMessage.requestCode === RequestCode.RES_CODE_INTERNAL_ERROR) {
					console.log(`Error: ${dataMessage.requestCode}`);
					message.error(
						"Сталася помилка! Спробуйте ще раз чи зверніться до адміністратора!"
					);
					return;
				}
				message.success("Успішно");
				loadAllRanks();
			}
		);
		ConnectionManager.getInstance().emit(RequestType.UPDATE_RANK, rank);
	};

	const updateSubdivision = (subdivision: Subdivision) => {
		ConnectionManager.getInstance().registerResponseOnceHandler(
			RequestType.UPDATE_SUBDIVISION,
			(data) => {
				const dataMessage = data as RequestMessage<any>;
				if (dataMessage.requestCode === RequestCode.RES_CODE_INTERNAL_ERROR) {
					console.log(`Error: ${dataMessage.requestCode}`);
					message.error(
						"Сталася помилка! Спробуйте ще раз чи зверніться до адміністратора!"
					);
					return;
				}

				message.success("Успішно");
				loadAllSubdivisions();
			}
		);
		ConnectionManager.getInstance().emit(
			RequestType.UPDATE_SUBDIVISION,
			subdivision
		);
	};

	const onCreateSubdivisionClick = () => {
		var title = "";
		const onChange: (event: React.ChangeEvent<HTMLInputElement>) => void = ({
			target: { value },
		}) => {
			title = value;
		};
		const onCreate = () => {
			updateSubdivision({ id: 0, title: title });
		};
		const modal = Modal.info({
			title: "Створення підрозділу",
			width: window.screen.width * 0.7,
			style: { top: 20 },
			closable: true,
			onOk: onCreate,
			zIndex: 1050,
			content: (
				<div
					style={{
						height: "auto",
						// minHeight: "500px",
					}}
				>
					<Input
						style={{ width: "100%" }}
						placeholder="Введіть назву підрозділу"
						onChange={onChange}
					></Input>
				</div>
			),
		});
	};

	const onCreateRankClick = () => {
		var title = "";
		const onChangeTitle: (
			event: React.ChangeEvent<HTMLInputElement>
		) => void = ({ target: { value } }) => {
			title = value;
		};
		const onCreate = () => {
			updateRank({ id: 0, title, type: RankType.STANDART });
		};
		const modal = Modal.info({
			title: "Додавання звання",
			width: window.screen.width * 0.7,
			style: { top: 20 },
			closable: true,
			onOk: onCreate,
			zIndex: 1050,
			content: (
				<div
					style={{
						height: "auto",
						// minHeight: "500px",
					}}
				>
					<Input
						style={{ width: "100%" }}
						placeholder="Введіть звання"
						onChange={onChangeTitle}
					></Input>
				</div>
			),
		});
	};

	const onCreatePositionClick = () => {
		var title = "";
		const onChange: (event: React.ChangeEvent<HTMLInputElement>) => void = ({
			target: { value },
		}) => {
			title = value;
		};
		const onSubjectCreate = () => {
			updatePosition({ id: 0, title: title, type: PositionType.STANDART });
		};
		const modal = Modal.info({
			title: "Створення посади",
			width: window.screen.width * 0.7,
			style: { top: 20 },
			closable: true,
			onOk: onSubjectCreate,
			zIndex: 1050,
			content: (
				<div
					style={{
						height: "auto",
						// minHeight: "500px",
					}}
				>
					<Input
						style={{ width: "100%" }}
						placeholder="Введіть назву посади"
						onChange={onChange}
					></Input>
				</div>
			),
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
								dropdownRender={(menu) => (
									<div style={{ zIndex: 1000 }}>
										{menu}
										<Divider style={{ margin: "4px 0" }}></Divider>
										<div
											style={{
												display: "flex",
												flexWrap: "nowrap",
												padding: 8,
											}}
										>
											<Button
												type="link"
												onClick={onCreateSubdivisionClick}
												icon={<PlusOutlined></PlusOutlined>}
											>
												Додати посаду
											</Button>
										</div>
									</div>
								)}
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
								dropdownRender={(menu) => (
									<div style={{ zIndex: 1000 }}>
										{menu}
										<Divider style={{ margin: "4px 0" }}></Divider>
										<div
											style={{
												display: "flex",
												flexWrap: "nowrap",
												padding: 8,
											}}
										>
											<Button
												type="link"
												onClick={onCreatePositionClick}
												icon={<PlusOutlined></PlusOutlined>}
											>
												Створити нову посаду
											</Button>
										</div>
									</div>
								)}
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
								dropdownRender={(menu) => (
									<div style={{ zIndex: 1000 }}>
										{menu}
										<Divider style={{ margin: "4px 0" }}></Divider>
										<div
											style={{
												display: "flex",
												flexWrap: "nowrap",
												padding: 8,
											}}
										>
											<Button
												type="link"
												onClick={onCreateRankClick}
												icon={<PlusOutlined></PlusOutlined>}
											>
												Додати звання
											</Button>
										</div>
									</div>
								)}
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
