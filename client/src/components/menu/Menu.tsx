import { HomeOutlined } from "@ant-design/icons";
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
import { User } from "../../types/user";
import { AccountingTeacherPage } from "../pages/TeacherAccountingPage";

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
								<Menu.Item key="2">
									<a href={HREFS.MY_CLASSES}>Мої заняття</a>
								</Menu.Item>
								<Menu.Item key="1">
									<UserMenu name={me.login}></UserMenu>
								</Menu.Item>
							</Menu>
						</Col>
					</Row>
				</Header>
				<Content style={{ margin: "0 16px" }}>
					<Route exact path={[HREFS.MAIN_MENU, "/"]}>
						<div
							className="site-layout-background"
							style={{ width: "100%", height: "100%", marginTop: "5%" }}
						>
							<Button
								className={styles.mainMenuButton}
								style={{ backgroundColor: "#52c41a" }}
								onClick={() => {
									history.push(HREFS.MY_JOURNAL_PAGE);
								}}
							>
								Переглянути мій журнал
							</Button>
							<Button
								className={styles.mainMenuButton}
								style={{ backgroundColor: "#2f54eb" }}
								onClick={() => {
									history.push(HREFS.CREATE_NEW_CLASS);
								}}
							>
								Створити нове заняття
							</Button>
							<Button
								className={styles.mainMenuButton}
								style={{ backgroundColor: "#fadb14" }}
								onClick={() => {
									history.push(HREFS.NORM_PROCESS_PAGE);
								}}
							>
								Заповнити виконання нормативів
							</Button>
							<Button
								className={styles.mainMenuButton}
								style={{ backgroundColor: "#722ed1" }}
								onClick={() => {
									history.push(HREFS.STUDENT_PROCESS);
								}}
							>
								Додаткова робота з курсантами
							</Button>

							<Button
								className={styles.mainMenuButton}
								style={{ backgroundColor: "#13c2c2" }}
								onClick={() => {
									history.push(HREFS.MY_CLASSES);
								}}
							>
								Мої заняття
							</Button>
						</div>
					</Route>
					<Route path={HREFS.CREATE_NEW_CLASS}>
						<CreateNewClassPage></CreateNewClassPage>
					</Route>
					<Route path={HREFS.MY_CLASSES}>
						<MyClassesPage></MyClassesPage>
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
						path={TeacherJournalHREFS.TRAINING_GROUPS_PAGE + ":userId"}
						render={(props) => (
							<TrainingGroupsPage {...props}></TrainingGroupsPage>
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
					<Route path={HREFS.MY_JOURNAL_PAGE}>
						<MyJournalPage></MyJournalPage>
					</Route>
					<Route path={HREFS.STUDENT_PROCESS}>
						<StudentProcess></StudentProcess>
					</Route>
				</Content>
				<Footer style={{ textAlign: "center" }}>©2020 Created by BIUS</Footer>
			</Layout>
		</Layout>
	);
};
