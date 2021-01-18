import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { Button, Form, Input, Table } from "antd";
import { ColumnsType } from "antd/lib/table/interface";
import moment from "moment";
import React, { useEffect, useState } from "react";

import { GroupUser } from "../../../types/groupUser";

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

interface EditableGroupTableData {
	data: GroupUser;
	index: number;
}

const EditableGroupColumns = () => {
	const columns: ColumnsType<any> = [
		{
			title: "№ з/п",
			dataIndex: "number",
			key: "number",
			render: (current: any, record: EditableGroupTableData) => {
				return record.index.toString();
			},
		},
		{
			title: "Прізвище, ім’я та по батькові",
			dataIndex: "fullname",
			key: "fullname",
			render: (current: any, record: EditableGroupTableData) => {
				return (
					<EditableCell
						editComponent={<Input></Input>}
						onSave={(value: any) => {
							record.data.fullname = value;
						}}
						value={record.data.fullname}
					></EditableCell>
				);
			},
		},
		{
			title: "Військове звання",
			dataIndex: "rank",
			key: "rank",
			render: (current: any, record: EditableGroupTableData) => {
				return (
					<EditableCell
						editComponent={<Input></Input>}
						onSave={(value: any) => {
							record.data.rank = value;
						}}
						value={record.data.rank}
					></EditableCell>
				);
			},
		},
		{
			title: "День народження",
			dataIndex: "birthday",
			key: "birthday",
			render: (current: any, record: EditableGroupTableData) => {
				return (
					<EditableCell
						editComponent={<Input></Input>}
						onSave={(value: any) => {
							record.data.birthday = value;
						}}
						value={record.data.birthday}
					></EditableCell>
				);
			},
		},
		{
			title: "Освіта",
			dataIndex: "education",
			key: "education",
			render: (current: any, record: EditableGroupTableData) => {
				return (
					<EditableCell
						editComponent={<Input></Input>}
						onSave={(value: any) => {
							record.data.education = value;
						}}
						value={record.data.education}
					></EditableCell>
				);
			},
		},
	];

	return columns;
};

export interface EditableGroupTableProps {
	userGroups: GroupUser[];
}

export const EditableGroupTable: React.FC<EditableGroupTableProps> = (
	props: EditableGroupTableProps
) => {
	const tableData: EditableGroupTableData[] = props.userGroups
		.sort((a, b) => (a.fullname < b.fullname ? -1 : 1))
		.map(
			(ug, index) =>
				({
					data: ug,
					index: index,
				} as EditableGroupTableData)
		);

	return (
		<div>
			<Table
				pagination={false}
				rowKey={(gu: EditableGroupTableData) => gu.data.id.toString()}
				dataSource={tableData}
				columns={EditableGroupColumns()}
				size="small"
				bordered
			></Table>
		</div>
	);
};
