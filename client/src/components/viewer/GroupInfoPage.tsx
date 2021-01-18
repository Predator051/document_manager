import "../../../node_modules/hover.css/css/hover.css";
import React, { useEffect, useState } from "react";
import { RouteComponentProps, useHistory } from "react-router-dom";
import { PageHeader, Skeleton, Typography, Row, List } from "antd";
import { Group } from "../../types/group";
import { ConnectionManager } from "../../managers/connetion/connectionManager";
import { RequestMessage, RequestType, RequestCode } from "../../types/requests";
import { GroupSubjectMarkTable } from "../group/GroupSubjectMarkTable";

import "../../animations/text-focus-in.css";
import "../../animations/fade-in.css";
import { BackPage } from "../ui/BackPage";

interface GroupInfoPageProps {
	id: string;
}
export const GroupInfoPage: React.FC<
	RouteComponentProps<GroupInfoPageProps>
> = ({ match }: RouteComponentProps<GroupInfoPageProps>) => {
	const history = useHistory();
	const [group, setGroup] = useState<Group | undefined>(undefined);

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
			}
		);
		ConnectionManager.getInstance().emit(RequestType.GET_GROUP_BY_ID, [
			match.params.id,
		]);
	}, []);

	const getTitle = (records: any[]) => {
		return (
			<Row>
				<Typography.Text strong>
					{group.company} рота, {group.platoon} взвод, ВОС {group.mrs}
				</Typography.Text>
			</Row>
		);
	};

	return (
		<div>
			<BackPage></BackPage>
			{group !== undefined ? (
				<Row justify="center">
					<div style={{ width: "auto" }}>
						<GroupSubjectMarkTable
							group={group}
							title={getTitle}
						></GroupSubjectMarkTable>
					</div>
				</Row>
			) : (
				// <Skeleton active></Skeleton>
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
		</div>
	);
};
