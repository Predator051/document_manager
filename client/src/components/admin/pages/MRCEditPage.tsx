import React, { useEffect, useState } from "react";
import { ConnectionManager } from "../../../managers/connetion/connectionManager";
import {
	RequestType,
	RequestMessage,
	RequestCode,
} from "../../../types/requests";
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
	Menu,
	Form,
	Card,
} from "antd";
import Avatar from "antd/lib/avatar/avatar";
import { message } from "antd";
import { PlusOutlined, MinusOutlined } from "@ant-design/icons";
import { MRS } from "../../../types/mrs";
import { useForm } from "antd/es/form/Form";

export interface MRSEditPageProps {}

export const MRSEditPage: React.FC<MRSEditPageProps> = (
	props: MRSEditPageProps
) => {
	const [mrss, setMRSs] = useState<MRS[]>([]);
	const [selectedMRS, setSelectedMRS] = useState<MRS | undefined>(undefined);
	const [form] = useForm();

	const loadAllMRSs = () => {
		ConnectionManager.getInstance().registerResponseOnceHandler(
			RequestType.GET_ALL_MRS,
			(data) => {
				const dataMessage = data as RequestMessage<MRS[]>;
				if (dataMessage.requestCode === RequestCode.RES_CODE_INTERNAL_ERROR) {
					console.log(`Error: ${dataMessage.requestCode}`);
					return;
				}

				setMRSs(dataMessage.data);
			}
		);
		ConnectionManager.getInstance().emit(RequestType.GET_ALL_MRS, {});
	};

	useEffect(() => {
		loadAllMRSs();
	}, []);

	// const editTitleMRSChange: (
	// 	event: React.ChangeEvent<HTMLInputElement>
	// ) => void = ({ target: { value } }) => {
	// 	setSelectedMRS({ ...selectedMRS, title: value });
	// };

	const updateMRS = (mrs: MRS) => {
		ConnectionManager.getInstance().registerResponseOnceHandler(
			RequestType.UPDATE_MRS,
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
				loadAllMRSs();
			}
		);
		ConnectionManager.getInstance().emit(RequestType.UPDATE_MRS, [mrs]);
	};

	const onUpdateTitleClick = (values: MRS) => {
		updateMRS({
			...selectedMRS,
			name: values.name,
			number: values.number,
		});
	};

	const onCreateMRSClick = () => {
		var number = "";
		var name = "";
		const onChangeNumber: (
			event: React.ChangeEvent<HTMLInputElement>
		) => void = ({ target: { value } }) => {
			number = value;
		};
		const onChangeName: (
			event: React.ChangeEvent<HTMLInputElement>
		) => void = ({ target: { value } }) => {
			name = value;
		};
		const onSubjectCreate = () => {
			updateMRS({ id: 0, name: name, number: number, isCanChange: true });
		};
		const modal = Modal.info({
			title: "Додавання ВОС",
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
						placeholder="Введіть номер"
						onChange={onChangeNumber}
					></Input>
					<Input
						style={{ width: "100%" }}
						placeholder="Введіть назву"
						onChange={onChangeName}
					></Input>
				</div>
			),
		});
	};

	// if (users.length < 1) {
	// 	return <Spin size="large"></Spin>;
	// }

	return (
		<div style={{ margin: "1%" }}>
			<Row justify={"center"}>
				<Col flex="10%">
					<Menu>
						{mrss.map((mrs) => (
							<Menu.Item
								key={mrs.id}
								icon={<MinusOutlined></MinusOutlined>}
								onClick={() => {
									const found = mrss.find((m) => m.id === mrs.id);
									if (found.isCanChange) {
										setSelectedMRS(found);
										form.setFieldsValue({
											...found,
										});
									}
								}}
							>
								{mrs.number}
							</Menu.Item>
						))}
						<Menu.Item key={"add"}>
							<Button
								type="dashed"
								icon={<PlusOutlined></PlusOutlined>}
								style={{ width: "100%" }}
								onClick={onCreateMRSClick}
							>
								Додати
							</Button>
						</Menu.Item>
					</Menu>
				</Col>
				<Col flex="auto">
					{selectedMRS && (
						<div className="fade-in-left">
							<Row justify="center" style={{ width: "100%" }}>
								<Card
									title="Обраний ВОС"
									style={{ maxWidth: "500px", width: "500px" }}
								>
									<Form form={form} onFinish={onUpdateTitleClick}>
										<Form.Item
											name="number"
											label="Номер"
											rules={[{ required: true }]}
										>
											<Input></Input>
										</Form.Item>
										<Form.Item
											name="name"
											label="Назва"
											rules={[{ required: true }]}
										>
											<Input></Input>
										</Form.Item>
										<Form.Item>
											<Button type="primary" htmlType="submit">
												Оновити
											</Button>
										</Form.Item>
									</Form>
								</Card>
							</Row>
						</div>
					)}
				</Col>
			</Row>
		</div>
	);
};
