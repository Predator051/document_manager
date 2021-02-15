import React, { useEffect, useState } from "react";
import { ConnectionManager } from "../../../managers/connetion/connectionManager";
import {
	RequestType,
	RequestMessage,
	RequestCode,
} from "../../../types/requests";
import { Position } from "../../../types/position";
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
import { Subdivision } from "../../../types/subdivision";

export interface SubdivisionEditPageProps {}

export const SubdivisionEditPage: React.FC<SubdivisionEditPageProps> = (
	props: SubdivisionEditPageProps
) => {
	const [subdivisions, setSubdivisions] = useState<Subdivision[]>([]);
	const [selectedSubdivision, setSelectedSubdivision] = useState<
		Subdivision | undefined
	>(undefined);
	const [users, setUsers] = useState<User[]>([]);

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
		loadAllSubdivisions();
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

	const editTitleSubdivisionChange: (
		event: React.ChangeEvent<HTMLInputElement>
	) => void = ({ target: { value } }) => {
		setSelectedSubdivision({ ...selectedSubdivision, title: value });
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

	const onUpdateTitleClick = () => {
		updateSubdivision(selectedSubdivision);
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
			width: window.screen.width * 0.2,
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

	// if (users.length < 1) {
	// 	return <Spin size="large"></Spin>;
	// }

	return (
		<div>
			<Row justify={"center"}>
				<Col flex="50%">
					<Typography.Text>Оберіть чи створіть новий підрозділ</Typography.Text>
					<Select
						style={{ width: "100%" }}
						onChange={(id: number) =>
							setSelectedSubdivision(subdivisions.find((p) => p.id === id))
						}
						value={selectedSubdivision?.id}
						dropdownRender={(menu) => (
							<div style={{ zIndex: 1000 }}>
								{menu}
								<Divider style={{ margin: "4px 0" }}></Divider>
								<div
									style={{ display: "flex", flexWrap: "nowrap", padding: 8 }}
								>
									<Button
										type="link"
										onClick={onCreateSubdivisionClick}
										icon={<PlusOutlined></PlusOutlined>}
									>
										Створити новий підрозділ
									</Button>
								</div>
							</div>
						)}
					>
						{subdivisions.map((pos) => (
							<Select.Option value={pos.id}>{pos.title}</Select.Option>
						))}
					</Select>
				</Col>
			</Row>
			<Row justify={"center"} style={{ marginTop: "1%" }}>
				{selectedSubdivision && (
					<Col flex="45%" style={{ marginLeft: "1%" }}>
						<Typography.Title level={4}>
							Користувачі в підрозділу "{selectedSubdivision.title}"
						</Typography.Title>
						<List
							// style={{ width: "100%" }}
							itemLayout="horizontal"
							dataSource={users.filter(
								(u) => u.cycle.id === selectedSubdivision.id
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
				{selectedSubdivision && (
					<Col flex="auto">
						<Typography.Title level={4}>
							Редагувати назву посади:
						</Typography.Title>
						<Input
							value={selectedSubdivision.title}
							onChange={editTitleSubdivisionChange}
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
