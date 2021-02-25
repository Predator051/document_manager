import "../../../node_modules/hover.css/css/hover.css";
import React, { useEffect, useState } from "react";
import { RouteComponentProps, useHistory } from "react-router-dom";
import { Typography, Row, List, Tabs, Spin, Popover } from "antd";
import { Group, GroupTrainingType } from "../../types/group";
import { ConnectionManager } from "../../managers/connetion/connectionManager";
import { RequestMessage, RequestType, RequestCode } from "../../types/requests";
import { GroupSubjectMarkTable } from "../group/GroupSubjectMarkTable";

import "../../animations/text-focus-in.css";
import "../../animations/fade-in.css";
import { BackPage } from "../ui/BackPage";
import {
	BarChartOutlined,
	DotChartOutlined,
	LineChartOutlined,
} from "@ant-design/icons";
import { GroupAccountingClassesFromTrainingSubjects } from "../group/GroupAccountingClassesFromTrainingSubjects";
import { GroupAccountingNormsForTrainingSubjects } from "../group/GroupAccountingNormsForTrainingSubjects";

interface GroupInfoPageProps {
	id: string;
}
export const GroupInfoPage: React.FC<
	RouteComponentProps<GroupInfoPageProps>
> = ({ match }: RouteComponentProps<GroupInfoPageProps>) => {
	const [group, setGroup] = useState<Group | undefined>(undefined);
	const [loading, setLoading] = useState<boolean>(true);

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
				setGroup(dataMessage.data[0]);
				setLoading(false);
			}
		);
		setLoading(true);
		ConnectionManager.getInstance().emit(RequestType.GET_GROUP_BY_ID, [
			match.params.id,
		]);
	}, []);

	const getTitle = (records: any[]) => {
		if (group.trainingType.type === GroupTrainingType.IPP) {
			return (
				<Row>
					<Typography.Text strong>{group.ipp.name}</Typography.Text>
				</Row>
			);
		}
		return (
			<Row>
				<Typography.Text strong>
					{group.company} рота, {group.platoon} взвод, ВОС {group.mrs.number}
				</Typography.Text>
			</Row>
		);
	};

	if (loading) {
		return <Spin size="large"></Spin>;
	}

	return (
		<div style={{ margin: "1%" }}>
			<BackPage></BackPage>
			<Tabs tabPosition="top" centered type="card">
				<Tabs.TabPane
					tab={
						<span>
							{" "}
							<LineChartOutlined></LineChartOutlined> Зведена таблиця оцінок за
							предметами
						</span>
					}
					key="1"
				>
					{group !== undefined ? (
						<Row justify="center">
							<div style={{ width: "95%" }}>
								<GroupSubjectMarkTable
									group={group}
									title={getTitle}
								></GroupSubjectMarkTable>
							</div>
						</Row>
					) : (
						<div></div>
					)}
					<Row justify="center">
						<div style={{ width: "auto" }} className="text-focus-in">
							<List
								bordered
								dataSource={[
									<Typography.Text>
										Кінцева оцінка (випускний іспит) позначаеться{" "}
										<Typography.Text style={{ color: "#cd201f" }}>
											червоним кольором
										</Typography.Text>
									</Typography.Text>,
									<Typography.Text>
										Оцінка за тему позначаеться{" "}
										<Typography.Text style={{ color: "#108ee9" }}>
											синім кольором
										</Typography.Text>
									</Typography.Text>,
								]}
								renderItem={(item) => <List.Item>{item}</List.Item>}
								style={{
									backgroundColor: "#fff",
									marginTop: "1%",
									marginBottom: "1%",
								}}
							></List>{" "}
						</div>
					</Row>
				</Tabs.TabPane>
				<Tabs.TabPane
					tab={
						<Popover content="Тут відображаються всі заняття з даною групою.">
							<span>
								<BarChartOutlined></BarChartOutlined> Облік занять з предметів
								підготовки
							</span>
						</Popover>
					}
					key="2"
				>
					<GroupAccountingClassesFromTrainingSubjects
						group={group}
					></GroupAccountingClassesFromTrainingSubjects>
				</Tabs.TabPane>
				<Tabs.TabPane
					tab={
						<Popover content="Тут відображаються всі опрацьовані нормативи з даною групою.">
							<span>
								<DotChartOutlined></DotChartOutlined> Облік виконання нормативів
								з предметів підготовки
							</span>
						</Popover>
					}
					key="3"
				>
					<GroupAccountingNormsForTrainingSubjects
						group={group}
					></GroupAccountingNormsForTrainingSubjects>
				</Tabs.TabPane>
			</Tabs>
		</div>
	);
};
