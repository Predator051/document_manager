import React, { useState, useEffect } from "react";
import {
	Form,
	Input,
	Button,
	Radio,
	ConfigProvider,
	Modal,
	Result,
	TreeSelect,
	Select,
	Divider,
	message,
	Typography,
} from "antd";
import { Store } from "antd/lib/form/interface";
import FormLocale from "antd/es/locale/uk_UA";
import * as moment from "moment";
import "moment/locale/uk";
import { useSelector } from "react-redux";
import { selectAccount } from "../../../redux/slicers/accountSlice";
import { User, UserType } from "../../../types/user";
import { ConnectionManager } from "../../../managers/connetion/connectionManager";
import {
	RequestType,
	RequestMessage,
	RequestCode,
} from "../../../types/requests";
import { useForm } from "antd/es/form/Form";
import { PlusOutlined } from "@ant-design/icons";
// import { SwitchTransition, CSSTransition } from "react-transition-group";
import { UserCreator } from "../user/UserCreator";
import { Subdivision } from "../../../types/subdivision";
import { Position, PositionType } from "../../../types/position";
import { Rank, RankType } from "../../../types/rank";

moment.locale("uk");

interface ModalProps {
	visible: boolean;
	title: string;
	content: string;
}

interface Props {}
export const UserEditPage: React.FC<Props> = () => {
	const [users, setUsers] = useState<User[]>([]);
	const [currentUser, setCurrentUser] = useState<User | undefined>(undefined);
	const [form] = Form.useForm();

	const [positions, setPositions] = useState<Position[]>([]);
	const [subdivisions, setSubdivisions] = useState<Subdivision[]>([]);
	const [ranks, setRanks] = useState<Rank[]>([]);

	const [currentUserType, setCurrentUserType] = useState<UserType>(
		UserType.NONE
	);

	const [currentPosition, setCurrentPosition] = useState<Position>();
	const [currentRank, setCurrentRank] = useState<Rank>();

	//////VARIABLES
	const layout = {
		labelCol: { span: 8 },
		wrapperCol: { span: 16 },
	};

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

	//////CALLBACKS
	const onFinish = (data: Store) => {
		ConnectionManager.getInstance().registerResponseOnceHandler(
			RequestType.UPDATE_USER,
			(data) => {
				const dataMessage = data as RequestMessage<any>;
				if (dataMessage.requestCode === RequestCode.RES_CODE_INTERNAL_ERROR) {
					console.log(`Error: ${dataMessage.requestCode}`);
					return;
				}
				message.success("Інформація оновлена");
				loadAllUsers();
			}
		);
		const updateUserInfo = currentUser;
		if (updateUserInfo) {
			if (data.password) {
				updateUserInfo.password = data.password;
			}
			updateUserInfo.firstName = data.firstName;
			updateUserInfo.secondName = data.secondName;
			updateUserInfo.login = data.login;
			updateUserInfo.userType = data.role;

			updateUserInfo.position =
				updateUserInfo.userType === UserType.VIEWER
					? currentPosition
					: positions.find((pos) => pos.id === data.position);

			if (updateUserInfo.userType === UserType.VIEWER) {
				updateUserInfo.position.title = data.position;
			}

			updateUserInfo.rank =
				updateUserInfo.userType === UserType.VIEWER
					? currentRank
					: ranks.find((pos) => pos.id === data.rank);

			if (updateUserInfo.userType === UserType.VIEWER) {
				updateUserInfo.rank.title = data.rank;
			}

			updateUserInfo.cycle = subdivisions.find(
				(sub) => sub.id === data.subdivision
			);

			if (data.password !== undefined) {
				updateUserInfo.password = data.password;
			}

			ConnectionManager.getInstance().emit(
				RequestType.UPDATE_USER,
				updateUserInfo
			);
		}
	};

	const onUserSelect = (u_id: number) => {
		const user = users.find((u) => u.id === u_id);
		setCurrentUser(user);

		setCurrentUserType(user.userType);
		setCurrentPosition(user.position);
		setCurrentRank(user.rank);

		const store: Store = {
			login: user?.login,
			firstName: user?.firstName,
			secondName: user?.secondName,
			role: user?.userType,
			position:
				user?.userType === UserType.VIEWER
					? user.position.title
					: user?.position.id,
			subdivision: user?.cycle.id,
			password: user.password,
			rank: user?.userType === UserType.VIEWER ? user.rank.title : user.rank.id,
		};
		form.setFieldsValue(store);
	};

	useEffect(() => {
		loadAllPositions();
		loadAllSubdivisions();
		loadAllRanks();
		loadAllUsers();
	}, []);

	const loadAllUsers = () => {
		ConnectionManager.getInstance().registerResponseOnceHandler(
			RequestType.GET_ALL_USERS,
			(data) => {
				const dataMessage = data as RequestMessage<User[]>;
				if (dataMessage.requestCode === RequestCode.RES_CODE_INTERNAL_ERROR) {
					console.log(`Error: ${dataMessage.requestCode}`);
					message.success("Помилка! Дивіться лог сервера");
					return;
				}

				setUsers(dataMessage.data);
			}
		);
		ConnectionManager.getInstance().emit(RequestType.GET_ALL_USERS, {});
	};

	const updateUser = (user: User) => {
		ConnectionManager.getInstance().registerResponseOnceHandler(
			RequestType.UPDATE_USER,
			(data) => {
				const dataMessage = data as RequestMessage<any>;
				if (dataMessage.requestCode === RequestCode.RES_CODE_INTERNAL_ERROR) {
					console.log(`Error: ${dataMessage.requestCode}`);
					message.success("Помилка! Дивіться лог сервера");
					return;
				}

				message.success("Користувача успішно створено");
				loadAllUsers();
			}
		);
		ConnectionManager.getInstance().emit(RequestType.UPDATE_USER, user);
	};

	const onUserCreateClick = () => {
		const modal = Modal.info({
			title: "Створення користувача",
			width: window.screen.width * 0.9,
			style: { top: 20 },
			closable: true,
			okButtonProps: {
				style: { visibility: "hidden" },
			},
			zIndex: 1050,
		});
		const onCreate = (user: User) => {
			updateUser(user);
			modal.destroy();
		};
		const onClose = () => {};
		modal.update({
			content: (
				<div
					style={{
						height: "auto",
					}}
				>
					<UserCreator onCreate={onCreate} onClose={onClose}></UserCreator>
				</div>
			),
		});
	};

	const onFormValuesChanged = (changes: any, all: any) => {
		if (changes.role !== undefined) {
			setCurrentUserType(changes.role);
		}
		if (
			changes.position !== undefined &&
			currentUser.userType !== UserType.VIEWER
		) {
			setCurrentPosition(positions.find((pos) => pos.id === changes.position));
		}
		if (
			changes.rank !== undefined &&
			currentUser.userType !== UserType.VIEWER
		) {
			setCurrentRank(ranks.find((pos) => pos.id === changes.rank));
		}
	};
	return (
		<div
			style={{
				paddingTop: "2%",
				width: "100%",
				maxWidth: "1000px",
				margin: 0,
				textAlign: "center",
				display: "inline-block",
			}}
		>
			<Typography.Text>Оберіть користувача чи створіть нового</Typography.Text>
			<Select
				style={{ width: "80%" }}
				onSelect={onUserSelect}
				dropdownRender={(menu) => (
					<div style={{ zIndex: 1000 }}>
						{menu}
						<Divider style={{ margin: "4px 0" }}></Divider>
						<div style={{ display: "flex", flexWrap: "nowrap", padding: 8 }}>
							<Button
								type="link"
								onClick={onUserCreateClick}
								icon={<PlusOutlined></PlusOutlined>}
							>
								Створити нового користувача
							</Button>
						</div>
					</div>
				)}
			>
				{users.map((user) => {
					return (
						<Select.Option value={user.id}>
							{user.secondName} {user.firstName}
						</Select.Option>
					);
				})}
			</Select>
			<Divider style={{ borderColor: "#8c8c8c", width: "80%" }}></Divider>
			<ConfigProvider locale={FormLocale}>
				<Form
					{...layout}
					form={form}
					labelCol={{ span: 4 }}
					wrapperCol={{ span: 14 }}
					layout="horizontal"
					initialValues={{ size: "middle" }}
					onFinish={onFinish}
					style={{ visibility: currentUser ? "visible" : "hidden" }}
					onValuesChange={onFormValuesChanged}
				>
					<Form.Item
						label="Логін"
						name="login"
						rules={[
							{
								required: true,
								message: "Будь-ласка, введіть логін!",
							},
						]}
					>
						<Input />
					</Form.Item>
					<Form.Item
						label="Ім'я"
						name="firstName"
						rules={[
							{
								required: true,
								message: "Будь-ласка, введіть ім'я!",
							},
						]}
					>
						<Input />
					</Form.Item>
					<Form.Item
						label="Прізвище"
						name="secondName"
						rules={[
							{
								required: true,
								message: "Будь-ласка, введіть прізвище!",
							},
						]}
					>
						<Input />
					</Form.Item>

					<Form.Item label="Пароль" name="password">
						<Input.Password />
					</Form.Item>
					<Form.Item
						label="Тип користувача"
						name="role"
						rules={[
							{
								required: true,
								message: "Будь-ласка, оберіть тип користувача!",
							},
						]}
					>
						<Radio.Group
							buttonStyle="solid"
							style={{
								display: "flex",
								flexDirection: "row",
								justifyContent: "flex-start",
								width: "auto",
							}}
						>
							<Radio.Button value={UserType.TEACHER}>Викладач</Radio.Button>
							<Radio.Button value={UserType.VIEWER}>Перевіряючий</Radio.Button>
							<Radio.Button value={UserType.ADMIN}>Адміністратор</Radio.Button>
						</Radio.Group>
					</Form.Item>

					<Form.Item
						label="Підрозділ"
						name="subdivision"
						rules={[
							{ required: true, message: "Будь-ласка, оберіть підрозділ!" },
						]}
						hidden={form.getFieldValue("role") !== UserType.TEACHER}
					>
						<Select>
							{subdivisions.map((sub) => (
								<Select.Option value={sub.id}>{sub.title}</Select.Option>
							))}
						</Select>
					</Form.Item>

					<Form.Item
						label="Посада"
						name="position"
						rules={[{ required: true, message: "Будь-ласка, оберіть посаду!" }]}
						hidden={form.getFieldValue("role") !== UserType.TEACHER}
					>
						<Select>
							{positions
								.filter((p) => p.type !== PositionType.CUSTOM)
								.map((pos) => (
									<Select.Option value={pos.id}>{pos.title}</Select.Option>
								))}
						</Select>
					</Form.Item>

					<Form.Item
						label="Посада"
						name="position"
						rules={[{ required: true, message: "Будь-ласка, введіть посаду!" }]}
						hidden={form.getFieldValue("role") !== UserType.VIEWER}
					>
						<Input></Input>
					</Form.Item>

					<Form.Item
						label="Звання"
						name="rank"
						rules={[{ required: true, message: "Будь-ласка, оберіть звання!" }]}
						hidden={form.getFieldValue("role") !== UserType.TEACHER}
					>
						<Select>
							{ranks
								.filter((rank) => rank.type !== RankType.CUSTOM)
								.map((sub) => (
									<Select.Option value={sub.id}>{sub.title}</Select.Option>
								))}
						</Select>
					</Form.Item>

					<Form.Item
						label="Звання"
						name="rank"
						rules={[{ required: true, message: "Будь-ласка, введіть звання!" }]}
						hidden={form.getFieldValue("role") !== UserType.VIEWER}
					>
						<Input></Input>
					</Form.Item>

					<Form.Item
						style={{
							display: "flex",
							flexDirection: "column",
							justifyContent: "center",
							alignItems: "center",
							width: "auto",
						}}
					>
						<Button
							type="primary"
							htmlType="submit"
							style={{
								display: "flex",
								flexDirection: "column",
								justifyContent: "center",
								alignItems: "center",
								width: "auto",
							}}
						>
							ОНОВИТИ
						</Button>
					</Form.Item>
				</Form>
			</ConfigProvider>
			{/* </CSSTransition>
			</SwitchTransition> */}
		</div>
	);
};
