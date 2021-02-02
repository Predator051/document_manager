import { Row, Spin, Typography, Table, Carousel, Tabs, Button } from "antd";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import "../../../node_modules/hover.css/css/hover.css";
import { ConnectionManager } from "../../managers/connetion/connectionManager";
import { RequestCode, RequestMessage, RequestType } from "../../types/requests";
import { User, UserType } from "../../types/user";
import { ColumnsType } from "antd/lib/table/interface";
import {
	TeamOutlined,
	OrderedListOutlined,
	FileSearchOutlined,
} from "@ant-design/icons";
import { VIEWER_HREFS } from "../menu/ViewerMenu";

export interface UserListProps {}

interface UserListTableData {
	key: number;
	data: User;
}

export const UserList: React.FC<UserListProps> = (props: UserListProps) => {
	const history = useHistory();
	const [users, setUsers] = useState<User[]>([]);

	const loadAllUsers = () => {
		ConnectionManager.getInstance().registerResponseOnceHandler(
			RequestType.GET_ALL_USERS,
			(data) => {
				const dataMessage = data as RequestMessage<User[]>;
				if (dataMessage.requestCode === RequestCode.RES_CODE_INTERNAL_ERROR) {
					console.log(`Error: ${dataMessage.requestCode}`);
					return;
				}

				setUsers(
					dataMessage.data.filter((u) => u.userType === UserType.TEACHER)
				);
			}
		);
		ConnectionManager.getInstance().emit(RequestType.GET_ALL_USERS, {});
	};
	useEffect(() => {
		loadAllUsers();
	}, []);

	const columns: ColumnsType<any> = [
		{
			title: "Викладач",
			key: "teacher",
			dataIndex: "teacher",
			render: (value, record: UserListTableData) => (
				<div>
					<Button
						type="link"
						onClick={() => {
							history.push(VIEWER_HREFS.JOURNAL + record.data.id.toString());
						}}
					>
						{record.data.secondName} {record.data.firstName}
					</Button>
				</div>
			),
			sorter: (a: UserListTableData, b: UserListTableData) =>
				a.data.secondName.localeCompare(b.data.secondName),
		},
		{
			title: "Підрозділ",
			key: "subdivision",
			dataIndex: "subdivision",
			render: (value, record: UserListTableData) => (
				<div>{record.data.cycle.title}</div>
			),
			filters: [
				...users
					.filter(
						(value, index, self) =>
							self.findIndex((u) => u.cycle.id === value.cycle.id) === index
					)
					.map((u) => ({ text: u.cycle.title, value: u.cycle.id })),
			],
			onFilter: (value, record: UserListTableData) =>
				record.data.cycle.id === value,
		},
	];

	const tableData: UserListTableData[] = users.map((u) => ({
		key: u.id,
		data: u,
	}));
	return (
		<div>
			<Table
				pagination={false}
				dataSource={tableData}
				columns={columns}
				bordered
				size="small"
			></Table>
		</div>
	);
};
