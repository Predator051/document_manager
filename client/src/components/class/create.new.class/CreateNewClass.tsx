import "moment/locale/uk";

import {
	FormOutlined,
	HomeOutlined,
	PlusOutlined,
	EditOutlined,
	ExclamationCircleOutlined,
	CloseCircleOutlined,
} from "@ant-design/icons";
import {
	Breadcrumb,
	Button,
	DatePicker,
	Descriptions,
	Divider,
	Input,
	InputNumber,
	Modal,
	Row,
	Select,
	Typography,
	Col,
} from "antd";
import DatePickerLocal from "antd/es/date-picker/locale/uk_UA";
import * as moment from "moment";
import React, { useEffect, useState, useContext } from "react";
import { useHistory } from "react-router-dom";

import { GenerateGroupName } from "../../../helpers/GroupHelper";
import { ConnectionManager } from "../../../managers/connetion/connectionManager";
import { ClassEvent } from "../../../types/classEvent";
import { Group } from "../../../types/group";
import {
	RequestCode,
	RequestMessage,
	RequestType,
} from "../../../types/requests";
import { Subject } from "../../../types/subject";
import { SubjectSelectPath } from "../../../types/subjectSelectPath";
import { GroupManipulator } from "../../group/creator/GroupManipulator";
import { HREFS } from "../../menu/Menu";
import { SubjectSelector } from "../../subject/create/SubjectSelector";
import { BackPage } from "../../ui/BackPage";
import { YearContext } from "../../../context/YearContext";
import { group } from "console";
import { ClassFileManager } from "../../ui/ClassFileManager";
import { ClassFile } from "../../../types/classFile";

moment.locale("uk");

const { Option } = Select;

