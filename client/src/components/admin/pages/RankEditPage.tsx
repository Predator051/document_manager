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
import { Rank, RankType } from "../../../types/rank";
import { useForm } from "antd/es/form/Form";

export interface MRSEditPageProps {}

export const RankEditPage: React.FC<MRSEditPageProps> = (
	props: MRSEditPageProps
) => {
	const [ranks, setRanks] = useState<Rank[]>([]);
	const [selectedRank, setSelectedRank] = useState<Rank | undefined>(undefined);
	const [form] = useForm();

	const loadAllRanks = () => {
		ConnectionManager.getInstance().registerResponseOnceHandler(
			RequestType.GET_ALL_RANKS,
			(data) => {
				const dataMessage = data as RequestMessage<Rank[]>;
				if (dataMessage.requestCode === RequestCode.RES_CODE_INTERNAL_ERROR) {
					console.log(`Error: ${dataMessage.requestCode}`);
					return;
				}

				setRanks(dataMessage.data.filter((r) => r.type !== RankType.CUSTOM));
			}
		);
		ConnectionManager.getInstance().emit(RequestType.GET_ALL_RANKS, {});
	};

	useEffect(() => {
		loadAllRanks();
	}, []);

	// const editTitleMRSChange: (
	// 	event: React.ChangeEvent<HTMLInputElement>
	// ) => void = ({ target: { value } }) => {
	// 	setSelectedMRS({ ...selectedMRS, title: value });
	// };

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

	const onUpdateTitleClick = (values: Rank) => {
		updateRank({
			...selectedRank,
			title: values.title,
			type: RankType.STANDART,
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
						placeholder="Введіть звання"
						onChange={onChangeTitle}
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
						{ranks.map((mrs) => (
							<Menu.Item
								key={mrs.id}
								icon={<MinusOutlined></MinusOutlined>}
								onClick={() => {
									const found = ranks.find((m) => m.id === mrs.id);
									setSelectedRank(found);
									form.setFieldsValue({
										...found,
									});
								}}
							>
								{mrs.title}
							</Menu.Item>
						))}
						<Menu.Item key={"add"}>
							<Button
								type="dashed"
								icon={<PlusOutlined></PlusOutlined>}
								style={{ width: "100%" }}
								onClick={onCreateRankClick}
							>
								Додати
							</Button>
						</Menu.Item>
					</Menu>
				</Col>
				<Col flex="auto">
					{selectedRank && (
						<div className="fade-in-left">
							<Row justify="center" style={{ width: "100%" }}>
								<Card
									title="Обране звання"
									style={{ maxWidth: "500px", width: "500px" }}
								>
									<Form form={form} onFinish={onUpdateTitleClick}>
										<Form.Item
											name="title"
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
