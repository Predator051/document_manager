import "../../animations/fade-in.css";

import {
	HomeOutlined,
	FileTextOutlined,
	AppstoreAddOutlined,
	FolderAddOutlined,
	PushpinOutlined,
	AppstoreOutlined,
	OrderedListOutlined,
} from "@ant-design/icons";
import { Col, Layout, Menu, Row, Typography } from "antd";
import React from "react";
import { Route, useHistory } from "react-router-dom";

import { User } from "../../types/user";
import { CreateNewClassPage } from "../class/create.new.class/CreateNewClass";
import { ProfileEditPage } from "../login/EditProfile";
import { ExtractClassesPage } from "../pages/ExtractClassesPage";
import { MyClassesPage } from "../pages/MyClassesPage";
import { MyJournalPage } from "../pages/MyJournalPage";
import { NormProcessPage } from "../pages/NormProcessPage";
import { ShowClassPage } from "../pages/ShowClassPage";
import { ShowIndividualWorksPage } from "../pages/ShowIndividualWorksPage";
import { AccountingTeacherPage } from "../pages/TeacherAccountingPage";
import { TeacherGroupsNormPage } from "../pages/TeacherGroupsNormPage";
import { TeacherGroupsSubjectPage } from "../pages/TeacherGroupsSubjectPage";
import { SiteHREFS } from "../site/Site";
import { StudentProcess } from "../student/StudentProcess";
import { TeacherJournalHREFS } from "../teacher/TeacherJournal";
import { UserMenu } from "../user/menu/UserMenu";

import { ReactComponent as IconNotepad } from "../../images/icons/Notepad.svg";
import { GroupList } from "../viewer/GroupList";
import { GroupInfoPage } from "../viewer/GroupInfoPage";
import { VIEWER_HREFS } from "./ViewerMenu";

const { Header, Content, Footer, Sider } = Layout;
const { SubMenu } = Menu;

export enum HREFS {
	MAIN_MENU = "/main/",
	CREATE_NEW_CLASS = "/createNewClass/",
	SHOW_CLASS = "/showClass/",
	MY_CLASSES = "/me/classes",
	NORM_PROCESS_PAGE = "/norm/process",
	MY_JOURNAL_PAGE = "/me/journal",
	STUDENT_PROCESS = "/me/student/process",
	GROUP_LIST = "/group/list",
}

