import "../../../node_modules/hover.css/css/hover.css";

import { Descriptions, Row, Select, Typography } from "antd";
import React, { useContext, useEffect, useState } from "react";

import { YearContext } from "../../context/YearContext";
import { GenerateGroupName } from "../../helpers/GroupHelper";
import { ConnectionManager } from "../../managers/connetion/connectionManager";
import { ClassEvent } from "../../types/classEvent";
import { Group } from "../../types/group";
import { Norm } from "../../types/norm";
import { NormProcess } from "../../types/normProcess";
import { RequestCode, RequestMessage, RequestType } from "../../types/requests";
import { Subject } from "../../types/subject";
import { GroupNormTable } from "../group/GroupNormTable";
import { GroupTable } from "../group/GroupTable";
import { NormInfoDrawer } from "../norm/NormInfoDrawer";

export interface TeacherGroupNormListProps {
	userId: number;
}

interface TeacherGroupListData {
	classEvent: ClassEvent;
	group: Group;
}

export const TeacherGroupNormList: React.FC<TeacherGroupNormListProps> = (
	props: TeacherGroupNormListProps
) => {
	const yearContext = useContext(YearContext);
	const [, setNormProcesses] = useState<NormProcess[]>([]);
	const [groups, setGroups] = useState<Group[]>([]);
	const [selectedGroup, setSelectedGroup] = useState<Group | undefined>(
		undefined
	);
	const [userCycleSubjects, setUserCycleSubjects] = useState<Subject[]>([]);
	const [, setUserCycleNorms] = useState<Norm[]>([]);
	const [normInfoDrawerVisible, setNormInfoDrawerVisible] = useState<boolean>(
		false
	);

	const [selectedSubject, setSelectedSubject] = useState<Subject | undefined>(
		undefined
	);
	const [reloadTable, setReloadTable] = useState<boolean>(false);

	useEffect(() => {
		ConnectionManager.getInstance().registerResponseOnceHandler(
			RequestType.GET_NORM_PROCESS_BY_USER,
			(data) => {
				const dataMessage = data as RequestMessage<NormProcess[]>;
				if (dataMessage.requestCode === RequestCode.RES_CODE_INTERNAL_ERROR) {
					console.log(`Error: ${dataMessage.requestCode}`);
					return;
				}
				console.log("recieve norm process by user", dataMessage.data);

				setNormProcesses(dataMessage.data);

				ConnectionManager.getInstance().emit(
					RequestType.GET_GROUP_BY_ID,
					dataMessage.data
						.map((np) => np.group.id)
						.filter((value, index, self) => self.indexOf(value) === index)
				);
			}
		);

		ConnectionManager.getInstance().registerResponseOnceHandler(
			RequestType.GET_GROUP_BY_ID,
			(data: any) => {
				const dataMessage = data as RequestMessage<Group[]>;
				if (dataMessage.requestCode === RequestCode.RES_CODE_INTERNAL_ERROR) {
					console.log(`Error: ${dataMessage.requestCode}`);
					return;
				}
				console.log("recieve groups", dataMessage.data);

				setGroups([...dataMessage.data]);
			}
		);

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
					console.log(
						`Error: ${RequestType.GET_NORMS_BY_USER_CYCLE} ${dataMessage.requestCode} ${dataMessage.messageInfo}`
					);
					return;
				}
				setUserCycleNorms(dataMessage.data);
			}
		);

		ConnectionManager.getInstance().emit(RequestType.GET_NORMS_BY_USER_CYCLE, {
			userId: props.userId,
			year: yearContext.year,
		}); //TODO Add year to request
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
		setReloadTable(!reloadTable);
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
					{/* {selectedGroup && selectedSubject && (
						<Descriptions.Item
							label="Відобразити нормативи"
							span={3}
							labelStyle={descriptionItemLabelStyle}
							contentStyle={descriptionItemContentStyle}
							className="fade-in-top"
						>
							<div>
								<Button
									type={"default"}
									onClick={() => {
										setNormInfoDrawerVisible(true);
									}}
									style={{ width: "100%", height: "100%" }}
									icon={<OrderedListOutlined></OrderedListOutlined>}
									hidden={!isYearCurrent(yearContext)}
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
					)} */}
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

				{selectedGroup !== undefined && selectedSubject !== undefined && (
					<div style={{ width: "90%" }} className="fade-in-top">
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
							reload={reloadTable}
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
