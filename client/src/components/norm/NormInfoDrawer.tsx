import { PlusOutlined } from "@ant-design/icons";
import {
	Button,
	Descriptions,
	Divider,
	Drawer,
	message,
	Modal,
	Select,
} from "antd";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";

import { ConnectionManager } from "../../managers/connetion/connectionManager";
import { Norm } from "../../types/norm";
import { RequestCode, RequestMessage, RequestType } from "../../types/requests";
import { NormCreator } from "./NormCreator";
import { NormInfoShower } from "./NormInfoShower";
import { User } from "../../types/user";

export interface NormInfoDrawerProps {
	visible: boolean;
	onClose: () => void;
	editable: boolean;
	userId?: number;
}

export const NormInfoDrawer: React.FC<NormInfoDrawerProps> = (
	props: NormInfoDrawerProps
) => {
	const history = useHistory();
	const [norms, setNorms] = useState<Norm[]>([]);
	const [currentNorm, setCurrentNorm] = useState<Norm | undefined>(undefined);
	const me = JSON.parse(localStorage.getItem("user")) as User;

	const loadAllNorms = () => {
		ConnectionManager.getInstance().registerResponseOnceHandler(
			RequestType.GET_NORMS_BY_USER_CYCLE,
			(data) => {
				const dataMessage = data as RequestMessage<Norm[]>;
				if (dataMessage.requestCode === RequestCode.RES_CODE_INTERNAL_ERROR) {
					console.log(`Error: ${dataMessage.requestCode}`);
					return;
				}

				setNorms(dataMessage.data);
			}
		);
		ConnectionManager.getInstance().emit(
			RequestType.GET_NORMS_BY_USER_CYCLE,
			props.userId ? props.userId : me.id
		);
	};

	useEffect(() => {
		loadAllNorms();
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

	const onChangeSelectNorm = (value: number) => {
		setCurrentNorm(norms.find((n) => n.id === value));
	};

	const onCreateNormClick = () => {
		const modal = Modal.info({
			title: "Додавання нормативу",
			width: window.screen.width * 0.6,
			style: { top: 20 },
			closable: true,
			okButtonProps: {
				style: { visibility: "hidden" },
			},
			zIndex: 1050,
		});
		const onNormCreate = (norm: Norm) => {
			///TODO
			ConnectionManager.getInstance().registerResponseOnceHandler(
				RequestType.UPDATE_NORMS,
				(data) => {
					const dataMessage = data as RequestMessage<Norm[]>;
					if (dataMessage.requestCode === RequestCode.RES_CODE_INTERNAL_ERROR) {
						console.log(`Error: ${dataMessage.requestCode}`);
						message.error(
							"Сталася помилка! Перезавантажте сторінку чи зверніться до адміністратору"
						);
						return;
					}
					message.success("Успішно");
					loadAllNorms();
				}
			);
			ConnectionManager.getInstance().emit(RequestType.UPDATE_NORMS, [norm]);

			modal.destroy();
		};
		modal.update({
			content: (
				<div
					style={{
						height: "auto",
						// minHeight: "500px",
					}}
				>
					<NormCreator onCreate={onNormCreate}></NormCreator>
				</div>
			),
		});
	};

	return (
		<div>
			<Drawer visible={props.visible} onClose={props.onClose} width="50%">
				<Descriptions bordered style={{ width: "100%", marginTop: "2%" }}>
					<Descriptions.Item
						label="Оберіть норматив"
						span={3}
						labelStyle={descriptionItemLabelStyle}
						contentStyle={descriptionItemContentStyle}
					>
						<Select
							style={{ width: "100%" }}
							onChange={onChangeSelectNorm}
							dropdownRender={(menu) => (
								<div style={{ zIndex: 1000 }}>
									{menu}
									{props.editable && (
											<Divider style={{ margin: "4px 0" }}></Divider>
										) && (
											<div
												style={{
													display: "flex",
													flexWrap: "nowrap",
													padding: 8,
												}}
											>
												<Button
													type="link"
													onClick={onCreateNormClick}
													icon={<PlusOutlined></PlusOutlined>}
												>
													Додати норматив
												</Button>
											</div>
										)}
								</div>
							)}
						>
							{norms.map((norm) => (
								<Select.Option value={norm.id}>{norm.number}</Select.Option>
							))}
						</Select>
					</Descriptions.Item>
				</Descriptions>
				{currentNorm && <NormInfoShower norm={currentNorm}></NormInfoShower>}
			</Drawer>
		</div>
	);
};
