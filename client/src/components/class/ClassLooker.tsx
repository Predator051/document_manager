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

interface EditableCellProps {
	onSave: (newValue: any) => void;
	editComponent: JSX.Element;
	value: any;
}

const EditableCell: React.FC<EditableCellProps> = (
	props: EditableCellProps
) => {
	const [editing, setEditing] = useState<boolean>(false);
	const [form] = Form.useForm();
	const [oldValue, setOldValue] = useState<typeof props.value>();

	const layout = {
		labelCol: { span: 0 },
		wrapperCol: { span: 0 },
	};
	const tailLayout = {
		wrapperCol: { offset: 0, span: 0 },
	};
	const onFinish = (values: any) => {
		props.onSave(values.note);
		setOldValue(values.note);
		setEditing(false);
	};

	const onCancel = () => {
		form.setFieldsValue({ note: oldValue });
		setEditing(false);
	};

	useEffect(() => {
		setOldValue(props.value);
		form.setFieldsValue({ note: props.value });
	}, []);

	return (
		<div>
			{editing ? (
				<Form
					{...layout}
					form={form}
					name="control-hooks"
					onFinish={onFinish}
					size="small"
					layout="inline"
				>
					<Form.Item name="note">{props.editComponent}</Form.Item>
					<Form.Item {...tailLayout}>
						<Button
							// type="primary"
							htmlType="submit"
							icon={<CheckOutlined />}
						></Button>
						<Button
							htmlType="button"
							icon={<CloseOutlined />}
							danger
							onClick={onCancel}
						></Button>
					</Form.Item>
				</Form>
			) : (
				<div style={{ width: "100%" }} onClick={() => setEditing(true)}>
					{form.getFieldValue("note")}
				</div>
			)}
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
}

export const ClassLooker: React.FC<ClassLookerProps> = (
	props: ClassLookerProps
) => {
	const history = useHistory();
	const [group, setGroup] = useState<Group | undefined>(undefined);
	const [subject, setSubject] = useState<Subject | undefined>(undefined);
	const [rerender, setRerender] = useState<boolean>(false);

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
			props.class.groupId,
		]);

		ConnectionManager.getInstance().emit(RequestType.GET_SUBJECT_BY_ID, [
			props.class.selectPath.subject,
		]);
	}, []);

	const columns: ColumnsType<any> = [
		{
			title: "ПІБ",
			dataIndex: "fullname",
			key: "fullname",
		},
		{
			title: "Поточна оцінка",
			dataIndex: "current_mark",
			key: "current_mark",
			render: (value, record: ClassLookerTableData) => {
				return (
					<EditableCell
						editComponent={<InputNumber></InputNumber>}
						onSave={(value: any) => {
							record.presenceData.mark.current = value;
						}}
						value={record.presenceData.mark.current}
					></EditableCell>
				);
			},
		},
		{
			title: "Залік або оцінка за предмет навчання",
			dataIndex: "topic_mark",
			key: "topic_mark",
			render: (value, record: ClassLookerTableData) => {
				return (
					<EditableCell
						editComponent={<InputNumber></InputNumber>}
						onSave={(value: any) => {
							record.presenceData.mark.topic = value;
						}}
						value={record.presenceData.mark.topic}
					></EditableCell>
				);
			},
		},
		{
			title: "Ітогова оцінка за предмет навчання",
			dataIndex: "occupation_mark",
			key: "occupation_mark",
			render: (value, record: ClassLookerTableData) => {
				return (
					<EditableCell
						editComponent={<InputNumber></InputNumber>}
						onSave={(value: any) => {
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
					<Radio
						checked={record.presenceData.type === UserPresenceType.OUTFIT}
						onClick={() => {
							record.presenceData.type = UserPresenceType.OUTFIT;
							setRerender(!rerender);
						}}
					></Radio>
				);
			},
		},
		{
			title: "Відпустка",
			dataIndex: "vacation",
			key: "vacation",
			render: (value, record) => {
				return (
					<Radio
						checked={record.presenceData.type === UserPresenceType.VACATION}
						onClick={() => {
							record.presenceData.type = UserPresenceType.VACATION;
							setRerender(!rerender);
						}}
					></Radio>
				);
			},
		},
		{
			title: "Відрядження",
			dataIndex: "bussiness_trip",
			key: "bussiness_trip",
			render: (value, record) => {
				return (
					<Radio
						checked={
							record.presenceData.type === UserPresenceType.BUSSINESS_TRIP
						}
						onClick={() => {
							record.presenceData.type = UserPresenceType.BUSSINESS_TRIP;
							setRerender(!rerender);
						}}
					></Radio>
				);
			},
		},
		{
			title: "Хворий",
			dataIndex: "sick",
			key: "sick",
			render: (value, record) => {
				return (
					<Radio
						checked={record.presenceData.type === UserPresenceType.SICK}
						onClick={() => {
							record.presenceData.type = UserPresenceType.SICK;
							setRerender(!rerender);
						}}
					></Radio>
				);
			},
		},
	];

	const findOccupation = () => {
		return subject.programTrainings
			.find((pt) => pt.id === props.class.selectPath.programTraining)
			.topics.find((t) => t.id === props.class.selectPath.topic)
			.occupation.find((oc) => oc.id === props.class.selectPath.occupation);
	};

	const tableTitle = () => {
		return (
			<div>
				<Row>
					<Typography.Text underline strong>
						Заняття
					</Typography.Text>
					<Typography.Text>
						{": "}
						{findOccupation().title}
					</Typography.Text>
				</Row>
				<Row>
					<Typography.Text underline strong>
						{"Дата"}
					</Typography.Text>
					<Typography.Text>
						{": " +
							new Date(props.class.date).toLocaleDateString("uk", {
								year: "numeric",
								month: "2-digit",
								day: "2-digit",
							})}
					</Typography.Text>
				</Row>
				<Row>
					<Typography.Text underline strong>
						{"Місце"}
					</Typography.Text>
					<Typography.Text>
						{": "}
						{props.class.place}
					</Typography.Text>
				</Row>
			</div>
		);
	};

	if (!group || !subject) {
		return <Spin></Spin>;
	}

	const tableData: ClassLookerTableData[] = props.class.presences.map(
		(presence) => {
			return {
				key: presence.id,
				fullname: group.users.find((u) => u.id === presence.userId).fullname,
				current_mark: presence.mark.current,
				topic_mark: presence.mark.topic,
				occupation_mark: presence.mark.subject,
				classEvent: props.class,
				presenceData: presence,
			};
		}
	);

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

		ConnectionManager.getInstance().emit(RequestType.UPDATE_CLASS, props.class);
	};

	return (
		<div>
			<Table
				pagination={false}
				bordered
				direction="rtl"
				columns={columns}
				dataSource={tableData}
				title={tableTitle}
			></Table>
			<Button type="primary" onClick={onUpdateClassClick}>
				Зберегти зміни
			</Button>
		</div>
	);
};
