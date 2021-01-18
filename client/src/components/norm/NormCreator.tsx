import {
	Button,
	Descriptions,
	Input,
	InputNumber,
	Row,
	Select,
	Tag,
} from "antd";
import React, { useEffect, useState } from "react";

import { ConnectionManager } from "../../managers/connetion/connectionManager";
import { Norm } from "../../types/norm";
import { RequestCode, RequestMessage, RequestType } from "../../types/requests";
import { Subject } from "../../types/subject";

export interface NormCreatorProps {
	onCreate: (norm: Norm) => void;
}

export const NormCreator: React.FC<NormCreatorProps> = (
	props: NormCreatorProps
) => {
	const [norm, setNorm] = useState<Norm>({
		content: "",
		excellent: "",
		good: "",
		id: 0,
		number: 0,
		satisfactory: "",
		subjectId: 0,
	});
	const [subjects, setSubjects] = useState<Subject[]>([]);

	const loadAllSubjects = () => {
		ConnectionManager.getInstance().registerResponseOnceHandler(
			RequestType.GET_ALL_SUBJECTS,
			(data) => {
				const dataMessage = data as RequestMessage<Subject[]>;
				if (dataMessage.requestCode === RequestCode.RES_CODE_INTERNAL_ERROR) {
					console.log(`Error: ${dataMessage.requestCode}`);
					return;
				}

				setSubjects(dataMessage.data);
			}
		);
		ConnectionManager.getInstance().emit(RequestType.GET_ALL_SUBJECTS, {});
	};

	useEffect(() => {
		loadAllSubjects();
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

	const numberChange = (value: React.Key) => {
		setNorm({ ...norm, number: parseInt(value.toString()) });
	};
	const contentChange: (
		event: React.ChangeEvent<HTMLTextAreaElement>
	) => void = ({ target: { value } }) => {
		setNorm({ ...norm, content: value });
	};

	const excellentChange: (
		event: React.ChangeEvent<HTMLInputElement>
	) => void = ({ target: { value } }) => {
		setNorm({ ...norm, excellent: value });
	};

	const goodChange: (event: React.ChangeEvent<HTMLInputElement>) => void = ({
		target: { value },
	}) => {
		setNorm({ ...norm, good: value });
	};

	const satisfactoryChange: (
		event: React.ChangeEvent<HTMLInputElement>
	) => void = ({ target: { value } }) => {
		setNorm({ ...norm, satisfactory: value });
	};

	const subjectSelectChange = (subjectId: number) => {
		norm.subjectId = subjectId;
	};

	return (
		<div>
			<Descriptions bordered style={{ width: "100%" }}>
				<Descriptions.Item
					label="Оберіть предмет"
					span={3}
					labelStyle={descriptionItemLabelStyle}
					contentStyle={descriptionItemContentStyle}
				>
					<Select style={{ width: "100%" }} onChange={subjectSelectChange}>
						{subjects.map((subject) => (
							<Select.Option value={subject.id}>
								{subject.shortTitle}
							</Select.Option>
						))}
					</Select>
				</Descriptions.Item>
				<Descriptions.Item
					label="Номер"
					span={3}
					labelStyle={descriptionItemLabelStyle}
					contentStyle={descriptionItemContentStyle}
				>
					<InputNumber onChange={numberChange}></InputNumber>
				</Descriptions.Item>
				<Descriptions.Item
					label="Зміст"
					span={3}
					labelStyle={descriptionItemLabelStyle}
					contentStyle={descriptionItemContentStyle}
				>
					<Input.TextArea onChange={contentChange}></Input.TextArea>
				</Descriptions.Item>
				<Descriptions.Item
					label="Часові показники"
					span={3}
					labelStyle={descriptionItemLabelStyle}
					contentStyle={descriptionItemContentStyle}
				>
					<Tag color="green">Відмінно</Tag>{" "}
					<Input onChange={excellentChange}></Input>
					<Tag color="blue">Добре</Tag>
					<Input onChange={goodChange}></Input>
					<Tag color="orange">Задовільно</Tag>
					<Input onChange={satisfactoryChange}></Input>
				</Descriptions.Item>
			</Descriptions>
			<Row justify="end" style={{ marginTop: "1%" }}>
				<Button
					type="primary"
					onClick={() => {
						props.onCreate(norm);
					}}
					disabled={
						norm.content === "" ||
						norm.excellent === "" ||
						norm.good === "" ||
						norm.number === 0 ||
						norm.satisfactory === "" ||
						norm.subjectId === 0
					}
				>
					Додати
				</Button>
			</Row>
		</div>
	);
};
