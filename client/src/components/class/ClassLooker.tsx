import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import {
	Button,
	Form,
	InputNumber,
	message,
	Radio,
	Row,
	Spin,
	Table,
	Typography,
	DatePicker,
	Input,
	Space,
	Col,
} from "antd";
import { ColumnsType } from "antd/lib/table/interface";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";

import { ConnectionManager } from "../../managers/connetion/connectionManager";
import { ClassEvent } from "../../types/classEvent";
import { Group } from "../../types/group";
import {
	GroupUserPresence,
	UserPresenceType,
} from "../../types/groupUserPresence";
import { RequestCode, RequestMessage, RequestType } from "../../types/requests";
import { Subject } from "../../types/subject";
import Checkbox from "antd/lib/checkbox/Checkbox";
import { IsHasDeactivateGroupUserMark } from "../../helpers/GroupHelper";
import { GroupUser } from "../../types/groupUser";
import { ObjectStatus } from "../../types/constants";
import moment from "moment";
import DatePickerLocal from "antd/es/date-picker/locale/uk_UA";

interface EditableCellProps {
	onChange: (newValue: any) => void;
	value: any;
}

const EditableCell: React.FC<EditableCellProps> = (
	props: EditableCellProps
) => {
	const [counter, setCounter] = useState<number>(props.value);

	const onValuesChange = (value: React.ReactText) => {
		if (value !== undefined && value !== null && value.toString() !== "") {
			console.log("value", value);
			const intValue = parseInt(value.toString());
			if (intValue <= 5 && intValue >= 0) {
				props.onChange(intValue);
				setCounter(intValue);
			}
		}
		if (!value || (value && value.toString().trim() === "")) {
			props.onChange(0);
			setCounter(0);
		}
	};

	return (
		<div>
			<InputNumber
				min={0}
				max={5}
				bordered={false}
				onChange={onValuesChange}
				value={counter}
				style={{ width: "100%" }}
				size="small"
			></InputNumber>
		</div>
	);
};
interface ClassLookerProps {
	class: ClassEvent;
}

interface ClassLookerTableData {
	key: number;
	fullname: string;
	current_mark: number;
	topic_mark: number;
	occupation_mark: number;
	classEvent: ClassEvent;
	presenceData: GroupUserPresence;
	groupUser: GroupUser;
}

