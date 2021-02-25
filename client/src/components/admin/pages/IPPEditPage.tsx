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
import { IPP } from "../../../types/ipp";
import { useForm } from "antd/es/form/Form";

export interface IPPEditPageProps {}

export const IPPEditPage: React.FC<IPPEditPageProps> = (
	props: IPPEditPageProps
) => {
	const [IPPs, setIPPs] = useState<IPP[]>([]);
	const [selectedIPP, setSelectedIPP] = useState<IPP | undefined>(undefined);
	const [form] = useForm();

	const loadAllIPPs = () => {
		ConnectionManager.getInstance().registerResponseOnceHandler(
			RequestType.GET_ALL_IPP,
			(data) => {
				const dataMessage = data as RequestMessage<IPP[]>;
				if (dataMessage.requestCode === RequestCode.RES_CODE_INTERNAL_ERROR) {
					console.log(`Error: ${dataMessage.requestCode}`);
					return;
				}

				setIPPs(dataMessage.data);
			}
		);
		ConnectionManager.getInstance().emit(RequestType.GET_ALL_IPP, {});
	};

	useEffect(() => {
		loadAllIPPs();
	}, []);

	const updateIPP = (ipp: IPP) => {
		ConnectionManager.getInstance().registerResponseOnceHandler(
			RequestType.UPDATE_IPP,
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
				loadAllIPPs();
			}
		);
		ConnectionManager.getInstance().emit(RequestType.UPDATE_IPP, [ipp]);
	};

	const onUpdateTitleClick = (values: IPP) => {
		updateIPP({
			...selectedIPP,
			name: values.name,
		});
	};

	const onCreateIPPClick = () => {
		var name = "";
		const onChangeName: (
			event: React.ChangeEvent<HTMLInputElement>
		) => void = ({ target: { value } }) => {
			name = value;
		};
		const onSubjectCreate = () => {
			updateIPP({ id: 0, name: name });
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
						placeholder="Введіть назву"
						onChange={onChangeName}
					></Input>
				</div>
			),
		});
	};

	return (
		<div style={{ margin: "1%" }}>
			<Row justify={"center"}>
				<Col flex="10%">
					<Menu>
						{IPPs.map((IPP) => (
							<Menu.Item
								key={IPP.id}
								icon={<MinusOutlined></MinusOutlined>}
								onClick={() => {
									const found = IPPs.find((m) => m.id === IPP.id);

									setSelectedIPP(found);
									form.setFieldsValue({
										...found,
									});
								}}
							>
								{IPP.name}
							</Menu.Item>
						))}
						<Menu.Item key={"add"}>
							<Button
								type="dashed"
								icon={<PlusOutlined></PlusOutlined>}
								style={{ width: "100%" }}
								onClick={onCreateIPPClick}
							>
								Додати
							</Button>
						</Menu.Item>
					</Menu>
				</Col>
				<Col flex="auto">
					{selectedIPP && (
						<div className="fade-in-left">
							<Row justify="center" style={{ width: "100%" }}>
								<Card
									title="Обраний ВОС"
									style={{ maxWidth: "500px", width: "500px" }}
								>
									<Form form={form} onFinish={onUpdateTitleClick}>
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
