import {
	HomeOutlined,
	UserAddOutlined,
	UsergroupAddOutlined,
	AppstoreAddOutlined,
} from "@ant-design/icons";
import { Button, Col, Layout, Menu, Row } from "antd";
import React from "react";
import { Route, useHistory } from "react-router-dom";

import { CreateNewClassPage } from "../class/create.new.class/CreateNewClass";
import { ExtractClassesPage } from "../pages/ExtractClassesPage";
import { MyClassesPage } from "../pages/MyClassesPage";
import { MyJournalPage } from "../pages/MyJournalPage";
import { NormProcessPage } from "../pages/NormProcessPage";
import { ShowClassPage } from "../pages/ShowClassPage";
import { TrainingGroupsPage } from "../pages/TrainingGroupsPage";
import { TeacherJournalHREFS } from "../teacher/TeacherJournal";
import { UserMenu } from "../user/menu/UserMenu";
import styles from "./menu.module.css";
import { StudentProcess } from "../student/StudentProcess";
import { ShowIndividualWorksPage } from "../pages/ShowIndividualWorksPage";
import "./adminFix.css";
import { PositionEditPage } from "../admin/pages/PositionEditPage";
import { SubdivisionEditPage } from "../admin/pages/SubdivisionEditPage";
import { UserEditPage } from "../admin/pages/UserEditPage";
import { User } from "../../types/user";

const { Header, Content, Footer, Sider } = Layout;
const { SubMenu } = Menu;

export enum HREFS_ADMIN {
	MAIN_MENU = "/main/",
	ADD_USER = "/user/add",
	EDIT_POSITIONS = "/position/edit",
	EDIT_UNIT = "/unit/edit",
}

const MENU_ITEMS = [
	{
		content: "Створити користувача",
		icon: <UserAddOutlined></UserAddOutlined>,
		component: <UserEditPage></UserEditPage>,
		href: HREFS_ADMIN.ADD_USER,
	},
	{
		content: "Редагувати посади",
		icon: <AppstoreAddOutlined></AppstoreAddOutlined>,
		component: <PositionEditPage></PositionEditPage>,
		href: HREFS_ADMIN.EDIT_POSITIONS,
	},
	{
		content: "Редагувати підрозділи",
		icon: <UsergroupAddOutlined></UsergroupAddOutlined>,
		component: <SubdivisionEditPage></SubdivisionEditPage>,
		href: HREFS_ADMIN.EDIT_UNIT,
	},
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
							defaultCollapsed
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
