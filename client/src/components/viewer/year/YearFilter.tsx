import "../../../../node_modules/hover.css/css/hover.css";

import { OrderedListOutlined, TeamOutlined } from "@ant-design/icons";
import { Row, Tabs } from "antd";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";

import { User } from "../../../types/user";
import { GroupList } from "../GroupList";
import { UserList } from "../UserList";
import { YearContext } from "../../../context/YearContext";
import "../../../animations/fade-in.css";
import "../../../animations/text-focus-in.css";

export interface YearFilterProps {
	// year: number;
}

export const YearFilter: React.FC<YearFilterProps> = (
	props: YearFilterProps
) => {
	const history = useHistory();

	return (
		<YearContext.Consumer>
			{({ year }) => {
				return (
					<div style={{ margin: "4px" }} className="text-focus-in">
						<Row justify={"center"}>
							<Tabs defaultActiveKey="1" tabPosition="top" centered type="card">
								<Tabs.TabPane
									tab={
										<span>
											<TeamOutlined></TeamOutlined>Список викладачів
										</span>
									}
									key="1"
								>
									<div className="fade-in-top">
										<UserList></UserList>
									</div>
								</Tabs.TabPane>
								<Tabs.TabPane
									tab={
										<span>
											<OrderedListOutlined></OrderedListOutlined>Список
											навчальних груп
										</span>
									}
									key="2"
									style={{
										marginBottom: "1%",
										scrollBehavior: "smooth",
									}}
								>
									<div className="fade-in-top">
										<GroupList></GroupList>
									</div>
								</Tabs.TabPane>
							</Tabs>
						</Row>
					</div>
				);
			}}
		</YearContext.Consumer>
	);
};