export const MainMenu: React.FC = (props: any) => {
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
								<a href={HREFS.MAIN_MENU}>
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
								{/* <Menu.Item key="2">
									<a href={HREFS.MY_CLASSES}>Мої заняття</a>
								</Menu.Item> */}
								<Menu.Item key="1">
									<UserMenu name={me.login}></UserMenu>
								</Menu.Item>
							</Menu>
						</Col>
					</Row>
				</Header>
				<Content style={{ margin: "0 0" }}>
					<Menu
						theme="light"
						mode="horizontal"
						defaultSelectedKeys={[window.location.pathname]}
						style={{
							display: "flex",
							justifyContent: "space-between",
						}}
					>
						<Menu.Item
							onClick={() => {
								history.push(HREFS.MY_JOURNAL_PAGE);
							}}
							key={HREFS.MY_JOURNAL_PAGE}
							icon={<FileTextOutlined></FileTextOutlined>}
						>
							<Typography.Text strong>
								{"Переглянути мій журнал".toUpperCase()}
							</Typography.Text>
						</Menu.Item>

						<Menu.Item
							onClick={() => {
								history.push(HREFS.MY_CLASSES);
							}}
							key={HREFS.MY_CLASSES}
							icon={<AppstoreOutlined></AppstoreOutlined>}
						>
							<Typography.Text strong>
								{"Мої заняття".toUpperCase()}
							</Typography.Text>
						</Menu.Item>
						<Menu.Item
							onClick={() => {
								history.push(HREFS.CREATE_NEW_CLASS);
							}}
							key={HREFS.CREATE_NEW_CLASS}
							icon={<AppstoreAddOutlined></AppstoreAddOutlined>}
						>
							<Typography.Text strong>
								{"Створити нове заняття".toUpperCase()}
							</Typography.Text>
						</Menu.Item>
						<Menu.Item
							onClick={() => {
								history.push(HREFS.NORM_PROCESS_PAGE);
							}}
							key={HREFS.NORM_PROCESS_PAGE}
							icon={<FolderAddOutlined></FolderAddOutlined>}
						>
							<Typography.Text strong>
								{"Заповнити виконання нормативів".toUpperCase()}
							</Typography.Text>
						</Menu.Item>
						<Menu.Item
							onClick={() => {
								history.push(HREFS.STUDENT_PROCESS);
							}}
							key={HREFS.STUDENT_PROCESS}
							icon={<PushpinOutlined></PushpinOutlined>}
						>
							<Typography.Text strong>
								{"Додаткова робота з курсантами".toUpperCase()}
							</Typography.Text>
						</Menu.Item>
						<Menu.Item
							onClick={() => {
								history.push(HREFS.GROUP_LIST);
							}}
							key={HREFS.GROUP_LIST}
							icon={<OrderedListOutlined></OrderedListOutlined>}
						>
							<Typography.Text strong>
								{"Список груп".toUpperCase()}
							</Typography.Text>
						</Menu.Item>
					</Menu>
					<Route path={HREFS.CREATE_NEW_CLASS}>
						<CreateNewClassPage></CreateNewClassPage>
					</Route>
					<Route path={HREFS.MY_CLASSES}>
						<MyClassesPage></MyClassesPage>
					</Route>
					<Route exact path={SiteHREFS.PROFILE_EDIT}>
						<ProfileEditPage></ProfileEditPage>
					</Route>
					<Route
						path={HREFS.SHOW_CLASS + ":id"}
						render={(props) => <ShowClassPage {...props}></ShowClassPage>}
					></Route>
					<Route
						path={TeacherJournalHREFS.EXTRACT_CLASSES_PAGE + ":userId"}
						render={(props) => (
							<ExtractClassesPage {...props}></ExtractClassesPage>
						)}
					></Route>
					<Route
						path={TeacherJournalHREFS.TEACHER_GROUPS_SUBJECT_PAGE + ":userId"}
						render={(props) => (
							<TeacherGroupsSubjectPage {...props}></TeacherGroupsSubjectPage>
						)}
					></Route>
					<Route
						path={TeacherJournalHREFS.TEACHER_GROUPS_NORM_PAGE + ":userId"}
						render={(props) => (
							<TeacherGroupsNormPage {...props}></TeacherGroupsNormPage>
						)}
					></Route>
					<Route
						path={TeacherJournalHREFS.INDIVIDUAL_WORKS + ":userId"}
						render={(props) => (
							<ShowIndividualWorksPage {...props}></ShowIndividualWorksPage>
						)}
					></Route>
					<Route
						path={TeacherJournalHREFS.TEACHER_ACCOUNTING + ":userId"}
						render={(props) => (
							<AccountingTeacherPage {...props}></AccountingTeacherPage>
						)}
					></Route>
					<Route path={HREFS.NORM_PROCESS_PAGE}>
						<NormProcessPage></NormProcessPage>
					</Route>
					<Route path={[HREFS.MY_JOURNAL_PAGE, "/main"]}>
						<MyJournalPage></MyJournalPage>
					</Route>
					<Route path={HREFS.STUDENT_PROCESS}>
						<StudentProcess></StudentProcess>
					</Route>
					<Route path={HREFS.GROUP_LIST}>
						<div style={{ margin: "1%" }} className="fade-in-top">
							<GroupList></GroupList>
						</div>
					</Route>
					<Route
						path={VIEWER_HREFS.GROUP_INFO + ":id"}
						render={(props) => <GroupInfoPage {...props}></GroupInfoPage>}
					></Route>
				</Content>
				<Footer style={{ textAlign: "center" }}>©2020 Created by BIUS</Footer>
			</Layout>
		</Layout>
	);
};
