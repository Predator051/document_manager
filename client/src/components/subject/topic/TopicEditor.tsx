import { Button, Descriptions, Input, InputNumber, Row } from "antd";
import DescriptionsItem from "antd/lib/descriptions/Item";
import React, { useContext, useEffect, useState } from "react";

import { SubjectTopic } from "../../../types/subjectTopic";

export const TopicEditor: React.FC<{
	topic: SubjectTopic;
	onOk: (topic: SubjectTopic) => void;
}> = (props: { topic: SubjectTopic; onOk: (topic: SubjectTopic) => void }) => {
	const [topic, setTopic] = useState<SubjectTopic>({ ...props.topic });
	const onTextChange: (event: React.ChangeEvent<HTMLInputElement>) => void = ({
		target: { value },
	}) => {
		setTopic({ ...topic, title: value });
	};

	const onNumberChange = (value: number | string) => {
		let enteredNumber = parseInt(value.toString());
		setTopic({ ...topic, number: enteredNumber });
	};
	return (
		<div>
			<Descriptions bordered>
				<DescriptionsItem label="Введіть нову назву" span={3}>
					<InputNumber
						onChange={onNumberChange}
						placeholder="Введіть номер теми"
						min={1}
						max={20}
						style={{ width: "100%" }}
						value={topic.number}
					></InputNumber>
				</DescriptionsItem>
				<DescriptionsItem label="Введіть нову назву" span={3}>
					<Input
						onChange={onTextChange}
						placeholder="Введіть нову назву"
						value={topic.title}
						style={{ marginTop: "1%" }}
					></Input>
				</DescriptionsItem>
			</Descriptions>

			<Row justify="end">
				<Button
					type={"primary"}
					style={{ marginTop: "1%" }}
					onClick={() => {
						props.onOk(topic);
					}}
					disabled={topic.number === 0 || topic.title === ""}
				>
					Оновити
				</Button>
			</Row>
		</div>
	);
};
