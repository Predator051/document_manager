import React, { useState, useEffect } from "react";
import {
	Select,
	Row,
	Descriptions,
	Input,
	Col,
	Divider,
	Button,
	Modal,
	InputNumber,
} from "antd";
import { ConnectionManager } from "../../../managers/connetion/connectionManager";
import {
	RequestMessage,
	RequestCode,
	RequestType,
} from "../../../types/requests";
import * as moment from "moment";
import "moment/locale/uk";
import { Subject } from "../../../types/subject";
import DescriptionsItem from "antd/lib/descriptions/Item";
import { SubjectEditableTable } from "./SubjectEditableTable";
import { PlusOutlined, EditOutlined, CheckOutlined } from "@ant-design/icons";
import { SubjectSelectPath } from "../../../types/subjectSelectPath";
import { useHistory } from "react-router-dom";

moment.locale("uk");

const { Option } = Select;

export interface SubjectCreatorProps {
	onClose: () => void;
	onSelect: (group: Subject, path: SubjectSelectPath) => void;
}

export const SubjectSelector: React.FC<SubjectCreatorProps> = (
	props: SubjectCreatorProps
) => {
	const [subjects, setSubjects] = useState<Subject[]>([]);
	const [currentSubject, setCurrentSubject] = useState<number>(0);
	const [currentProgramTraining, setCurrentProgramTraining] = useState<number>(
		0
	);
	const [currentTopic, setCurrentTopic] = useState<number>(0);
	const [currentOccupation, setCurrentOccupation] = useState<number>(0);

	const getCurrentSubject = () => {
		return subjects.find((stp) => stp.id === currentSubject);
	};

	const getCurrentTrainingProgram = () => {
		return getCurrentSubject().programTrainings.find(
			(stp) => stp.id === currentProgramTraining
		);
	};

	const getCurrentTopic = () => {
		return getCurrentTrainingProgram().topics.find(
			(topic) => topic.id === currentTopic
		);
	};

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

	const updateSubjects = (us: Subject[]) => {
		ConnectionManager.getInstance().registerResponseOnceHandler(
			RequestType.UPDATE_SUBJECTS,
			(data) => {
				const dataMessage = data as RequestMessage<Subject[]>;
				if (dataMessage.requestCode === RequestCode.RES_CODE_INTERNAL_ERROR) {
					console.log(`Error: ${dataMessage.requestCode}`);
					return;
				}
				console.log("receive data", dataMessage.data);

				setSubjects(dataMessage.data);
			}
		);

		ConnectionManager.getInstance().emit(RequestType.UPDATE_SUBJECTS, us);
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

	const handleSubjectSelectChange = (value: number) => {
		setCurrentSubject(value);
		setCurrentProgramTraining(0);
		setCurrentTopic(0);
		setCurrentOccupation(0);
	};

	const handleProgramSelectChange = (value: number) => {
		setCurrentProgramTraining(value);
		setCurrentTopic(0);
		setCurrentOccupation(0);
	};

	const handleTopicSelectChange = (value: number) => {
		setCurrentTopic(value);
		setCurrentOccupation(0);
	};

	const handleOccupationSelectChange = (value: number) => {
		setCurrentOccupation(value);
	};

	const onCreateSubject = () => {
		let enteredFullTitle = "";
		let enteredShortTitle = "";
		const onTextChange: (
			who: string,
			event: React.ChangeEvent<HTMLInputElement>
		) => void = (who: string, { target: { value } }) => {
			if (who === "full") {
				enteredFullTitle = value;
			} else if (who === "short") {
				enteredShortTitle = value;
			}
		};
		Modal.confirm({
			okText: "Додати",
			title: "Введіть предмет",
			cancelText: "Відмінити",
			content: (
				<div style={{ marginTop: "1%" }}>
					<Input
						onChange={onTextChange.bind(null, "full")}
						placeholder="Введіть повну назву"
					></Input>
					<Input
						onChange={onTextChange.bind(null, "short")}
						placeholder="Введіть коротку назву"
					></Input>
				</div>
			),
			onOk: () => {
				// setSubjects();
				// console.log("after inserted", subjects);

				updateSubjects([
					...subjects,
					{
						id: 0,
						fullTitle: enteredFullTitle,
						programTrainings: [],
						shortTitle: enteredShortTitle,
					},
				]);
			},
			zIndex: 1100,
			icon: <EditOutlined />,
			closable: true,
		});
	};
	const onCreateTrainingType = () => {
		let enteredTitle = "";
		const onTextChange: (
			event: React.ChangeEvent<HTMLInputElement>
		) => void = ({ target: { value } }) => {
			enteredTitle = value;
		};
		Modal.confirm({
			okText: "Додати",
			title: "Введіть програму підготовки",
			cancelText: "Відмінити",
			content: (
				<div style={{ marginTop: "1%" }}>
					<Input
						onChange={onTextChange}
						placeholder="Введіть назву програми підготовки"
					></Input>
				</div>
			),
			onOk: () => {
				const subject = getCurrentSubject();
				subject.programTrainings.push({
					id: 0,
					title: enteredTitle,
					topics: [],
				});
				// setSubjects();
				updateSubjects([
					...subjects.filter((sb) => sb.id !== subject.id),
					subject,
				]);
			},
			zIndex: 1100,
			icon: <EditOutlined />,
			closable: true,
		});
	};

	const onCreateTopic = () => {
		let enteredTitle = "";
		let enteredNumber = 0;
		const onTextChange: (
			event: React.ChangeEvent<HTMLInputElement>
		) => void = ({ target: { value } }) => {
			enteredTitle = value;
		};
		const onNumberChange = (value: number | string) => {
			enteredNumber = parseInt(value.toString());
		};
		Modal.confirm({
			okText: "Додати",
			title: "Введіть тему",
			cancelText: "Відмінити",
			content: (
				<div style={{ marginTop: "1%" }}>
					<InputNumber
						onChange={onNumberChange}
						placeholder="Введіть номер теми"
						min={1}
						max={20}
						style={{ width: "100%" }}
					></InputNumber>
					<Input onChange={onTextChange} placeholder="Введіть тему"></Input>
				</div>
			),
			onOk: () => {
				const trainingProgram = getCurrentTrainingProgram();
				trainingProgram.topics.push({
					id: 0,
					title: enteredTitle,
					number: enteredNumber,
					occupation: [],
				});
				const subject = getCurrentSubject();
				// setSubjects();
				updateSubjects([
					...subjects.filter((sb) => sb.id !== subject.id),
					subject,
				]);
			},
			zIndex: 1100,
			icon: <EditOutlined />,
			closable: true,
		});
	};

	const onCreateOccupation = () => {
		let enteredTitle = "";
		let enteredNumber = 0;
		const onTextChange: (
			event: React.ChangeEvent<HTMLInputElement>
		) => void = ({ target: { value } }) => {
			enteredTitle = value;
		};
		const onNumberChange = (value: number | string) => {
			enteredNumber = parseInt(value.toString());
		};
		Modal.confirm({
			okText: "Додати",
			title: "Введіть заняття",
			cancelText: "Відмінити",
			content: (
				<div style={{ marginTop: "1%" }}>
					<InputNumber
						onChange={onNumberChange}
						placeholder="Введіть номер заняття"
						min={1}
						max={20}
						style={{ width: "100%" }}
					></InputNumber>
					<Input
						onChange={onTextChange}
						placeholder="Введіть назву заняття"
					></Input>
				</div>
			),
			onOk: () => {
				const topic = getCurrentTopic();
				topic.occupation.push({
					id: 0,
					title: enteredTitle,
					number: enteredNumber,
				});
				const subject = getCurrentSubject();
				// setSubjects([
				// 	...subjects.filter((sb) => sb.id !== subject.id),
				// 	subject,
				// ]);
				updateSubjects([
					...subjects.filter((sb) => sb.id !== subject.id),
					subject,
				]);
			},
			zIndex: 1100,
			icon: <EditOutlined />,
			closable: true,
		});
	};

	return (
		<div>
			<Row justify="center">
				<Descriptions bordered style={{ width: "100%" }}>
					<DescriptionsItem
						label="Оберіть предмет"
						span={3}
						labelStyle={descriptionItemLabelStyle}
						contentStyle={descriptionItemContentStyle}
					>
						<Select
							defaultValue={undefined}
							value={currentSubject !== 0 ? currentSubject : undefined}
							placeholder={<Row justify="start">Обрати предмет</Row>}
							style={{ width: "100%" }}
							onChange={handleSubjectSelectChange}
							dropdownRender={(menu) => (
								<div style={{ zIndex: 1000 }}>
									{menu}
									<Divider style={{ margin: "4px 0" }}></Divider>
									<div
										style={{ display: "flex", flexWrap: "nowrap", padding: 8 }}
									>
										<Button
											type="link"
											onClick={onCreateSubject}
											icon={<PlusOutlined></PlusOutlined>}
										>
											Додати предмет
										</Button>
									</div>
								</div>
							)}
						>
							{subjects.map((subj) => (
								<Option value={subj.id}>
									<div
										style={{
											whiteSpace: "pre-wrap",
										}}
									>
										{subj.shortTitle}
									</div>
								</Option>
							))}
						</Select>
					</DescriptionsItem>
					{currentSubject !== 0 && (
						<DescriptionsItem
							label="Оберіть програму підготовки"
							span={3}
							labelStyle={descriptionItemLabelStyle}
							contentStyle={descriptionItemContentStyle}
						>
							<Select
								defaultValue={undefined}
								value={
									currentProgramTraining !== 0
										? currentProgramTraining
										: undefined
								}
								placeholder={
									<Row justify="start">Обрати програму підготовки</Row>
								}
								style={{ width: "100%" }}
								onChange={handleProgramSelectChange}
								dropdownRender={(menu) => (
									<div style={{ zIndex: 1000 }}>
										{menu}
										<Divider style={{ margin: "4px 0" }}></Divider>
										<div
											style={{
												display: "flex",
												flexWrap: "nowrap",
												padding: 8,
											}}
										>
											<Button
												type="link"
												onClick={onCreateTrainingType}
												icon={<PlusOutlined></PlusOutlined>}
											>
												Додати програму підготовки
											</Button>
										</div>
									</div>
								)}
							>
								{getCurrentSubject().programTrainings.map((stp) => (
									<Option value={stp.id}>
										<div
											style={{
												whiteSpace: "pre-wrap",
											}}
										>
											{stp.title}
										</div>
									</Option>
								))}
							</Select>
						</DescriptionsItem>
					)}
					{currentProgramTraining !== 0 && (
						<DescriptionsItem
							label="Оберіть тему"
							span={3}
							labelStyle={descriptionItemLabelStyle}
							contentStyle={descriptionItemContentStyle}
						>
							<Select
								defaultValue={undefined}
								value={currentTopic !== 0 ? currentTopic : undefined}
								placeholder={<Row justify="start">Обрати тему</Row>}
								style={{ width: "100%" }}
								onChange={handleTopicSelectChange}
								dropdownRender={(menu) => (
									<div style={{ zIndex: 1000 }}>
										{menu}
										<Divider style={{ margin: "4px 0" }}></Divider>
										<div
											style={{
												display: "flex",
												flexWrap: "nowrap",
												padding: 8,
											}}
										>
											<Button
												type="link"
												onClick={onCreateTopic}
												icon={<PlusOutlined></PlusOutlined>}
											>
												Додати тему
											</Button>
										</div>
									</div>
								)}
							>
								{getCurrentTrainingProgram().topics.map((topic) => (
									<Option value={topic.id}>
										<div
											style={{
												whiteSpace: "pre-wrap",
											}}
										>
											{topic.number} {topic.title}
										</div>
									</Option>
								))}
							</Select>
						</DescriptionsItem>
					)}
					{currentTopic !== 0 && (
						<DescriptionsItem
							label="Оберіть заняття"
							span={3}
							labelStyle={descriptionItemLabelStyle}
							contentStyle={descriptionItemContentStyle}
						>
							<Select
								defaultValue={undefined}
								value={currentOccupation !== 0 ? currentOccupation : undefined}
								placeholder={<Row justify="start">Обрати заняття</Row>}
								style={{ width: "100%" }}
								onChange={handleOccupationSelectChange}
								dropdownRender={(menu) => (
									<div style={{ zIndex: 1000 }}>
										{menu}
										<Divider style={{ margin: "4px 0" }}></Divider>
										<div
											style={{
												display: "flex",
												flexWrap: "nowrap",
												padding: 8,
											}}
										>
											<Button
												type="link"
												onClick={onCreateOccupation}
												icon={<PlusOutlined></PlusOutlined>}
											>
												Додати заняття
											</Button>
										</div>
									</div>
								)}
							>
								{getCurrentTopic().occupation.map((occupation) => (
									<Option value={occupation.id}>
										<div
											style={{
												whiteSpace: "pre-wrap",
											}}
										>
											{occupation.number} {occupation.title}
										</div>
									</Option>
								))}
							</Select>
						</DescriptionsItem>
					)}
				</Descriptions>
			</Row>
			<Row justify="end" style={{ marginTop: "7%" }}>
				<Button
					icon={<CheckOutlined></CheckOutlined>}
					type={"primary"}
					size="large"
					disabled={
						currentOccupation === 0 ||
						currentProgramTraining === 0 ||
						currentSubject === 0 ||
						currentTopic === 0
					}
					onClick={() => {
						props.onSelect(getCurrentSubject(), {
							id: 0,
							occupation: currentOccupation,
							programTraining: currentProgramTraining,
							subject: currentSubject,
							topic: currentTopic,
						});
					}}
				>
					Обрати
				</Button>
			</Row>
		</div>
	);
};
