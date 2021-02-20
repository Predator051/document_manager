import React, { useEffect, useState, useContext } from "react";
import { ConnectionManager } from "../../../managers/connetion/connectionManager";
import {
	RequestType,
	RequestMessage,
	RequestCode,
} from "../../../types/requests";
import { Position, PositionType } from "../../../types/position";
import { User } from "../../../types/user";
import {
	Spin,
	Select,
	Row,
	Col,
	Typography,
	List,
	Divider,
	Input,
	Button,
	Modal,
	Tabs,
	Descriptions,
} from "antd";
import Avatar from "antd/lib/avatar/avatar";
import { message } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { YearContext } from "../../../context/YearContext";
import { Group } from "../../../types/group";
import { GenerateGroupName } from "../../../helpers/GroupHelper";
import { GroupUsageStatisticsBuilder } from "../../statistics/GroupUsageStatisticsBuilder";

export interface GroupUsageStaticsPageProps {}

export const GroupUsageStaticsPage: React.FC<GroupUsageStaticsPageProps> = (
	props: GroupUsageStaticsPageProps
) => {
	const [groups, setGroups] = useState<Group[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [selectedGroup, setSelectedGroup] = useState<Group | undefined>(
		undefined
	);
	const yearContext = useContext(YearContext);

	const loadAllGroups = () => {
		ConnectionManager.getInstance().registerResponseOnceHandler(
			RequestType.GET_ALL_GROUPS,
			(data) => {
				const dataMessage = data as RequestMessage<Group[]>;
				if (dataMessage.requestCode === RequestCode.RES_CODE_INTERNAL_ERROR) {
					console.log(`Error: ${dataMessage.requestCode}`);
					return;
				}
				setGroups([...dataMessage.data]);
				setLoading(false);
			}
		);
		ConnectionManager.getInstance().emit(RequestType.GET_ALL_GROUPS, {
			year: yearContext.year, //TODO ARCHIVE
		});
		setLoading(true);
	};
	useEffect(() => {
		loadAllGroups();
	}, [yearContext.year]);

	if (loading) {
		return <Spin size="large"></Spin>;
	}

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

	const onSubjectSelectChanged = (value: number) => {
		setSelectedGroup(groups.find((gr) => gr.id === value));
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
						<Select style={{ width: "100%" }} onChange={onSubjectSelectChanged}>
							{groups.map((group) => (
								<Select.Option value={group.id}>
									{GenerateGroupName(group)}
								</Select.Option>
							))}
						</Select>
					</Descriptions.Item>
				</Descriptions>
			</Row>
			{selectedGroup && (
				<GroupUsageStatisticsBuilder
					group={selectedGroup}
				></GroupUsageStatisticsBuilder>
			)}
		</div>
	);
};
