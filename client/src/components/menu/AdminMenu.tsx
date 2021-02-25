import "./adminFix.css";

import {
	AppstoreAddOutlined,
	HomeOutlined,
	MonitorOutlined,
	UserAddOutlined,
	UsergroupAddOutlined,
	AreaChartOutlined,
	AimOutlined,
	AuditOutlined,
	CompressOutlined,
} from "@ant-design/icons";
import { Col, Layout, Menu, Row } from "antd";
import React from "react";
import { Route, useHistory } from "react-router-dom";

import { User } from "../../types/user";
import { GroupManipulationPage } from "../admin/pages/GroupManipulationPage";
import { PositionEditPage } from "../admin/pages/PositionEditPage";
import { SubdivisionEditPage } from "../admin/pages/SubdivisionEditPage";
import { UserEditPage } from "../admin/pages/UserEditPage";
import { ProfileEditPage } from "../login/EditProfile";
import { SiteHREFS } from "../site/Site";
import { UserMenu } from "../user/menu/UserMenu";
import { GroupUsageStaticsPage } from "../admin/pages/GroupUsageStatisticsPage";
import { MRSEditPage } from "../admin/pages/MRCEditPage";
import { RankEditPage } from "../admin/pages/RankEditPage";
import { IPPEditPage } from "../admin/pages/IPPEditPage";

const { Header, Content, Footer, Sider } = Layout;
const { SubMenu } = Menu;

export enum HREFS_ADMIN {
	MAIN_MENU = "/main/",
	ADD_USER = "/user/add",
	EDIT_POSITIONS = "/position/edit",
	EDIT_UNIT = "/unit/edit",
	GROUP = "/groups",
	GROUP_USAGE_STATISTICS = "/statistics/groups/usage/",
	EDIT_MRS = "/mrs/edit",
	EDIT_RANKS = "/rank/edit",
	EDIT_IPP = "/ipp/edit",
}

const MENU_ITEMS = [
	{
		content: "Користувачі",
		icon: <UserAddOutlined></UserAddOutlined>,
		component: <UserEditPage></UserEditPage>,
		href: HREFS_ADMIN.ADD_USER,
	},
	{
		content: "Посади",
		icon: <AppstoreAddOutlined></AppstoreAddOutlined>,
		component: <PositionEditPage></PositionEditPage>,
		href: HREFS_ADMIN.EDIT_POSITIONS,
	},
	{
		content: "Підрозділи",
		icon: <UsergroupAddOutlined></UsergroupAddOutlined>,
		component: <SubdivisionEditPage></SubdivisionEditPage>,
		href: HREFS_ADMIN.EDIT_UNIT,
	},
	{
		content: "Групи",
		icon: <MonitorOutlined></MonitorOutlined>,
		component: <GroupManipulationPage></GroupManipulationPage>,
		href: HREFS_ADMIN.GROUP,
	},
	{
		content: "ВОС",
		icon: <AimOutlined></AimOutlined>,
		component: <MRSEditPage></MRSEditPage>,
		href: HREFS_ADMIN.EDIT_MRS,
	},
	{
		content: "Звання",
		icon: <AuditOutlined></AuditOutlined>,
		component: <RankEditPage></RankEditPage>,
		href: HREFS_ADMIN.EDIT_RANKS,
	},
	{
		content: "ІПП",
		icon: <CompressOutlined></CompressOutlined>,
		component: <IPPEditPage></IPPEditPage>,
		href: HREFS_ADMIN.EDIT_IPP,
	},
	// {
	// 	content: "Групова статистика",
	// 	icon: <AreaChartOutlined></AreaChartOutlined>,
	// 	component: <GroupUsageStaticsPage></GroupUsageStaticsPage>,
	// 	href: HREFS_ADMIN.GROUP_USAGE_STATISTICS,
	// },
];

export const AdminMainMenu: React.FC = (props: any) => {
	const history = useHistory();
	const me = JSON.parse(localStorage.getItem("user")) as User;

	const headerStyle: React.CSSProperties = {
		padding: 0,
		textAlign: "right",
		width: "auto",
	};
	return (
		<Layout
			style={{
				minHeight: "100vh",
				backgroundColor: "none",
				backgroundImage: `url(/25928.jpg)`,
				backgroundSize: "100% 100%",
			}}
		>
			<Layout className="site-layout">
				<Header className="site-layout-background" style={{ padding: 0 }}>
					<Row>
						<Col flex="50%">
							<Row justify="start" style={{ marginLeft: "2%" }}>
								<a href={HREFS_ADMIN.MAIN_MENU}>
									<HomeOutlined></HomeOutlined>
								</a>
							</Row>
						</Col>
						<Col flex="50%">
							<Menu
								theme="dark"
								mode="horizontal"
								defaultSelectedKeys={["1"]}
								style={headerStyle}
							>
								<Menu.Item key="1">
									<UserMenu name={me.login}></UserMenu>
								</Menu.Item>
							</Menu>
						</Col>
					</Row>
				</Header>
				<Content style={{ margin: "0", height: "100%" }}>
					<Layout
						className="site-layout-background"
						// style={{ minHeight: "90vh" }}
					>
						<Sider
							className="site-layout-background"
							style={{ minHeight: "100vh", zIndex: 1 }}
							width="15vw"
							collapsible
							defaultCollapsed={false}
						>
							<Menu
								mode="inline"
								theme="dark"
								defaultSelectedKeys={[window.location.pathname]}
							>
								{MENU_ITEMS.map((item) => {
									return (
										<Menu.Item
											icon={item.icon}
											onClick={() => {
												history.push(item.href);
											}}
											key={item.href}
										>
											{item.content}
										</Menu.Item>
									);
								})}
							</Menu>
						</Sider>
						<Content>
							{MENU_ITEMS.map((item) => {
								return (
									<Route exact path={item.href}>
										{item.component}
									</Route>
								);
							})}
							<Route exact path={SiteHREFS.PROFILE_EDIT}>
								<ProfileEditPage></ProfileEditPage>
							</Route>
						</Content>
					</Layout>
				</Content>
			</Layout>
			<Footer
				style={{
					textAlign: "center",
					// height: "10vh",
					// margin: 0,
					// padding: 0,
					// verticalAlign: "middle",
				}}
			>
				©2020 Created by BIUS
			</Footer>
		</Layout>
	);
};
