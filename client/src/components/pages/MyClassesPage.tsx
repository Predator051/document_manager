import { Button, PageHeader, Row, Spin, Table } from "antd";
import { ColumnsType } from "antd/lib/table/interface";
import React, { useEffect, useState, useContext } from "react";
import { useHistory } from "react-router-dom";
import { GenerateGroupName } from "../../helpers/GroupHelper";
import { ConnectionManager } from "../../managers/connetion/connectionManager";
import { ClassEvent } from "../../types/classEvent";
import { Group } from "../../types/group";
import { RequestCode, RequestMessage, RequestType } from "../../types/requests";
import { Subject } from "../../types/subject";
import { SubjectSelectPath } from "../../types/subjectSelectPath";
import { HREFS } from "../menu/Menu";
import { BackPage } from "../ui/BackPage";
import { YearContext } from "../../context/YearContext";

interface MyClassTableData {
	key: number;
	data: ClassEvent;
}

export const MyClassesPage: React.FC = () => {
	const history = useHistory();
	const [classEvents, setClassEvents] = useState<ClassEvent[]>([]);
	const [subjects, setSubjects] = useState<Subject[]>([]);
	const [groups, setGroups] = useState<Group[]>([]);
	const yearContext = useContext(YearContext);

	useEffect(() => {
		ConnectionManager.getInstance().registerResponseOnceHandler(
			RequestType.GET_MY_CLASSES,
			(data) => {
				const dataMessage = data as RequestMessage<ClassEvent[]>;
				if (dataMessage.requestCode === RequestCode.RES_CODE_INTERNAL_ERROR) {
					console.log(`Error: ${dataMessage.requestCode}`);
					return;
				}
				console.log("receive", dataMessage.data);
				dataMessage.data.forEach(
					(classEvent) => (classEvent.date = new Date(classEvent.date))
				);
				setClassEvents(dataMessage.data);

				ConnectionManager.getInstance().emit(
					RequestType.GET_SUBJECT_BY_ID,
					dataMessage.data
						.map((ce) => ce.selectPath.subject)
						.filter((value, index, self) => self.indexOf(value) === index)
				);
				ConnectionManager.getInstance().emit(
					RequestType.GET_GROUP_BY_ID,
					dataMessage.data
						.map((ce) => ce.groupId)
						.filter((value, index, self) => self.indexOf(value) === index)
				);
			}
		);
		ConnectionManager.getInstance().registerResponseOnceHandler(
			RequestType.GET_SUBJECT_BY_ID,
			(data) => {
				const dataMessage = data as RequestMessage<Subject[]>;
				if (dataMessage.requestCode === RequestCode.RES_CODE_INTERNAL_ERROR) {
					console.log(`Error: ${dataMessage.requestCode}`);
					return;
				}
				console.log("receive", dataMessage.data);

				setSubjects(dataMessage.data);
			}
		);
		ConnectionManager.getInstance().registerResponseOnceHandler(
			RequestType.GET_GROUP_BY_ID,
			(data) => {
				const dataMessage = data as RequestMessage<Group[]>;
				if (
					dataMessage.requestCode === RequestCode.RES_CODE_INTERNAL_ERROR &&
					dataMessage.data.length < 1
				) {
					console.log(`Error: ${dataMessage.requestCode}`);
					return;
				}
				console.log("receive", dataMessage.data);

				setGroups(dataMessage.data);
			}
		);
		ConnectionManager.getInstance().emit(RequestType.GET_MY_CLASSES, {
			year: yearContext.year,
		});
	}, []);

	if (subjects.length < 1 || classEvents.length < 1 || groups.length < 1) {
		return (
			<div>
				<BackPage></BackPage>
				<Spin></Spin>
			</div>
		);
	}

	const onShowClassClick = (classEvent: ClassEvent) => {
		history.push(HREFS.SHOW_CLASS + classEvent.id.toString());
	};

	const tableColumns: ColumnsType<any> = [
		{
			title: "Назва",
			dataIndex: "title",
			key: "title",
			render: (value: any, record: MyClassTableData) => {
				return <div>{findOccupation(record.data.selectPath).title}</div>;
			},
		},
		{
			title: "Предмет",
			dataIndex: "subject",
			key: "subject",
			render: (value: any, record: MyClassTableData) => {
				return (
					<div>
						{
							subjects.find((s) => s.id === record.data.selectPath.subject)
								.fullTitle
						}
					</div>
				);
			},
			filters: subjects.map((sb) => ({
				text: sb.fullTitle,
				value: sb.id,
			})),
			onFilter: (value, record: MyClassTableData) =>
				record.data.selectPath.subject === value,
			filterMultiple: true,
		},
		{
			title: "Група",
			dataIndex: "group",
			key: "group",
			render: (value: any, record: MyClassTableData) => {
				return (
					<div>
						{GenerateGroupName(
							groups.find((gr) => gr.id === record.data.groupId)
						)}
					</div>
				);
			},
			filters: groups.map((gr) => ({
				text: GenerateGroupName(gr),
				value: gr.id,
			})),
			onFilter: (value, record: MyClassTableData) =>
				record.data.groupId === value,
			filterMultiple: true,
		},
		{
			title: "Дата",
			dataIndex: "date",
			key: "date",
			render: (value: any, record: MyClassTableData) => {
				return (
					<div>
						{record.data.date.toLocaleDateString("uk", {
							year: "numeric",
							month: "2-digit",
							day: "2-digit",
						})}
					</div>
				);
			},
			filters: classEvents
				.map((ce) => ce.date)
				.filter((value, index, self) => {
					return (
						self.findIndex(
							(d) =>
								d.getFullYear() === value.getFullYear() &&
								d.getMonth() === value.getMonth() &&
								d.getDate() === value.getDate()
						) === index
					);
				})
				.map((date) => ({
					text: date.toLocaleDateString("uk", {
						year: "numeric",
						month: "2-digit",
						day: "2-digit",
					}),
					value: date.toString(),
				})),
			onFilter: (value, record: MyClassTableData) => {
				const valueDate = new Date(value as string);
				return (
					record.data.date.getFullYear() === valueDate.getFullYear() &&
					record.data.date.getMonth() === valueDate.getMonth() &&
					record.data.date.getDate() === valueDate.getDate()
				);
			},
			filterMultiple: true,
			sorter: (a: MyClassTableData, b: MyClassTableData) =>
				a.data.date < b.data.date ? -1 : 1,
		},
		{
			title: "Дії",
			dataIndex: "action",
			key: "action",
			render: (value: any, record: MyClassTableData) => {
				return (
					<div>
						<Button
							type="link"
							onClick={onShowClassClick.bind(null, record.data)}
						>
							Переглянути
						</Button>
					</div>
				);
			},
		},
	];

	const findOccupation = (selectPath: SubjectSelectPath) => {
		const subject = subjects.find((s) => s.id === selectPath.subject);

		return subject.programTrainings
			.find((pt) => pt.id === selectPath.programTraining)
			.topics.find((t) => t.id === selectPath.topic)
			.occupation.find((oc) => oc.id === selectPath.occupation);
	};

	const tableData: MyClassTableData[] = classEvents.map((ce) => {
		return {
			data: ce,
			key: ce.id,
		};
	});

	return (
		<div className="swing-in-top-fwd">
			<BackPage></BackPage>
			<Row justify={"center"}>
				<Table
					columns={tableColumns}
					dataSource={tableData}
					style={{ width: "50%" }}
					pagination={false}
					size={"small"}
				></Table>
			</Row>
		</div>
	);
};
