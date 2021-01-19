import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import {
	Button,
	Form,
	InputNumber,
	message,
	Spin,
	Table,
	Tag,
	Typography,
	Affix,
} from "antd";
import { ColumnsType } from "antd/lib/table/interface";
import React, { useEffect, useState, useRef } from "react";

import { ConnectionManager } from "../../managers/connetion/connectionManager";
import { Group } from "../../types/group";
import { GroupUser } from "../../types/groupUser";
import { Norm } from "../../types/norm";
import { NormMark } from "../../types/normMark";
import { NormProcess } from "../../types/normProcess";
import { RequestCode, RequestMessage, RequestType } from "../../types/requests";

import "../../../node_modules/hover.css/css/hover.css";
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

	const colorByMark = (mark: number) => {
		if (mark === 5) return "#87d068";
		if (mark === 4) return "#108ee9";
		if (mark === 3) return "#2db7f5";
		if (mark === 2) return "#f50";
		if (mark === 1) return "#cd201f";
		return "default";
	};

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
				<div onClick={() => setEditing(true)}>
					<Tag color={colorByMark(form.getFieldValue("note"))}>
						{form.getFieldValue("note")}
					</Tag>
				</div>
			)}
		</div>
	);
};

export interface NormGroupProcessShowerProps {
	group: Group;
	date: Date;
	rerender?: boolean;
}

interface NormGroupProcessShowerTableData {
	groupUser: GroupUser;
	key: number;
	process: NormProcess;
}

