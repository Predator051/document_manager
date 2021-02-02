import "moment/locale/uk";

import {
	CheckOutlined,
	EditOutlined,
	ExclamationCircleOutlined,
	PlusOutlined,
	AlertOutlined,
} from "@ant-design/icons";
import {
	Button,
	Col,
	Descriptions,
	Divider,
	Input,
	InputNumber,
	Modal,
	Row,
	Select,
	Spin,
} from "antd";
import DescriptionsItem from "antd/lib/descriptions/Item";
import * as moment from "moment";
import React, { useContext, useEffect, useState } from "react";

import { YearContext } from "../../../context/YearContext";
import { ConnectionManager } from "../../../managers/connetion/connectionManager";
import { ObjectStatus } from "../../../types/constants";
import {
	RequestCode,
	RequestMessage,
	RequestType,
} from "../../../types/requests";
import { Subject } from "../../../types/subject";
import { SubjectSelectPath } from "../../../types/subjectSelectPath";
import { TopicEditor } from "../topic/TopicEditor";
import { OccupationEditor } from "../occupation/OccupationEditor";

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
	let [currentSubject, setCurrentSubject] = useState<number>(0);
	let [currentProgramTraining, setCurrentProgramTraining] = useState<number>(0);
	let [currentTopic, setCurrentTopic] = useState<number>(0);
	let [currentOccupation, setCurrentOccupation] = useState<number>(0);
	let [loading, setLoading] = useState<boolean>(true);
	const yearContext = useContext(YearContext);

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

				dataMessage.data.forEach((subj) => {
					subj.programTrainings.forEach((pt) => {
						pt.topics = pt.topics.filter(
							(t) => t.status === ObjectStatus.NORMAL
						);
						pt.topics.forEach((t) => {
							t.occupation = t.occupation.filter(
								(occ) => occ.status === ObjectStatus.NORMAL
							);
						});
					});
				});
				setSubjects(dataMessage.data);
				setLoading(false);
			}
		);
		ConnectionManager.getInstance().emit(RequestType.GET_ALL_SUBJECTS, {
			year: yearContext.year,
		});
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

				dataMessage.data.forEach((subj) => {
					subj.programTrainings.forEach((pt) => {
						pt.topics = pt.topics.filter(
							(t) => t.status === ObjectStatus.NORMAL
						);
						pt.topics.forEach((t) => {
							t.occupation = t.occupation.filter(
								(occ) => occ.status === ObjectStatus.NORMAL
							);
						});
					});
				});

				setSubjects(
					dataMessage.data.filter((subj) => subj.status === ObjectStatus.NORMAL)
				);
				setLoading(false);
			}
		);

		setLoading(true);
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
		setCurrentSubject(
			subjects.findIndex((s) => s.id === value) >= 0 ? value : 0
		);
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
						status: ObjectStatus.NORMAL,
					},
				]);
			},
			zIndex: 1100,
			icon: <EditOutlined />,
			closable: true,
		});
	};

	const onEditSubject = (subjectId: number) => {
		const foundSubject = subjects.find((s) => s.id === subjectId);

		const EditSubject: React.FC<{
			subject: Subject;
			onOk: (subject: Subject) => void;
		}> = (props: { subject: Subject; onOk: (subject: Subject) => void }) => {
			const [subject, setSubject] = useState<Subject>({ ...props.subject });
			const onTextChange: (
				who: string,
				event: React.ChangeEvent<HTMLInputElement>
			) => void = (who: string, { target: { value } }) => {
				if (who === "full") {
					foundSubject.fullTitle = value;
					setSubject({ ...subject, fullTitle: value });
				} else if (who === "short") {
					setSubject({ ...subject, shortTitle: value });
				}
			};
			return (
				<div>
					<Descriptions bordered>
						<DescriptionsItem label="Введіть повну назву" span={3}>
							<Input
								onChange={onTextChange.bind(null, "full")}
								placeholder="Введіть повну назву"
								value={subject.fullTitle}
								style={{ marginTop: "1%" }}
							></Input>
						</DescriptionsItem>
						<DescriptionsItem label="Введіть коротку назву" span={3}>
							<Input
								onChange={onTextChange.bind(null, "short")}
								placeholder="Введіть коротку назву"
								value={subject.shortTitle}
								style={{ marginTop: "1%" }}
							></Input>
						</DescriptionsItem>
						{/* <DescriptionsItem label="Чи актуальний предмет" span={3}>
							<Switch
								checkedChildren="актуальний"
								unCheckedChildren="не актуальный"
								size="default"
								checked={subject.status !== ObjectStatus.ARCHIVE}
								onChange={(checked) => {
									subject.status = checked
										? ObjectStatus.NORMAL
										: ObjectStatus.ARCHIVE;
									setSubject({ ...subject });
								}}
								style={{ marginTop: "1%" }}
							></Switch>
						</DescriptionsItem> */}
					</Descriptions>

					<Row justify="end">
						<Button
							type={"primary"}
							style={{ marginTop: "1%" }}
							onClick={() => {
								props.onOk(subject);
							}}
						>
							Оновити
						</Button>
					</Row>
				</div>
			);
		};

		const modal = Modal.confirm({
			title: "Інформація про предмет",
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
					<EditSubject
						subject={foundSubject}
						onOk={(subject) => {
							updateSubjects([
								...subjects.filter((s) => s.id !== subject.id),
								subject,
							]);
							modal.destroy();
						}}
					></EditSubject>
				</div>
			),
		});
	};

	const onEditTopic = (topicId: number) => {
		const alert = Modal.confirm({
			title: "Увага!",
			content:
				"Якщо ви змінюєте цю тему, то заняття цієї теми не будуть доступні для обирання! Якщо ви дійсно хочете змінити, то натисніть кнопку 'ОК'",
			icon: <AlertOutlined />,
			zIndex: 1100,
			closable: true,
			onOk: () => {
				const foundTopic = getCurrentTrainingProgram().topics.find(
					(s) => s.id === topicId
				);
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
							<TopicEditor
								topic={foundTopic}
								onOk={(topic) => {
									const trainingProgram = getCurrentTrainingProgram();
									trainingProgram.topics.push({
										...topic,
										id: 0,
										occupation: [],
									});
									trainingProgram.topics.push({
										...foundTopic,
										status: ObjectStatus.ARCHIVE,
									});
									const subject = getCurrentSubject();
									updateSubjects([
										...subjects.filter((sb) => sb.id !== subject.id),
										subject,
									]);

									setCurrentTopic(0);
									setCurrentOccupation(0);
									modal.destroy();
								}}
							></TopicEditor>
						</div>
					),
				});
			},
			cancelText: "Відмінити"
		});
	};

	const onEditOccupation = (occupationId: number) => {
		const foundOccupation = getCurrentTopic().occupation.find(
			(s) => s.id === occupationId
		);
		const modal = Modal.confirm({
			title: "Інформація про предмет",
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
					<OccupationEditor
						topic={foundOccupation}
						onOk={(occupation) => {
							const topic = getCurrentTopic();
							topic.occupation.push({
								...occupation,
								id: 0,
							});
							topic.occupation.push({
								...foundOccupation,
								status: ObjectStatus.ARCHIVE,
							});
							const subject = getCurrentSubject();
							updateSubjects([
								...subjects.filter((sb) => sb.id !== subject.id),
								subject,
							]);

							setCurrentOccupation(0);
							modal.destroy();
						}}
					></OccupationEditor>
				</div>
			),
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
					status: ObjectStatus.NORMAL,
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
					status: ObjectStatus.NORMAL,
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

	if (loading) {
		return <Spin></Spin>;
	}

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
										<Row
											justify="start"
											align="middle"
											style={{ margin: 0, padding: 0 }}
										>
											<Col flex="auto">{subj.shortTitle}</Col>
											<Col flex="10%" style={{ margin: 0, padding: 0 }}>
												<Row justify="end" style={{ margin: 0, padding: 0 }}>
													<Button
														icon={
															<ExclamationCircleOutlined
																style={{ margin: 0, padding: 0 }}
															></ExclamationCircleOutlined>
														}
														type="link"
														onClick={() => {
															onEditSubject(subj.id);
														}}
														style={{ margin: 0, padding: 0 }}
													></Button>
												</Row>
											</Col>
										</Row>
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
											<Row
												justify="start"
												align="middle"
												style={{ margin: 0, padding: 0 }}
											>
												<Col flex="auto">
													{topic.number} {topic.title}
												</Col>
												<Col flex="10%" style={{ margin: 0, padding: 0 }}>
													<Row justify="end" style={{ margin: 0, padding: 0 }}>
														<Button
															icon={
																<EditOutlined
																	style={{ margin: 0, padding: 0 }}
																></EditOutlined>
															}
															type="link"
															onClick={() => {
																onEditTopic(topic.id);
															}}
															style={{ margin: 0, padding: 0 }}
														></Button>
													</Row>
												</Col>
											</Row>
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
											<Row
												justify="start"
												align="middle"
												style={{ margin: 0, padding: 0 }}
											>
												<Col flex="auto">
													{occupation.number} {occupation.title}
												</Col>
												<Col flex="10%" style={{ margin: 0, padding: 0 }}>
													<Row justify="end" style={{ margin: 0, padding: 0 }}>
														<Button
															icon={
																<EditOutlined
																	style={{ margin: 0, padding: 0 }}
																></EditOutlined>
															}
															type="link"
															onClick={() => {
																onEditOccupation(occupation.id);
															}}
															style={{ margin: 0, padding: 0 }}
														></Button>
													</Row>
												</Col>
											</Row>
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
