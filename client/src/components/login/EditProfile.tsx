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
	Spin,
	Typography,
} from "antd";
import { Store } from "antd/lib/form/interface";
import FormLocale from "antd/es/locale/uk_UA";
import * as moment from "moment";
import "moment/locale/uk";
import { useSelector } from "react-redux";
import { selectAccount } from "../../redux/slicers/accountSlice";
import { User, UserType } from "../../types/user";
import { ConnectionManager } from "../../managers/connetion/connectionManager";
import { RequestType, RequestMessage, RequestCode } from "../../types/requests";
import { useForm } from "antd/es/form/Form";
import { PlusOutlined } from "@ant-design/icons";
import { Subdivision } from "../../types/subdivision";
import { Position, PositionType } from "../../types/position";
import { Rank, RankType } from "../../types/rank";

moment.locale("uk");

interface ModalProps {
	visible: boolean;
	title: string;
	content: string;
}

interface Props {}
export const ProfileEditPage: React.FC<Props> = () => {
	const me = JSON.parse(localStorage.getItem("user")) as User;
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

	useEffect(() => {
		loadAllPositions();
		loadAllSubdivisions();
		loadAllRanks();

		ConnectionManager.getInstance().registerResponseOnceHandler(
			RequestType.GET_USER_INFO,
			(data) => {
				const dataMessage = data as RequestMessage<User>;
				if (dataMessage.requestCode === RequestCode.RES_CODE_INTERNAL_ERROR) {
					console.log(`Error: ${dataMessage.requestCode}`);
					return;
				}
				setCurrentUser(dataMessage.data);

				setCurrentUserType(dataMessage.data.userType);
				setCurrentPosition(dataMessage.data.position);
				setCurrentRank(dataMessage.data.rank);

				const store: Store = {
					login: dataMessage.data.login,
					firstName: dataMessage.data.firstName,
					secondName: dataMessage.data.secondName,
					role: dataMessage.data.userType,
					position:
						dataMessage.data.userType === UserType.VIEWER
							? dataMessage.data.position.title
							: dataMessage.data.position.id,
					subdivision: dataMessage.data.cycle.id,
					// password: currentUser.password,
					rank:
						dataMessage.data.userType === UserType.VIEWER
							? dataMessage.data.rank.title
							: dataMessage.data.rank.id,
				};
				form.setFieldsValue(store);
				console.log("user profile", dataMessage.data);
			}
		);
		ConnectionManager.getInstance().emit(RequestType.GET_USER_INFO, me.id);
	}, []);

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

	if (currentUser === undefined) {
		return <Spin size="large"></Spin>;
	}

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
			className="swing-in-top-fwd"
		>
			<Typography.Title level={3}>Мої налаштування</Typography.Title>
			<Divider style={{ borderColor: "#8c8c8c", width: "80%" }}></Divider>
			<ConfigProvider locale={FormLocale}>
				<Form
					{...layout}
					form={form}
					labelCol={{ span: 4 }}
					wrapperCol={{ span: 14 }}
					layout="horizontal"
					initialValues={{ size: "small" }}
					onFinish={onFinish}
					// style={{ visibility: currentUser ? "visible" : "hidden" }}
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
						label="Звання"
						name="rank"
						rules={[{ required: true, message: "Будь-ласка, оберіть звання!" }]}
						hidden={currentUser.userType !== UserType.TEACHER}
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
						hidden={
							currentUser.userType !== UserType.VIEWER ||
							currentUser.rank.type === RankType.STANDART
						}
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
		</div>
	);
};
