import { Descriptions, Row, Tag } from "antd";
import React from "react";

import { Norm } from "../../types/norm";

export interface NormInfoShowerProps {
	norm: Norm;
}

export const NormInfoShower: React.FC<NormInfoShowerProps> = (
	props: NormInfoShowerProps
) => {
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