export function CreateNewClassPage() {
	const history = useHistory();
	const [groups, setGroups] = useState<Group[]>([]);
	const [subject, setSubject] = useState<Subject | undefined>(undefined);
	const [selectSubjectPath, setSelectSubjectPath] = useState<
		SubjectSelectPath | undefined
	>(undefined);
	const [classDate, setClassDate] = useState<Date | undefined>(undefined);
	const [selectedGroups, setSelectedGroups] = useState<Group[]>([]);
	const [hours, setHours] = useState<number>(1);
	const [place, setPlace] = useState<string>("");
	const [selectedFiles, setSelectedFiles] = useState<ClassFile[]>([]);

	const yearContext = useContext(YearContext);

	function getSelectOccupation() {
		if (subject !== undefined) {
			return subject.programTrainings
				.find((pt) => pt.id === selectSubjectPath.programTraining)
				.topics.find((t) => t.id === selectSubjectPath.topic)
				.occupation.find((o) => o.id === selectSubjectPath.occupation);
		}
	}

	function handleGroupChange(values: number[]) {
		setSelectedGroups(
			values.map((value) => groups.find((gr) => gr.id === value))
		);
	}

	function handleDateChange(date: moment.Moment) {
		// setSelectedGroup(groups.find((gr) => gr.id === value));
		setClassDate(date.toDate());
	}

	function handleHoursChange(value: React.Key) {
		if (value !== undefined && value !== null)
			setHours(parseInt(value.toString()));
	}

	const handlePlaceChange: (
		event: React.ChangeEvent<HTMLInputElement>
	) => void = ({ target: { value } }) => {
		setPlace(value);
	};

	function onCreatedEditedGroupExist(
		modal: ReturnType<typeof Modal.info>,
		existedGroup: Group
	) {
		const createdModal = Modal.confirm({
			title: (
				<Typography.Text>
					Група{" "}
					<Typography.Text strong>
						{GenerateGroupName(existedGroup)}
					</Typography.Text>{" "}
					вже існує. Переглянути існуючу групу?
				</Typography.Text>
			),
			closable: true,
			okText: "Так",
			cancelText: "Ні",
			zIndex: 1050,
			icon: <CloseCircleOutlined></CloseCircleOutlined>,

			onOk: () => {
				// modal.destroy();
				onGroupInfoClick(existedGroup.id);
				createdModal.destroy();
			},
		});
	}

	function onCreateGroupClick() {
		const modal = Modal.info({
			title: "Створення группи",
			width: window.screen.width * 0.9,
			style: { top: 20 },
			closable: true,
			okButtonProps: {
				style: { visibility: "hidden" },
			},
			zIndex: 1050,
		});
		const onGroupCreate = (group: Group) => {
			ConnectionManager.getInstance().registerResponseOnceHandler(
				RequestType.CREATE_GROUP,
				(data) => {
					const dataMessage = data as RequestMessage<any>;
					if (dataMessage.requestCode === RequestCode.RES_CODE_INTERNAL_ERROR) {
						console.log(`Error: ${dataMessage.requestCode}`);
						return;
					}

					loadAllGroups();
				}
			);
			ConnectionManager.getInstance().emit(RequestType.CREATE_GROUP, group);
			modal.destroy();
		};
		const onGroupCreatorClose = () => {};
		modal.update({
			content: (
				<div
					style={{
						height: "auto",
					}}
				>
					<GroupManipulator
						onCreate={onGroupCreate}
						onClose={onGroupCreatorClose}
						onExist={onCreatedEditedGroupExist.bind(null, modal)}
					></GroupManipulator>
				</div>
			),
		});
	}

	function onCreateSubjectClick() {
		const modal = Modal.info({
			title: "Обрання предмету",
			width: window.screen.width * 0.9,
			style: { top: 20 },
			closable: true,
			okButtonProps: {
				style: { visibility: "hidden" },
			},
			zIndex: 1050,
		});
		const onSubjectCreate = (subject: Subject, path: SubjectSelectPath) => {
			setSubject(subject);
			setSelectSubjectPath(path);
			setSelectedFiles([]);
			modal.destroy();
		};
		const onSubjectCreatorClose = () => {};
		modal.update({
			content: (
				<div
					style={{
						height: "auto",
						// minHeight: "500px",
					}}
				>
					<SubjectSelector
						onSelect={onSubjectCreate}
						onClose={onSubjectCreatorClose}
					></SubjectSelector>
				</div>
			),
		});
	}

	function onGroupInfoClick(groupId: number) {
		const modal = Modal.info({
			title: "Інформація про групу",
			width: window.screen.width * 0.9,
			style: { top: 20 },
			closable: true,
			okButtonProps: {
				style: { visibility: "hidden" },
			},
			zIndex: 1050,
		});
		const onGroupUpdate = (group: Group) => {
			ConnectionManager.getInstance().registerResponseOnceHandler(
				RequestType.UPDATE_GROUP,
				(data) => {
					const dataMessage = data as RequestMessage<any>;
					if (dataMessage.requestCode === RequestCode.RES_CODE_INTERNAL_ERROR) {
						console.log(`Error: ${dataMessage.requestCode}`);
						return;
					}

					loadAllGroups();
				}
			);
			ConnectionManager.getInstance().emit(RequestType.UPDATE_GROUP, group);
			modal.destroy();
		};
		const onSubjectCreatorClose = () => {};
		modal.update({
			content: (
				<div
					style={{
						height: "auto",
						// minHeight: "500px",
					}}
				>
					<GroupManipulator
						onCreate={onGroupUpdate}
						onClose={onSubjectCreatorClose}
						onExist={onCreatedEditedGroupExist.bind(null, modal)}
						group={groups.find((gr) => gr.id === groupId)}
						createText="Оновити"
					></GroupManipulator>
				</div>
			),
		});
	}

	const createClassClick = () => {
		ConnectionManager.getInstance().registerResponseOnceHandler(
			RequestType.CREATE_CLASS,
			(data) => {
				const dataMessage = data as RequestMessage<ClassEvent>;
				if (dataMessage.requestCode === RequestCode.RES_CODE_INTERNAL_ERROR) {
					console.log(`Error: ${dataMessage.requestCode}`);
					return;
				}

				if (selectedGroups.length <= 1) {
					history.push(HREFS.SHOW_CLASS + dataMessage.data.id);
				} else {
					Modal.success({
						title: "Успішно!",
						closable: true,
						zIndex: 1050,
						content:
							"Заняття для обраних груп успішно створені! Переглянути створені заняття можливо в меню 'Мої заняття'. ",
						okText: "ОК",
					});
				}
			}
		);

		selectedGroups.forEach((gr) => {
			const classEvent = new ClassEvent();
			classEvent.groupId = gr.id;
			classEvent.date = classDate;
			classEvent.hours = hours;
			classEvent.place = place;
			classEvent.selectPath = selectSubjectPath;
			classEvent.id = 0;
			classEvent.files = selectedFiles;

			ConnectionManager.getInstance().emit(
				RequestType.CREATE_CLASS,
				classEvent
			);
		});
	};

	useEffect(() => {
		loadAllGroups();
	}, []);

	const descriptionItemLabelStyle: React.CSSProperties = {
		width: "45%",
		maxWidth: "45%",
		backgroundColor: "#e1e3f0",
		fontSize: "large",
	};

	const descriptionItemContentStyle: React.CSSProperties = {
		width: "55%",
		maxWidth: "55%",
		backgroundColor: "#edf0fc",
		fontSize: "large",
	};

	const loadAllGroups = () => {
		ConnectionManager.getInstance().registerResponseOnceHandler(
			RequestType.GET_ALL_GROUPS,
			(data) => {
				const dataMessage = data as RequestMessage<Group[]>;
				if (
					dataMessage.requestCode === RequestCode.RES_CODE_INTERNAL_ERROR ||
					dataMessage.requestCode === RequestCode.RES_CODE_NOT_AUTHORIZED
				) {
					console.log(`Error: ${dataMessage.requestCode}`);
					return;
				}

				setGroups(dataMessage.data);
			}
		);
		ConnectionManager.getInstance().emit(RequestType.GET_ALL_GROUPS, {
			year: yearContext.year,
		});
	};

	const onClassFileClick = () => {
		const modal = Modal.info({
			title: "Менеджер файлів занять",
			width: window.screen.width * 0.9,
			style: { top: 20 },
			closable: true,
			okButtonProps: {
				style: { visibility: "hidden" },
			},
			zIndex: 1050,
		});
		const onSelect = (files: ClassFile[]) => {
			setSelectedFiles(files);

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
					<ClassFileManager
						occupationId={selectSubjectPath.occupation}
						selectedFiles={selectedFiles}
						onSelect={onSelect}
						edit={true}
					></ClassFileManager>
				</div>
			),
		});
	};

	return (
		<div style={{ marginTop: "1%" }}>
			<BackPage></BackPage>
			<Row justify="center" className="swing-in-top-fwd">
				<Descriptions
					title={
						<Typography.Title level={2}>Створення заняття</Typography.Title>
					}
					bordered
					style={{ minWidth: "60%", width: "max-content", maxWidth: "100%" }}
				>
					<Descriptions.Item
						label="Оберіть групу (групи) чи створіть нову:"
						span={3}
						labelStyle={descriptionItemLabelStyle}
						contentStyle={descriptionItemContentStyle}
					>
						<Select
							defaultValue={undefined}
							placeholder={<Row justify="start">Обрати групу(групи)</Row>}
							style={{ width: "100%" }}
							onChange={handleGroupChange}
							dropdownRender={(menu) => (
								<div style={{ zIndex: 1000 }}>
									{menu}
									<Divider style={{ margin: "4px 0" }}></Divider>
									<div
										style={{ display: "flex", flexWrap: "nowrap", padding: 8 }}
									>
										<Button
											type="link"
											onClick={onCreateGroupClick}
											icon={<PlusOutlined></PlusOutlined>}
										>
											Створити нову групу
										</Button>
									</div>
								</div>
							)}
							mode="multiple"
						>
							{groups.map((gr) => (
								<Option value={gr.id} title={GenerateGroupName(gr)}>
									<Row justify="start" align="middle">
										<Col flex="auto">{GenerateGroupName(gr)}</Col>
										<Col flex="auto">
											<Row justify="end" align="middle">
												{/* <Button
													icon={
														<ExclamationCircleOutlined></ExclamationCircleOutlined>
													}
													type="link"
													onClick={() => {
														onGroupInfoClick(gr.id);
													}}
													style={{ margin: 0, padding: 0 }}
												></Button> */}
												<div
													onClick={() => {
														onGroupInfoClick(gr.id);
													}}
													style={{
														paddingLeft: "5px",
													}}
												>
													<ExclamationCircleOutlined></ExclamationCircleOutlined>
												</div>
											</Row>
										</Col>
									</Row>
								</Option>
							))}
						</Select>
					</Descriptions.Item>
					<Descriptions.Item
						label="Оберіть заняття чи створіть нове:"
						span={3}
						labelStyle={descriptionItemLabelStyle}
						contentStyle={descriptionItemContentStyle}
					>
						<Button
							type="dashed"
							onClick={onCreateSubjectClick}
							icon={<PlusOutlined></PlusOutlined>}
							style={{ width: "100%", height: "auto" }}
						>
							{subject === undefined ? (
								"Обрати предмет"
							) : (
								<div
									style={{
										whiteSpace: "pre-wrap",
									}}
								>
									{getSelectOccupation().title}
								</div>
							)}
						</Button>
					</Descriptions.Item>
					{selectSubjectPath !== undefined && (
						<Descriptions.Item
							label="Оберіть чи додайте додатковий матеріал (за бажанням):"
							span={3}
							labelStyle={descriptionItemLabelStyle}
							contentStyle={descriptionItemContentStyle}
						>
							<Button
								type="dashed"
								onClick={onClassFileClick}
								style={{ width: "100%", height: "auto" }}
							>
								{selectedFiles.length <= 0 ? (
									"Оберіть чи додайте додатковий матеріал"
								) : (
									<div>
										{selectedFiles.map((file) => (
											<Row style={{ width: "100%" }}>{file.filename}</Row>
										))}
									</div>
								)}
							</Button>
						</Descriptions.Item>
					)}

					<Descriptions.Item
						label="Оберіть дату:"
						span={3}
						labelStyle={descriptionItemLabelStyle}
						contentStyle={descriptionItemContentStyle}
					>
						<DatePicker
							style={{ width: "100%" }}
							locale={DatePickerLocal}
							onChange={handleDateChange}
							format="DD-MM-YYYY"
						></DatePicker>
					</Descriptions.Item>
					<Descriptions.Item
						label="Оберіть години"
						span={3}
						labelStyle={descriptionItemLabelStyle}
						contentStyle={descriptionItemContentStyle}
					>
						<InputNumber
							min={1}
							max={20}
							defaultValue={1}
							onChange={handleHoursChange}
						/>
					</Descriptions.Item>
					<Descriptions.Item
						label="Введіть місце проведення:"
						span={3}
						labelStyle={descriptionItemLabelStyle}
						contentStyle={descriptionItemContentStyle}
					>
						<Input
							placeholder="клас 505, стадіон, військове стрільбище, полігон зв’язку і т.д."
							onChange={handlePlaceChange}
						/>
					</Descriptions.Item>
				</Descriptions>
			</Row>
			<Row
				justify="center"
				style={{
					marginTop: "1%",
				}}
			>
				<Button
					type={"primary"}
					onClick={createClassClick}
					disabled={
						selectedGroups.length <= 0 ||
						selectSubjectPath === undefined ||
						setClassDate === undefined ||
						hours === 0 ||
						place === ""
					}
				>
					Створити
				</Button>
			</Row>
		</div>
	);
}
