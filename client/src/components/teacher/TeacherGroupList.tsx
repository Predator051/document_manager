import "../../../node_modules/hover.css/css/hover.css";

import {
	DownOutlined,
	OrderedListOutlined,
	UpOutlined,
} from "@ant-design/icons";
import { Button, Descriptions, Row, Select, Typography } from "antd";
import React, { useEffect, useState, useContext } from "react";
import { useHistory } from "react-router-dom";

import { GenerateGroupName } from "../../helpers/GroupHelper";
import { ConnectionManager } from "../../managers/connetion/connectionManager";
import { ClassEvent } from "../../types/classEvent";
import { Group } from "../../types/group";
import { Norm } from "../../types/norm";
import { NormProcess } from "../../types/normProcess";
import { RequestCode, RequestMessage, RequestType } from "../../types/requests";
import { Subject } from "../../types/subject";
import { GroupNormTable } from "../group/GroupNormTable";
import { GroupSubjectTable } from "../group/GroupSubjectTable";
import { GroupTable } from "../group/GroupTable";
import { NormInfoDrawer } from "../norm/NormInfoDrawer";
import { YearContext } from "../../context/YearContext";

export interface TeacherGroupListProps {
	userId: number;
}

interface TeacherGroupListData {
	classEvent: ClassEvent;
	group: Group;
}

