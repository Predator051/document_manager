import { Descriptions, Row, Tag, Spin } from "antd";
import React, { useEffect, useState } from "react";

import { Norm } from "../../types/norm";
import { Subject } from "../../types/subject";
import { RequestMessage, RequestCode, RequestType } from "../../types/requests";
import { ConnectionManager } from "../../managers/connetion/connectionManager";

export interface NormInfoShowerProps {
	norm: Norm;
}

export const NormInfoShower: React.FC<NormInfoShowerProps> = (
	props: NormInfoShowerProps
) => {
	const [subject, setSubject] = useState<Subject | undefined>(undefined);

	useEffect(() => {
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

	return (
		<div>
			<Descriptions bordered style={{ width: "100%" }}>
				<Descriptions.Item
					label="Номер"
					span={3}
					labelStyle={descriptionItemLabelStyle}
					contentStyle={descriptionItemContentStyle}
				>
					{props.norm.number}
				</Descriptions.Item>
				<Descriptions.Item
					label="Зміст"
					span={3}
					labelStyle={descriptionItemLabelStyle}
					contentStyle={descriptionItemContentStyle}
				>
					{props.norm.content}
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
						{props.norm.excellent}
					</Row>
					<Row>
						<Tag color="blue" style={{ width: "20%" }}>
							Добре
						</Tag>
						{props.norm.good}
					</Row>
					<Row>
						<Tag color="orange" style={{ width: "20%" }}>
							Задовільно
						</Tag>
						{props.norm.satisfactory}
					</Row>
				</Descriptions.Item>
			</Descriptions>
		</div>
	);
};
