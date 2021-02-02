import { Button, Descriptions, Input, InputNumber, Row } from "antd";
import DescriptionsItem from "antd/lib/descriptions/Item";
import React, { useContext, useEffect, useState } from "react";

import { SubjectTopicOccupation } from "../../../types/subjectTopicOccupation";

export const OccupationEditor: React.FC<{
	topic: SubjectTopicOccupation;
	onOk: (topic: SubjectTopicOccupation) => void;
}> = (props: {
	topic: SubjectTopicOccupation;
	onOk: (topic: SubjectTopicOccupation) => void;
}) => {
	const [occupation, setOccupation] = useState<SubjectTopicOccupation>({
		...props.topic,
	});
	const onTextChange: (event: React.ChangeEvent<HTMLInputElement>) => void = ({
		target: { value },
	}) => {
		setOccupation({ ...occupation, title: value });
	};

	const onNumberChange = (value: number | string) => {
		let enteredNumber = parseInt(value.toString());
		setOccupation({ ...occupation, number: enteredNumber });
	};
	return (
		<div>
			<Descriptions bordered>
				<DescriptionsItem label="Введіть новий номер" span={3}>
					<InputNumber
						onChange={onNumberChange}
						placeholder="Введіть номер заняття"
						min={1}
						max={20}
						style={{ width: "100%" }}
						value={occupation.number}
					></InputNumber>
				</DescriptionsItem>
				<DescriptionsItem label="Введіть нову назву" span={3}>
					<Input
						onChange={onTextChange}
						placeholder="Введіть назву"
						value={occupation.title}
						style={{ marginTop: "1%" }}
					></Input>
				</DescriptionsItem>
			</Descriptions>

			<Row justify="end">
				<Button
					type={"primary"}
					style={{ marginTop: "1%" }}
					onClick={() => {
						props.onOk(occupation);
					}}
					disabled={occupation.number === 0 || occupation.title === ""}
				>
					Оновити
				</Button>
			</Row>
		</div>
	);
};