export const TeacherGroupList: React.FC<TeacherGroupListProps> = (
	props: TeacherGroupListProps
) => {
	const history = useHistory();
	const yearContext = useContext(YearContext);
	const [classEvents, setClassEvents] = useState<ClassEvent[]>([]);
	const [normProcesses, setNormProcesses] = useState<NormProcess[]>([]);
	const [groups, setGroups] = useState<Group[]>([]);
	const [selectedGroup, setSelectedGroup] = useState<Group | undefined>(
		undefined
	);
	const [userCycleSubjects, setUserCycleSubjects] = useState<Subject[]>([]);
	const [userCycleNorms, setUserCycleNorms] = useState<Norm[]>([]);
	const [normInfoDrawerVisible, setNormInfoDrawerVisible] = useState<boolean>(
		false
	);

	const loadGroups = (data: number[]) => {
		ConnectionManager.getInstance().emit(RequestType.GET_GROUP_BY_ID, data);
	};

	const [selectedSubject, setSelectedSubject] = useState<Subject | undefined>(
		undefined
	);
	const [selectedNorm, setSelectedNorm] = useState<boolean>(false);

	useEffect(() => {
		ConnectionManager.getInstance().registerResponseOnceHandler(
			RequestType.GET_CLASSES_BY_USER,
			(data) => {
				const dataMessage = data as RequestMessage<ClassEvent[]>;
				if (dataMessage.requestCode === RequestCode.RES_CODE_INTERNAL_ERROR) {
					console.log(`Error: ${dataMessage.requestCode}`);
					return;
				}
				console.log("recieve classes", dataMessage.data);

				dataMessage.data.forEach(
					(classEvent) => (classEvent.date = new Date(classEvent.date))
				);
				setClassEvents(dataMessage.data);

				loadGroups(
					dataMessage.data
						.map((ce) => ce.groupId)
						.filter((value, index, self) => self.indexOf(value) === index)
				);
			}
		);
		ConnectionManager.getInstance().registerResponseOnceHandler(
			RequestType.GET_NORM_PROCESS_BY_USER,
			(data) => {
				const dataMessage = data as RequestMessage<NormProcess[]>;
				if (dataMessage.requestCode === RequestCode.RES_CODE_INTERNAL_ERROR) {
					console.log(`Error: ${dataMessage.requestCode}`);
					return;
				}
				setNormProcesses(dataMessage.data);

				loadGroups(dataMessage.data.map((np) => np.group.id));
			}
		);

		const getGroupByIds = (data: any) => {
			const dataMessage = data as RequestMessage<Group[]>;
			if (
				dataMessage.requestCode === RequestCode.RES_CODE_INTERNAL_ERROR &&
				dataMessage.data.length < 1
			) {
				console.log(`Error: ${dataMessage.requestCode}`);
				return;
			}

			dataMessage.data.forEach((gr) => {
				if (groups.findIndex((g) => g.id === gr.id) < 0) {
					groups.push(gr);
				}
			});

			setGroups([...groups]);
		};

		ConnectionManager.getInstance().registerResponseHandler(
			RequestType.GET_GROUP_BY_ID,
			getGroupByIds
		);

		ConnectionManager.getInstance().emit(RequestType.GET_CLASSES_BY_USER, {
			userId: props.userId,
			year: yearContext.year,
		});

		ConnectionManager.getInstance().emit(RequestType.GET_NORM_PROCESS_BY_USER, {
			userId: props.userId,
			year: yearContext.year,
		});

		ConnectionManager.getInstance().registerResponseOnceHandler(
			RequestType.GET_SUBJECTS_BY_USER_CYCLE,
			(data) => {
				const dataMessage = data as RequestMessage<Subject[]>;
				if (dataMessage.requestCode === RequestCode.RES_CODE_INTERNAL_ERROR) {
					console.log(`Error: ${dataMessage.requestCode}`);
					return;
				}
				console.log("GET_SUBJECTS_BY_USER_CYCLE", dataMessage.data);

				setUserCycleSubjects(dataMessage.data);
			}
		);

		ConnectionManager.getInstance().emit(
			RequestType.GET_SUBJECTS_BY_USER_CYCLE,
			{
				userId: props.userId,
				year: yearContext.year,
			}
		);

		ConnectionManager.getInstance().registerResponseOnceHandler(
			RequestType.GET_NORMS_BY_USER_CYCLE,
			(data) => {
				const dataMessage = data as RequestMessage<Norm[]>;
				if (dataMessage.requestCode === RequestCode.RES_CODE_INTERNAL_ERROR) {
					console.log(`Error: ${dataMessage.requestCode}`);
					return;
				}
				setUserCycleNorms(dataMessage.data);
			}
		);

		ConnectionManager.getInstance().emit(
			RequestType.GET_NORMS_BY_USER_CYCLE,
			props.userId
		); //TODO Add year to request

		return () => {
			ConnectionManager.getInstance().removeRegisteredHandler(
				RequestType.GET_GROUP_BY_ID,
				getGroupByIds
			);
		};
	}, []);

	// if (groups.length < 1) {
	// 	console.log("NOT DATA");

	// 	return (
	// 		<div>
	// 			<Spin></Spin>
	// 		</div>
	// 	);
	// }

	const descriptionItemLabelStyle: React.CSSProperties = {
		width: "45%",
		backgroundColor: "#2988e2",
		fontSize: "large",
		color: "white",
	};

	const descriptionItemContentStyle: React.CSSProperties = {
		width: "45%",
		backgroundColor: "#fff",
		fontSize: "large",
	};

	const onGroupSelectChanged = (value: number) => {
		setSelectedGroup(groups.find((gr) => gr.id === value));
		setSelectedSubject(undefined);
		setSelectedNorm(false);
	};

	const onSubjectSelectChanged = (value: number) => {
		setSelectedSubject(userCycleSubjects.find((s) => s.id === value));
		setSelectedNorm(false);
	};

	const onNormSelectChanged = () => {
		setSelectedNorm(!selectedNorm);
		// setSelectedSubject(undefined);
	};

	const getTitle = (records: any[]) => {
		return (
			<Row>
				<Typography.Text strong>
					{selectedGroup.company} рота, {selectedGroup.platoon} взвод, ВОС{" "}
					{selectedGroup.mrs}
				</Typography.Text>
			</Row>
		);
	};

	return (
		<div>
			<Row justify="center">
				<Descriptions style={{ width: "50%" }} bordered>
					<Descriptions.Item
						label="Оберіть групу"
						span={3}
						labelStyle={descriptionItemLabelStyle}
						contentStyle={descriptionItemContentStyle}
					>
						<Select style={{ width: "100%" }} onChange={onGroupSelectChanged}>
							{groups.map((gr) => {
								return (
									<Select.Option value={gr.id} key={gr.id}>
										{GenerateGroupName(gr)}
									</Select.Option>
								);
							})}
						</Select>
					</Descriptions.Item>
					{selectedGroup && (
						<Descriptions.Item
							label="Оберіть предмет"
							span={3}
							labelStyle={descriptionItemLabelStyle}
							contentStyle={descriptionItemContentStyle}
						>
							<div>
								<Select
									style={{ width: "100%" }}
									onChange={onSubjectSelectChanged}
									value={selectedSubject?.id}
									allowClear
								>
									{userCycleSubjects.map((subject) => {
										return (
											<Select.Option value={subject.id} key={subject.id}>
												{subject.fullTitle}
											</Select.Option>
										);
									})}
								</Select>
							</div>
						</Descriptions.Item>
					)}
					{selectedGroup && selectedSubject && (
						<Descriptions.Item
							label="Відобразити нормативи"
							span={3}
							labelStyle={descriptionItemLabelStyle}
							contentStyle={descriptionItemContentStyle}
						>
							<div>
								<Button
									type={"default"}
									onClick={() => {
										setNormInfoDrawerVisible(true);
									}}
									style={{ width: "100%", height: "100%" }}
									icon={<OrderedListOutlined></OrderedListOutlined>}
								>
									Показати список нормативів ЦК
								</Button>
								<Button
									type={"dashed"}
									onClick={onNormSelectChanged}
									style={{ width: "100%", height: "100%" }}
									icon={selectedNorm ? <UpOutlined /> : <DownOutlined />}
								>
									{selectedNorm ? "Сховати" : "Відобразити"}
								</Button>
							</div>
						</Descriptions.Item>
					)}
				</Descriptions>
			</Row>
			<Row justify="center" style={{ marginTop: "1%", marginBottom: "1%" }}>
				{selectedGroup &&
					selectedNorm === false &&
					selectedSubject === undefined && (
						<div style={{ width: "50%" }}>
							<GroupTable
								userGroups={selectedGroup.users}
								title={getTitle}
							></GroupTable>
						</div>
					)}
				{selectedSubject && selectedNorm === false && (
					<div style={{ width: "auto" }}>
						<GroupSubjectTable
							group={selectedGroup}
							subject={selectedSubject}
							classEvents={classEvents.filter(
								(ce) =>
									ce.userId === props.userId &&
									ce.selectPath.subject === selectedSubject.id &&
									ce.groupId === selectedGroup.id
							)}
							title={() => (
								<Row>
									<Typography.Text strong>
										Облік з предмету "{selectedSubject.fullTitle}
									</Typography.Text>
									"
								</Row>
							)}
						></GroupSubjectTable>
					</div>
				)}

				{selectedNorm && (
					<div style={{ width: "auto" }}>
						<GroupNormTable
							group={selectedGroup}
							userId={props.userId}
							subject={selectedSubject}
							title={() => (
								<Row>
									<Typography.Text strong>
										Облік виконання нормативів з "{selectedSubject.fullTitle}
									</Typography.Text>
									"
								</Row>
							)}
						></GroupNormTable>
					</div>
				)}
			</Row>
			<NormInfoDrawer
				visible={normInfoDrawerVisible}
				onClose={() => {
					setNormInfoDrawerVisible(false);
				}}
				editable={false}
				userId={props.userId}
			></NormInfoDrawer>
		</div>
	);
};
