import React, { useState, useEffect } from "react";
import { Table, Input, Button, Form, Col, Row } from "antd";
import { ColumnsType } from "antd/lib/table/interface";
import {
	CheckOutlined,
	CloseOutlined,
	PlusOutlined,
	RightOutlined,
} from "@ant-design/icons";
import moment from "moment";
import { Subject } from "../../../types/subject";
import { SubjectTrainingProgram } from "../../../types/subjectTrainingProgram";
import { SubjectTopic } from "../../../types/subjectTopic";
import { SubjectTopicOccupation } from "../../../types/subjectTopicOccupation";

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
		if (moment.isMoment(props.value) || props.value instanceof Date) {
			const mom = moment(props.value);
			form.setFieldsValue({ note: mom });
		} else {
			form.setFieldsValue({ note: props.value });
		}
		setOldValue(props.value);
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
				<div onClick={() => setEditing(true)}>{form.getFieldValue("note")}</div>
			)}
		</div>
	);
};

interface TrainingProgramTableData {
	record: SubjectTrainingProgram;
	key: number;
}

interface TopicTableData {
	record: SubjectTopic;
	key: string;
}

interface OccupationTableData {
	record: SubjectTopicOccupation;
	key: string;
}

export interface SubjectEditableTableProps {
	onSubjectChange: (subj: Subject) => void;
}

