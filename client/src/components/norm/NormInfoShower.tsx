import {
	Descriptions,
	Row,
	Tag,
	Spin,
	Switch,
	message,
	Button,
	Modal,
} from "antd";
import React, { useEffect, useState } from "react";

import { Norm } from "../../types/norm";
import { Subject } from "../../types/subject";
import { RequestMessage, RequestCode, RequestType } from "../../types/requests";
import { ConnectionManager } from "../../managers/connetion/connectionManager";
import { User, UserType } from "../../types/user";
import { EditOutlined, AlertOutlined } from "@ant-design/icons";
import { ObjectStatus } from "../../types/constants";
import { NormEditor } from "./NormEditor";

export interface NormInfoShowerProps {
	norm: Norm;
	onEdited?: (edited: Norm) => void;
	allowEdit?: boolean;
}

export const NormInfoShower: React.FC<NormInfoShowerProps> = (
	props: NormInfoShowerProps
) => {
	const [subject, setSubject] = useState<Subject | undefined>(undefined);
	const me = JSON.parse(localStorage.getItem("user")) as User;
	const [norm, setNorm] = useState<Norm>(props.norm);

	useEffect(() => {
		setNorm(props.norm);
		ConnectionManager.getInstance().registerResponseOnceHandler(
			RequestType.GET_SUBJECT_BY_ID,
			(data) => {
				const dataMessage = data as RequestMessage<Subject[]>;
				if (
					dataMessage.requestCode === RequestCode.RES_CODE_INTERNAL_ERROR &&
					dataMessage.data.length < 1
				) {
					console.log(`Error: ${dataMessage.requestCode}`);
					return;
				}
				setSubject(dataMessage.data[0]);
			}
		);
		ConnectionManager.getInstance().emit(RequestType.GET_SUBJECT_BY_ID, [
			props.norm.subjectId,
		]);
	}, [props.norm]);

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

	const updateNorm = (norm: Norm) => {
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

				props?.onEdited(dataMessage.data[0]);
			}
		);
		ConnectionManager.getInstance().emit(RequestType.UPDATE_NORMS, [norm]);
	};

	const onEditNorm = () => {
		const alert = Modal.confirm({
			title: "Увага!",
			content:
				"Якщо ви змінюєте цей норматив, то зміни не торкнуться попередньо створених оцінок за цей норматив! Якщо ви дійсно хочете змінити, то натисніть кнопку 'ОК'",
			icon: <AlertOutlined />,
			zIndex: 1100,
			closable: true,
			cancelText: "Відмінити",
			onOk: () => {
				const modal = Modal.confirm({
					title: "Інформація про програму підготовки",
					width: window.screen.width * 0.3,

					zIndex: 1100,
					icon: <EditOutlined />,
					closable: true,
					okButtonProps: {
						style: {
							visibility: "hidden",
						},
					},
					cancelButtonProps: {
						style: {
							visibility: "hidden",
						},
					},
				});

				modal.update({
					content: (
						<div style={{ marginTop: "1%" }}>
							<NormEditor
								norm={norm}
								onEdit={(_norm) => {
									updateNorm({ ...norm, status: ObjectStatus.ARCHIVE });
									updateNorm({ ..._norm, id: 0 });

									modal.destroy();
								}}
							></NormEditor>
						</div>
					),
				});
			},
		});
	};

	return (
		<div>
			<Descriptions bordered style={{ width: "100%" }}>
				<Descriptions.Item
					label="Номер"
					span={3}
					labelStyle={descriptionItemLabelStyle}
					contentStyle={descriptionItemContentStyle}
				>
					{norm.number}
				</Descriptions.Item>
				<Descriptions.Item
					label="Зміст"
					span={3}
					labelStyle={descriptionItemLabelStyle}
					contentStyle={descriptionItemContentStyle}
				>
					{norm.content}
				</Descriptions.Item>
				<Descriptions.Item
					label="Предмет"
					span={3}
					labelStyle={descriptionItemLabelStyle}
					contentStyle={descriptionItemContentStyle}
				>
					{subject === undefined ? <Spin></Spin> : subject.fullTitle}
				</Descriptions.Item>
				<Descriptions.Item
					label="Часові показники"
					span={3}
					labelStyle={descriptionItemLabelStyle}
					contentStyle={descriptionItemContentStyle}
				>
					<Row>
						<Tag color="green" style={{ width: "20%" }}>
							Відмінно
						</Tag>{" "}
						{norm.excellent}
					</Row>
					<Row>
						<Tag color="blue" style={{ width: "20%" }}>
							Добре
						</Tag>
						{norm.good}
					</Row>
					<Row>
						<Tag color="orange" style={{ width: "20%" }}>
							Задовільно
						</Tag>
						{norm.satisfactory}
					</Row>
				</Descriptions.Item>
			</Descriptions>
			{props.allowEdit && (
				<Row justify="end">
					<Button
						type="link"
						size="large"
						icon={<EditOutlined></EditOutlined>}
						onClick={onEditNorm}
					>
						Змінити
					</Button>
				</Row>
			)}
		</div>
	);
};