export const ClassLooker: React.FC<ClassLookerProps> = (
	props: ClassLookerProps
) => {
	const history = useHistory();
	const [group, setGroup] = useState<Group | undefined>(undefined);
	const [subject, setSubject] = useState<Subject | undefined>(undefined);
	const [rerender, setRerender] = useState<boolean>(false);
	const [classEvent, setClassEvent] = useState<ClassEvent>(props.class);

	useEffect(() => {
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
				setGroup(dataMessage.data[0]);
			}
		);
		ConnectionManager.getInstance().registerResponseOnceHandler(
			RequestType.GET_SUBJECT_BY_ID,
			(data) => {
				const dataMessage = data as RequestMessage<Subject[]>;
				if (
					dataMessage.requestCode === RequestCode.RES_CODE_INTERNAL_ERROR ||
					dataMessage.data.length < 1
				) {
					console.log(`Error: ${dataMessage.requestCode}`);
					return;
				}
				console.log("receive", dataMessage.data);
				setSubject(dataMessage.data[0]);
			}
		);
		ConnectionManager.getInstance().emit(RequestType.GET_GROUP_BY_ID, [
			classEvent.groupId,
		]);

		ConnectionManager.getInstance().emit(RequestType.GET_SUBJECT_BY_ID, [
			classEvent.selectPath.subject,
		]);
	}, []);

	const columns: ColumnsType<any> = [
		{
			title: "ПІБ",
			dataIndex: "fullname",
			key: "fullname",
			sorter: (a: ClassLookerTableData, b: ClassLookerTableData) =>
				a.fullname.localeCompare(b.fullname),
			defaultSortOrder: "ascend",
		},
		{
			title: "Поточна оцінка",
			dataIndex: "current_mark",
			key: "current_mark",
			render: (value, record: ClassLookerTableData) => {
				if (record.groupUser.status === ObjectStatus.NOT_ACTIVE) {
					return record.presenceData.mark.current;
				}

				return (
					<EditableCell
						onChange={(value: any) => {
							record.presenceData.mark.current = value;
						}}
						value={record.presenceData.mark.current}
					></EditableCell>
				);
			},
		},
		{
			title: "Оцінка за тему",
			dataIndex: "topic_mark",
			key: "topic_mark",
			render: (value, record: ClassLookerTableData) => {
				if (record.groupUser.status === ObjectStatus.NOT_ACTIVE) {
					return record.presenceData.mark.topic;
				}

				return (
					<EditableCell
						onChange={(value: any) => {
							record.presenceData.mark.topic = value;
						}}
						value={record.presenceData.mark.topic}
					></EditableCell>
				);
			},
		},
		{
			title: "Підсумкова оцінка за предмет навчання",
			dataIndex: "occupation_mark",
			key: "occupation_mark",
			render: (value, record: ClassLookerTableData) => {
				if (record.groupUser.status === ObjectStatus.NOT_ACTIVE) {
					return record.presenceData.mark.subject;
				}

				return (
					<EditableCell
						onChange={(value: any) => {
							record.presenceData.mark.subject = value;
						}}
						value={record.presenceData.mark.subject}
					></EditableCell>
				);
			},
		},
		{
			title: "Наряд",
			dataIndex: "outfit",
			key: "outfit",
			render: (value, record: ClassLookerTableData) => {
				return (
					<Checkbox
						checked={record.presenceData.type === UserPresenceType.OUTFIT}
						onClick={() => {
							if (record.presenceData.type === UserPresenceType.OUTFIT) {
								record.presenceData.type = UserPresenceType.PRESENCE;
							} else {
								record.presenceData.type = UserPresenceType.OUTFIT;
							}
							setRerender(!rerender);
						}}
						disabled={record.groupUser.status === ObjectStatus.NOT_ACTIVE}
					></Checkbox>
				);
			},
		},
		{
			title: "Відпустка",
			dataIndex: "vacation",
			key: "vacation",
			render: (value, record) => {
				return (
					<Checkbox
						checked={record.presenceData.type === UserPresenceType.VACATION}
						onClick={() => {
							if (record.presenceData.type === UserPresenceType.VACATION) {
								record.presenceData.type = UserPresenceType.PRESENCE;
							} else {
								record.presenceData.type = UserPresenceType.VACATION;
							}
							setRerender(!rerender);
						}}
						disabled={record.groupUser.status === ObjectStatus.NOT_ACTIVE}
					></Checkbox>
				);
			},
		},
		{
			title: "Відрядження",
			dataIndex: "bussiness_trip",
			key: "bussiness_trip",
			render: (value, record) => {
				return (
					<Checkbox
						checked={
							record.presenceData.type === UserPresenceType.BUSSINESS_TRIP
						}
						onClick={() => {
							if (
								record.presenceData.type === UserPresenceType.BUSSINESS_TRIP
							) {
								record.presenceData.type = UserPresenceType.PRESENCE;
							} else {
								record.presenceData.type = UserPresenceType.BUSSINESS_TRIP;
							}
							setRerender(!rerender);
						}}
						disabled={record.groupUser.status === ObjectStatus.NOT_ACTIVE}
					></Checkbox>
				);
			},
		},
		{
			title: "Хворий",
			dataIndex: "sick",
			key: "sick",
			render: (value, record) => {
				return (
					<Checkbox
						checked={record.presenceData.type === UserPresenceType.SICK}
						onClick={() => {
							if (record.presenceData.type === UserPresenceType.SICK) {
								record.presenceData.type = UserPresenceType.PRESENCE;
							} else {
								record.presenceData.type = UserPresenceType.SICK;
							}
							setRerender(!rerender);
						}}
						disabled={record.groupUser.status === ObjectStatus.NOT_ACTIVE}
					></Checkbox>
				);
			},
		},
		{
			title: "Вихідний",
			dataIndex: "free",
			key: "free",
			render: (value, record) => {
				return (
					<Checkbox
						checked={record.presenceData.type === UserPresenceType.FREE}
						onClick={() => {
							if (record.presenceData.type === UserPresenceType.FREE) {
								record.presenceData.type = UserPresenceType.PRESENCE;
							} else {
								record.presenceData.type = UserPresenceType.FREE;
							}
							setRerender(!rerender);
						}}
						disabled={record.groupUser.status === ObjectStatus.NOT_ACTIVE}
					></Checkbox>
				);
			},
		},
	];

	const findOccupation = () => {
		return subject.programTrainings
			.find((pt) => pt.id === classEvent.selectPath.programTraining)
			.topics.find((t) => t.id === classEvent.selectPath.topic)
			.occupation.find((oc) => oc.id === classEvent.selectPath.occupation);
	};

	const tableTitle = () => {
		return (
			<Col>
				<Row>
					<Space direction="horizontal">
						<Input
							bordered={false}
							value="Заняття:"
							style={{
								width: "80px",
							}}
						></Input>
						<Typography.Text>{findOccupation().title}</Typography.Text>
					</Space>
				</Row>
				<Row>
					<Space direction="horizontal">
						<Input
							bordered={false}
							value="Дата:"
							style={{
								width: "80px",
							}}
						></Input>
						<DatePicker
							onChange={(value) => {
								if (value.isValid()) {
									setClassEvent({ ...classEvent, date: value.toDate() });
								}
							}}
							value={moment(new Date(classEvent.date))}
							locale={DatePickerLocal}
							clearIcon={false}
							format="DD-MM-YYYY"
							style={{
								width: "200px",
							}}
						></DatePicker>
					</Space>
				</Row>
				<Row>
					<Space direction="horizontal">
						<Input
							bordered={false}
							value="Місце:"
							style={{
								width: "80px",
							}}
						></Input>
						<Input
							value={classEvent.place}
							onChange={({ target: { value } }) => {
								setClassEvent({ ...classEvent, place: value });
							}}
							style={{
								width: "200px",
							}}
						></Input>
					</Space>
				</Row>
				<Row>
					<Space direction="horizontal">
						<Input
							bordered={false}
							value="Години:"
							style={{
								width: "80px",
							}}
						></Input>
						<InputNumber
							min={1}
							max={20}
							value={classEvent.hours}
							onChange={function handleHoursChange(value: React.Key) {
								if (value !== undefined && value !== null)
									setClassEvent({
										...classEvent,
										hours: parseInt(value.toString()),
									});
							}}
							style={{
								width: "200px",
							}}
						/>
					</Space>
				</Row>
			</Col>
		);
	};

	if (!group || !subject) {
		return <Spin></Spin>;
	}

	const tableData: ClassLookerTableData[] = classEvent.presences
		// .filter((pr) => {
		// 	const gu = group.users.find((u) => u.id === pr.userId);

		// 	return IsHasDeactivateGroupUserMark(gu, pr);
		// })
		.map((presence) => {
			const gu = group.users.find((u) => u.id === presence.userId);

			return {
				key: presence.id,
				fullname: gu.fullname,
				current_mark: presence.mark.current,
				topic_mark: presence.mark.topic,
				occupation_mark: presence.mark.subject,
				classEvent: classEvent,
				presenceData: presence,
				groupUser: gu,
			};
		});

	const onUpdateClassClick = () => {
		ConnectionManager.getInstance().registerResponseOnceHandler(
			RequestType.UPDATE_CLASS,
			(data) => {
				const dataMessage = data as RequestMessage<ClassEvent>;
				if (dataMessage.requestCode === RequestCode.RES_CODE_INTERNAL_ERROR) {
					console.log(`Error: ${dataMessage.requestCode}`);
					message.success("Сталася помилка! Зверніться до адміністратора!");
					return;
				}

				message.success("Оновлено!");
			}
		);

		ConnectionManager.getInstance().emit(RequestType.UPDATE_CLASS, classEvent);
	};

	return (
		<div className="swing-in-top-fwd">
			<Table
				pagination={false}
				bordered
				direction="rtl"
				columns={columns}
				dataSource={tableData}
				title={tableTitle}
				rowClassName={(record: ClassLookerTableData, index) => {
					if (record.groupUser.status === ObjectStatus.NOT_ACTIVE)
						return "row_grou-user_deactivate";

					return "";
				}}
			></Table>
			<Button
				type="primary"
				onClick={onUpdateClassClick}
				style={{ margin: "5px" }}
			>
				Зберегти зміни
			</Button>
		</div>
	);
};