export const SubjectEditableTable: React.FC<SubjectEditableTableProps> = (
	props: SubjectEditableTableProps
) => {
	const [subjectTrainingProgram, setSubjectTrainingProgram] = useState<
		SubjectTrainingProgram[]
	>([]);
	const [currentTrainingProgram, setCurrentTrainingProgram] = useState<number>(
		0
	);
	const [currentTopic, setCurrentTopic] = useState<number>(0);

	const onTrainingProgramClick = (tp: SubjectTrainingProgram) => {
		setCurrentTrainingProgram(tp.id);
		setCurrentTopic(0);
	};

	const onTopicClick = (topic: SubjectTopic) => {
		setCurrentTopic(topic.id);
	};

	const getCurrentTrainingProgram = () => {
		return subjectTrainingProgram.find(
			(stp) => stp.id === currentTrainingProgram
		);
	};

	const getCurrentTopic = () => {
		return getCurrentTrainingProgram().topics.find(
			(topic) => topic.id === currentTopic
		);
	};

	const columnTrainingProgram: ColumnsType<TrainingProgramTableData> = [
		{
			title: "Программи підготовки",
			dataIndex: "trainingPrograms",
			key: "trainingPrograms",
			defaultSortOrder: "ascend",
			sorter: (a: TrainingProgramTableData, b: TrainingProgramTableData) =>
				a.record.id - b.record.id,
			render: (current: any, { record }: TrainingProgramTableData) => {
				return (
					<div>
						<EditableCell
							editComponent={<Input></Input>}
							value={record.title}
							onSave={(value) => (record.title = value)}
						></EditableCell>
					</div>
				);
			},
		},
		{
			title: "",
			dataIndex: "action",
			key: "action",
			render: (current: any, { key, record }: any) => {
				return (
					<Button
						onClick={() => {
							onTrainingProgramClick(record);
						}}
						icon={<RightOutlined></RightOutlined>}
					></Button>
				);
			},
		},
	];
	const columnsTopic = [
		{
			title: "№",
			dataIndex: "number",
			key: "number",
			render: (current: any, { key, record }: any) => {
				return record.number;
			},
			sorter: (a: TopicTableData, b: TopicTableData) =>
				a.record.number - b.record.number,
		},
		{
			title: "Теми",
			dataIndex: "topic",
			key: "topic",
			shouldCellUpdate: (record: any, prevRecord: any) => {
				return true;
			},
			render: (current: any, { key, record }: any) => {
				console.log("render topic table", record);

				return (
					<div>
						<EditableCell
							editComponent={<Input></Input>}
							value={record.title}
							onSave={(value) => (record.title = value)}
						></EditableCell>
					</div>
				);
			},
			ellipsis: true,
		},
		{
			title: "",
			dataIndex: "action",
			key: "action",
			render: (current: any, { key, record }: any) => {
				return (
					<Button
						onClick={() => {
							onTopicClick(record);
						}}
						icon={<RightOutlined></RightOutlined>}
					></Button>
				);
			},
		},
	];
	const columnsTopicOccupation = [
		{
			title: "№",
			dataIndex: "number",
			key: "number",
			render: (current: any, { record }: OccupationTableData) => {
				return record.number;
			},
			sorter: (a: OccupationTableData, b: OccupationTableData) =>
				a.record.number - b.record.number,
			ellipsis: true,
		},
		{
			title: "Заняття",
			dataIndex: "occupation",
			key: "occupation",
			render: (current: any, { record }: OccupationTableData) => {
				return record.title;
			},
		},
	];

	const addTrainingProgramClick = () => {
		setSubjectTrainingProgram([
			...subjectTrainingProgram,
			{
				id: Date.now(),
				title: "ПУСТО",
				topics: [],
			},
		]);
	};

	const addTopicClick = () => {
		const currNumber = getCurrentTrainingProgram().topics.reduce(
			(prev, curr) => (prev > curr.number ? prev : curr.number),
			0
		);

		const newTopic: SubjectTopic = {
			id: Date.now(),
			number: currNumber + 1,
			occupation: [],
			title: "ПУСТО",
		};

		if (currentTrainingProgram) {
			const original = subjectTrainingProgram.find(
				(stp) => stp.id === currentTrainingProgram
			);
			if (original) {
				original.topics.push(newTopic);
				setSubjectTrainingProgram([
					...subjectTrainingProgram.filter((stp) => stp.id !== original.id),
					original,
				]);

				setCurrentTrainingProgram(original.id);
			}
		}
	};

	const addOccupationClick = () => {
		if (currentTopic !== 0 && currentTrainingProgram !== 0) {
			const originalTopic = getCurrentTopic();
			const currNumber = originalTopic.occupation.reduce(
				(prev, curr) => (prev > curr.number ? prev : curr.number),
				0
			);
			const newOccupation: SubjectTopicOccupation = {
				id: Date.now(),
				number: currNumber + 1,
				title: "ПУСТО",
			};

			originalTopic.occupation.push(newOccupation);
			const originalStp = getCurrentTrainingProgram();
			setSubjectTrainingProgram([
				...subjectTrainingProgram.filter((stp) => stp.id !== originalStp.id),
				originalStp,
			]);
			setCurrentTopic(originalTopic.id);
		}
	};

	const programs: TrainingProgramTableData[] = subjectTrainingProgram.map(
		(stp) => ({
			key: stp.id,
			record: stp,
		})
	);

	const topics: TopicTableData[] =
		currentTrainingProgram !== 0
			? getCurrentTrainingProgram().topics.map((t) => ({
					key: t.id + t.title + t.number,
					record: t,
			  }))
			: [];

	const occupations: OccupationTableData[] =
		currentTrainingProgram !== 0 && currentTopic !== 0
			? getCurrentTopic().occupation.map((oc) => ({
					key: oc.id + oc.title + oc.number,
					record: oc,
			  }))
			: [];

	return (
		<div style={{ width: "100%" }}>
			<Row justify="center" style={{ width: "100%" }}>
				<Col flex="33%" style={{ overflow: "auto", width: "100px" }}>
					<Table
						pagination={false}
						dataSource={programs}
						columns={columnTrainingProgram}
						size="middle"
						bordered
					></Table>
					<Button
						icon={<PlusOutlined></PlusOutlined>}
						style={{ marginTop: "5px" }}
						onClick={addTrainingProgramClick}
					></Button>
					<Button
						onClick={() => {
							console.log(subjectTrainingProgram);
						}}
					>
						Check
					</Button>
				</Col>
				<Col flex="33%" style={{ overflow: "auto", width: "100px" }}>
					<div>
						<Table
							pagination={false}
							// rowKey={(gu: SubjectTopic) => gu.id}
							dataSource={topics}
							columns={columnsTopic}
							size="middle"
							bordered
						></Table>
						<Button
							icon={<PlusOutlined></PlusOutlined>}
							style={{ marginTop: "5px" }}
							onClick={addTopicClick}
							disabled={!currentTrainingProgram}
						></Button>
					</div>
				</Col>
				<Col flex="33%" style={{ overflow: "auto", width: "100px" }}>
					<Table
						pagination={false}
						dataSource={occupations}
						columns={columnsTopicOccupation}
						size="middle"
						bordered
					></Table>
					<Button
						icon={<PlusOutlined></PlusOutlined>}
						style={{ marginTop: "5px" }}
						disabled={!currentTopic}
						onClick={addOccupationClick}
					></Button>
				</Col>
			</Row>
		</div>
	);
};
