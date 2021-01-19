import {
	HomeOutlined,
	TeamOutlined,
	OrderedListOutlined,
	FileSearchOutlined,
} from "@ant-design/icons";
import {
	Col,
	Layout,
	Menu,
	Row,
	Tabs,
	Descriptions,
	DatePicker,
	Typography,
} from "antd";
import React, { useState, useContext } from "react";
import { Route, useHistory } from "react-router-dom";

import { UserMenu } from "../user/menu/UserMenu";
import { UserList } from "../viewer/UserList";
import { JournalPage } from "../pages/JournalPage";
import { ExtractClassesPage } from "../pages/ExtractClassesPage";
import { TrainingGroupsPage } from "../pages/TrainingGroupsPage";
import { ShowIndividualWorksPage } from "../pages/ShowIndividualWorksPage";
import { TeacherJournalHREFS } from "../teacher/TeacherJournal";
import { GroupList } from "../viewer/GroupList";
import { User } from "../../types/user";
import { GroupInfoPage } from "../viewer/GroupInfoPage";
import { TeacherAccounting } from "../teacher/TeacherAccounting";
import { AccountingTeacherPage } from "../pages/TeacherAccountingPage";
import { YearFilter } from "../viewer/year/YearFilter";
import { YearContext, isYearCurrent } from "../../context/YearContext";
import moment from "moment";
import "../../animations/fade-in.css";

const { Header, Content, Footer, Sider } = Layout;
const { SubMenu } = Menu;

export enum VIEWER_HREFS {
	MAIN_MENU = "/main/",
	JOURNAL = "/journal/",
	GROUP_INFO = "/group/info/",
}

export const ViewerMenu: React.FC = (props: any) => {
	const history = useHistory();
	const me = JSON.parse(localStorage.getItem("user")) as User;
	const [archiveYear, setArchiveYear] = useState<Date | undefined>(undefined);
	const [activeKey, setActiveKey] = useState<string>("1");
	const yearContext = useContext(YearContext);

	const headerStyle: React.CSSProperties = {
		padding: 0,
		textAlign: "right",
		width: "auto",
	};

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

	const changeArchiveYear = (year: moment.Moment) => {
		setArchiveYear(year?.toDate());
		yearContext.year =
			year && year.isValid()
				? year.toDate().getFullYear()
				: new Date().getFullYear();
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
						<Col flex="33%">
							<Row justify="start" style={{ marginLeft: "2%" }}>
								<a href={VIEWER_HREFS.MAIN_MENU}>
									<HomeOutlined></HomeOutlined>
								</a>
							</Row>
						</Col>
						<Col flex="33%">
							<Row justify="center" align="middle" style={{ height: "100%" }}>
								<Typography.Title
									style={{ color: "#F3F3F3", margin: 0, padding: 0 }}
								>
									{yearContext.year}
								</Typography.Title>
							</Row>
						</Col>
						<Col flex="auto">
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
				<Content style={{ margin: "0 16px" }}>
					<Route exact path={[VIEWER_HREFS.MAIN_MENU, "/"]}>
						<div
							className="site-layout-background"
							style={{ width: "100%", height: "100%", marginTop: "5%" }}
						>
							<Tabs
								tabPosition="left"
								onTabClick={(activeKey) => {}}
								onChange={(activeKey) => {
									if (activeKey === "1" || activeKey === "2") {
										yearContext.year = new Date().getFullYear();
									}
									setActiveKey(activeKey);
								}}
								activeKey={activeKey}
							>
								<Tabs.TabPane
									tab={
										<span>
											<TeamOutlined></TeamOutlined>Список викладачів
										</span>
									}
									key="1"
								>
									<div className="fade-in-left">
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
										// height: "80vh",
										// overflowY: "auto",
										marginBottom: "1%",
										scrollBehavior: "smooth",
									}}
								>
									<div className="fade-in-left">
										<GroupList></GroupList>
									</div>
								</Tabs.TabPane>
								<Tabs.TabPane
									tab={
										<span>
											<FileSearchOutlined></FileSearchOutlined>Архів
										</span>
									}
									key="3"
								>
									<Row justify="center" className="fade-in-left">
										<Descriptions bordered>
											<Descriptions.Item
												label="Оберіть рік"
												span={3}
												labelStyle={descriptionItemLabelStyle}
												contentStyle={descriptionItemContentStyle}
											>
												<DatePicker
													picker="year"
													onChange={changeArchiveYear}
													value={moment(new Date(yearContext.year, 1, 1, 1))}
													disabledDate={(date) => {
														if (
															date.toDate().getFullYear() <
															new Date().getFullYear()
														) {
															return false;
														}
														return true;
													}}
												></DatePicker>
											</Descriptions.Item>
										</Descriptions>
									</Row>
									{archiveYear && !isYearCurrent(yearContext) ? (
										<YearFilter></YearFilter>
									) : (
										<div></div>
									)}
								</Tabs.TabPane>
							</Tabs>
						</div>
					</Route>
					<Route
						path={VIEWER_HREFS.JOURNAL + ":id"}
						render={(props) => <JournalPage {...props}></JournalPage>}
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
