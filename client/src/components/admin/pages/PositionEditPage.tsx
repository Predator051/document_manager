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
} from "antd";
import Avatar from "antd/lib/avatar/avatar";
import { message } from "antd";
import { PlusOutlined } from "@ant-design/icons";

export interface PositionEditPageProps {}

export const PositionEditPage: React.FC<PositionEditPageProps> = (
	props: PositionEditPageProps
) => {
	const [positions, setPositions] = useState<Position[]>([]);
	const [selectedPosition, setSelectedPosition] = useState<
		Position | undefined
	>(undefined);
	const [users, setUsers] = useState<User[]>([]);

	const loadAllPositions = () => {
		ConnectionManager.getInstance().registerResponseOnceHandler(
			RequestType.GET_ALL_POSITIONS,
			(data) => {
				const dataMessage = data as RequestMessage<Position[]>;
				if (dataMessage.requestCode === RequestCode.RES_CODE_INTERNAL_ERROR) {
					console.log(`Error: ${dataMessage.requestCode}`);
					return;
				}

				setPositions(
					dataMessage.data.filter((p) => p.type !== PositionType.CUSTOM)
				);
			}
		);
		ConnectionManager.getInstance().emit(RequestType.GET_ALL_POSITIONS, {});
	};

	useEffect(() => {
		loadAllPositions();
		ConnectionManager.getInstance().registerResponseOnceHandler(
			RequestType.GET_ALL_USERS,
			(data) => {
				const dataMessage = data as RequestMessage<User[]>;
				if (dataMessage.requestCode === RequestCode.RES_CODE_INTERNAL_ERROR) {
					console.log(`Error: ${dataMessage.requestCode}`);
					return;
				}

				setUsers(dataMessage.data);
			}
		);
		ConnectionManager.getInstance().emit(RequestType.GET_ALL_USERS, {});
	}, []);

	const editTitlePositionChange: (
		event: React.ChangeEvent<HTMLInputElement>
	) => void = ({ target: { value } }) => {
		setSelectedPosition({ ...selectedPosition, title: value });
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

	const onUpdateTitleClick = () => {
		updatePosition(selectedPosition);
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

	// if (users.length < 1) {
	// 	return <Spin size="large"></Spin>;
	// }

	return (
		<div>
			<Row justify={"center"}>
				<Col flex="50%">
					<Typography.Text>Оберіть чи створіть нову посаду</Typography.Text>
					<Select
						style={{ width: "100%" }}
						onChange={(id: number) =>
							setSelectedPosition(positions.find((p) => p.id === id))
						}
						value={selectedPosition?.id}
						dropdownRender={(menu) => (
							<div style={{ zIndex: 1000 }}>
								{menu}
								<Divider style={{ margin: "4px 0" }}></Divider>
								<div
									style={{ display: "flex", flexWrap: "nowrap", padding: 8 }}
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
						{positions.map((pos) => (
							<Select.Option value={pos.id}>{pos.title}</Select.Option>
						))}
					</Select>
				</Col>
			</Row>
			<Row justify={"center"} style={{ marginTop: "1%" }}>
				{selectedPosition && (
					<Col flex="45%" style={{ marginLeft: "1%" }}>
						<Typography.Title level={4}>
							Користувачі назначені на посаду "{selectedPosition.title}"
						</Typography.Title>
						<List
							// style={{ width: "100%" }}
							itemLayout="horizontal"
							dataSource={users.filter(
								(u) => u.position.id === selectedPosition.id
							)}
							renderItem={(item) => {
								return (
									<List.Item>
										<div>
											<Row align="middle">
												<Col flex={"10%"} style={{ marginRight: "10px" }}>
													<Avatar
														style={{
															backgroundColor:
																"#" +
																Math.floor(Math.random() * 16777215).toString(
																	16
																),
														}}
													>
														{item.secondName.charAt(0) +
															item.firstName.charAt(0)}
													</Avatar>
												</Col>
												<Col flex={"auto"}>
													<Row justify="start">
														<Typography.Text strong>
															{item.secondName} {item.firstName}
														</Typography.Text>
													</Row>
												</Col>
											</Row>
										</div>
									</List.Item>
								);
							}}
						></List>
					</Col>
				)}
				{selectedPosition && (
					<Col flex="auto">
						<Typography.Title level={4}>
							Редагувати назву посади:
						</Typography.Title>
						<Input
							value={selectedPosition.title}
							onChange={editTitlePositionChange}
						></Input>
						<Button type="primary" onClick={onUpdateTitleClick}>
							Оновити
						</Button>
					</Col>
				)}
			</Row>
		</div>
	);
};
