import "../../../node_modules/hover.css/css/hover.css";

import { Descriptions, Row, Select, Typography } from "antd";
import React, { useContext, useEffect, useState } from "react";

import { YearContext } from "../../context/YearContext";
import { GenerateGroupName } from "../../helpers/GroupHelper";
import { ConnectionManager } from "../../managers/connetion/connectionManager";
import { ClassEvent } from "../../types/classEvent";
import { Group } from "../../types/group";
import { RequestCode, RequestMessage, RequestType } from "../../types/requests";
import { Subject } from "../../types/subject";
import { GroupSubjectTable } from "../group/GroupSubjectTable";
import { GroupTable } from "../group/GroupTable";
import { NormInfoDrawer } from "../norm/NormInfoDrawer";

export interface TeacherGroupListProps {
	userId: number;
}

interface TeacherGroupListData {
	classEvent: ClassEvent;
	group: Group;
}

export const TeacherGroupSubjectList: React.FC<TeacherGroupListProps> = (
	props: TeacherGroupListProps
) => {
	const yearContext = useContext(YearContext);
	const [classEvents, setClassEvents] = useState<ClassEvent[]>([]);
	const [groups, setGroups] = useState<Group[]>([]);
	const [selectedGroup, setSelectedGroup] = useState<Group | undefined>(
		undefined
	);
	const [userCycleSubjects, setUserCycleSubjects] = useState<Subject[]>([]);
	const [normInfoDrawerVisible, setNormInfoDrawerVisible] = useState<boolean>(
		false
	);

	const [selectedSubject, setSelectedSubject] = useState<Subject | undefined>(
		undefined
	);

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

				// dataMessage.data = dataMessage.data.filter((classEvent) => {
				// 	return classEvent.presences.some(
				// 		(presence) =>
				// 			presence.mark.current !== 0 ||
				// 			presence.mark.topic !== 0 ||
				// 			presence.mark.subject !== 0
				// 	);
				// });
				dataMessage.data.forEach(
					(classEvent) => (classEvent.date = new Date(classEvent.date))
				);
				setClassEvents(dataMessage.data);

				ConnectionManager.getInstance().emit(
					RequestType.GET_GROUP_BY_ID,
					dataMessage.data
						.map((ce) => ce.groupId)
						.filter((value, index, self) => self.indexOf(value) === index)
				);
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

		ConnectionManager.getInstance().registerResponseOnceHandler(
			RequestType.GET_GROUP_BY_ID,
			getGroupByIds
		);

		ConnectionManager.getInstance().emit(RequestType.GET_CLASSES_BY_USER, {
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
	}, []);

	const descriptionItemLabelStyle: React.CSSProperties = {
		width: "30%",
		backgroundColor: "#2988e2",
		fontSize: "large",
		color: "white",
	};

	const descriptionItemContentStyle: React.CSSProperties = {
		width: "55%",
		backgroundColor: "#fff",
		fontSize: "large",
	};

	const onGroupSelectChanged = (value: number) => {
		setSelectedGroup(groups.find((gr) => gr.id === value));
		setSelectedSubject(undefined);
	};

	const onSubjectSelectChanged = (value: number) => {
		setSelectedSubject(userCycleSubjects.find((s) => s.id === value));
	};

	const getTitle = (records: any[]) => {
		return (
			<Row>
				<Typography.Text strong>
					{selectedGroup.company} рота, {selectedGroup.platoon} взвод, ВОС{" "}
					{selectedGroup.mrs.number}
				</Typography.Text>
			</Row>
		);
	};

	return (
		<div>
			<Row justify="center">
				<Descriptions style={{ minWidth: "50%" }} bordered>
					<Descriptions.Item
						label="Оберіть групу"
						span={3}
						labelStyle={descriptionItemLabelStyle}
						contentStyle={descriptionItemContentStyle}
						className="fade-in-top"
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
							className="fade-in-top"
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
				</Descriptions>
			</Row>
			<Row justify="center" style={{ marginTop: "1%", marginBottom: "1%" }}>
				{selectedGroup && selectedSubject === undefined && (
					<div style={{ width: "90%" }} className="fade-in-top">
						<GroupTable
							userGroups={selectedGroup}
							title={getTitle}
						></GroupTable>
					</div>
				)}
				{selectedSubject && (
					<div style={{ width: "90%" }} className="fade-in-top">
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
							userId={props.userId}
						></GroupSubjectTable>
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