export const NormGroupProcessShower: React.FC<NormGroupProcessShowerProps> = (
	props: NormGroupProcessShowerProps
) => {
	const [norms, setNorms] = useState<Norm[]>([]);
	const [normProcess, setNormProcess] = useState<NormProcess | undefined>(
		undefined
	);
	const [subjects, setSubjects] = useState<Subject[]>([]);

	const buttonUpdateRef = useRef(null);

	const loadAllNorms = () => {
		ConnectionManager.getInstance().registerResponseOnceHandler(
			RequestType.GET_SUBJECT_BY_ID,
			(data) => {
				const dataMessage = data as RequestMessage<Subject[]>;
				if (dataMessage.requestCode === RequestCode.RES_CODE_INTERNAL_ERROR) {
					console.log(`Error: ${dataMessage.requestCode}`);
					return;
				}
				setSubjects(dataMessage.data);
			}
		);
		ConnectionManager.getInstance().registerResponseOnceHandler(
			RequestType.GET_NORMS,
			(data) => {
				const dataMessage = data as RequestMessage<Norm[]>;
				if (dataMessage.requestCode === RequestCode.RES_CODE_INTERNAL_ERROR) {
					console.log(`Error: ${dataMessage.requestCode}`);
					return;
				}
				dataMessage.data = dataMessage.data.sort((a, b) => a.number - b.number);
				setNorms(dataMessage.data);
				loadNormProcess(dataMessage.data);

				ConnectionManager.getInstance().emit(
					RequestType.GET_SUBJECT_BY_ID,
					dataMessage.data
						.map((n) => n.subjectId)
						.filter((value, index, self) => self.indexOf(value) === index)
				);
			}
		);
		ConnectionManager.getInstance().emit(RequestType.GET_NORMS, {});
	};

	const concatNormMarksWithEmpty = (
		marks: NormMark[],
		process: NormProcess,
		inputNorms: Norm[]
	) => {
		const result: NormMark[] = [];
		for (let gu of props.group.users) {
			// const found = marks.find((m) => m.userId === gu.id);
			for (let norm of inputNorms) {
				const found = marks.find(
					(m) => m.userId === gu.id && m.normId === norm.id
				);
				if (found !== undefined) {
					result.push(found);
				} else {
					result.push({
						id: Math.floor(Math.random() * (1000000 - 100000) + 1),
						mark: 0,
						normId: norm.id,
						processId: process.id,
						userId: gu.id,
					});
				}
			}
		}
		return result;
	};

	const loadNormProcess = (inputNorms: Norm[]) => {
		ConnectionManager.getInstance().registerResponseOnceHandler(
			RequestType.GET_NORM_PROCESS_BY_DATE_AND_GROUP,
			(data) => {
				const dataMessage = data as RequestMessage<NormProcess>;
				if (dataMessage.requestCode === RequestCode.RES_CODE_INTERNAL_ERROR) {
					console.log(`Error: ${dataMessage.requestCode}`);
					return;
				}

				dataMessage.data.marks = concatNormMarksWithEmpty(
					dataMessage.data.marks,
					dataMessage.data,
					inputNorms
				);
				console.log("recieve norm process", dataMessage.data);
				setNormProcess(dataMessage.data);
			}
		);
		ConnectionManager.getInstance().emit(
			RequestType.GET_NORM_PROCESS_BY_DATE_AND_GROUP,
			{ gr: props.group, date: props.date }
		);
	};

	const onUpdateProcessClick = () => {
		ConnectionManager.getInstance().registerResponseOnceHandler(
			RequestType.UPDATE_NORM_PROCESS,
			(data) => {
				const dataMessage = data as RequestMessage<any>;
				if (dataMessage.requestCode === RequestCode.RES_CODE_INTERNAL_ERROR) {
					console.log(`Error: ${dataMessage.requestCode}`);

					message.success("Сталася помилка! Зверніться до адміністратора!");
					return;
				}

				message.success("Оновлено");

				loadAllNorms();
			}
		);

		ConnectionManager.getInstance().emit(RequestType.UPDATE_NORM_PROCESS, {
			...normProcess,
			marks: normProcess.marks.filter((mark) => mark.mark !== 0),
		});
		console.log(
			"send to update",
			normProcess.marks.filter((mark) => mark.mark !== 0)
		);
	};

	useEffect(() => {
		setNorms([]);
		setNormProcess(undefined);
		loadAllNorms();
	}, [props.rerender]);

	useEffect(() => {
		setNorms([]);
		setNormProcess(undefined);
		loadAllNorms();
	}, [props.date]);

	if (norms.length < 1 || normProcess === undefined) {
		return <Spin></Spin>;
	}

	const columns: ColumnsType<any> = [
		{
			key: "fullname",
			title: "Прізвище",
			dataIndex: "fullname",
			render: (value, record: NormGroupProcessShowerTableData) => {
				return <div style={{ width: "auto" }}>{record.groupUser.fullname}</div>;
			},
			sorter: (
				a: NormGroupProcessShowerTableData,
				b: NormGroupProcessShowerTableData
			) => (a.groupUser.fullname < b.groupUser.fullname ? -1 : 1),
			defaultSortOrder: "ascend",
			fixed: "left",
			width: "max-content",
			ellipsis: true,
		},
		...norms.map<any>((norm) => ({
			key: norm.id,
			dataIndex: norm.id,
			title: (
				<div>
					<Typography.Title level={4} style={{ margin: 0 }}>
						№ {norm.number}{" "}
						{subjects.find((s) => s.id === norm.subjectId)?.shortTitle}
					</Typography.Title>
				</div>
			),
			render: (value: any, record: NormGroupProcessShowerTableData) => {
				const foundMark = record.process.marks.find(
					(mark) =>
						mark.normId === norm.id && mark.userId === record.groupUser.id
				);
				if (!foundMark) return <div>Не заватажилось</div>;
				return (
					<EditableCell
						editComponent={<InputNumber min={0} max={5}></InputNumber>}
						value={foundMark.mark}
						onSave={(value: number) => {
							foundMark.mark = value;
							buttonUpdateRef.current.focus();
							setNormProcess({
								...normProcess,
								marks: [
									...normProcess.marks.filter((m) => m.id !== foundMark.id),
									foundMark,
								],
							});
						}}
					></EditableCell>
				);
			},
		})),
	];

	const tableData: NormGroupProcessShowerTableData[] = props.group.users.map(
		(user) => {
			return {
				groupUser: user,
				key:
					new Date(normProcess.date).getMilliseconds() +
					user.id +
					props.group.id,
				process: normProcess,
			};
		}
	);
	return (
		<div>
			<Table
				columns={columns}
				dataSource={tableData}
				bordered
				pagination={false}
				scroll={{ x: "max-content" }}
				size="small"
			></Table>
			<Affix offsetBottom={10}>
				<Button
					type="primary"
					onClick={onUpdateProcessClick}
					className="hvr-buzz-out"
					onAnimationEnd={(event) => {
						console.log("target anim", event.currentTarget);
					}}
					ref={buttonUpdateRef}
				>
					ОНОВИТИ ЗМІНИ ЗА ОБРАНУ ДАТУ
				</Button>
			</Affix>
		</div>
	);
};
