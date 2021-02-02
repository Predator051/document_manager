import {
	Router,
	Switch,
	Route,
	Redirect,
	useLocation,
	useHistory,
	RouteComponentProps,
} from "react-router-dom";
import React, { useState, useEffect } from "react";
import { Login } from "../login/Login";
import { AccountState, setUserData } from "../../redux/slicers/accountSlice";
import { MainMenu } from "../menu/Menu";
import { User, UserType } from "../../types/user";
import { AdminMainMenu } from "../menu/AdminMenu";
import { ConnectionManager } from "../../managers/connetion/connectionManager";
import { RequestType, RequestMessage, RequestCode } from "../../types/requests";
import { Row, Col, Spin } from "antd";
import { useDispatch } from "react-redux";
import { ViewerMenu } from "../menu/ViewerMenu";
import { ChangePassword } from "../login/ChangePassword";
import { ErrorBoundary } from "./ErrorBoundary";

import "../../animations/fade-in.css";

export enum SiteHREFS {
	NEED_CHANGE_PASSWORD = "/update/password",
	PROFILE_EDIT = "/profile/edit",
}

// console.log("render main");
export const Site: React.FC = () => {
	const userJsonString = localStorage.getItem("user");

	const dispatch = useDispatch();
	const [isNeedChangePassword, setNeedChangePassword] = useState<boolean>(
		false
	);
	const [initCompleted, setInitComplited] = useState<boolean>(false);
	let [state, setState] = useState<AccountState>(User.EmptyUser());
	const history = useHistory();

	if (userJsonString !== null) {
		const userAccount = JSON.parse(userJsonString) as AccountState;
		if (userAccount.id !== 0) {
			state = userAccount;
		}
	}

	useEffect(() => {
		ConnectionManager.getInstance().registerResponseOnceHandler(
			RequestType.INIT,
			(data) => {
				const dataMessage = data as RequestMessage<User>;
				if (dataMessage.requestCode === RequestCode.RES_CODE_INTERNAL_ERROR) {
					console.log(`Error: ${dataMessage.requestCode}`);
					return;
				}

				if (
					dataMessage.requestCode ===
					RequestCode.RES_CODE_EQUAL_PASSWORD_AND_LOGIN
				) {
					setNeedChangePassword(true);
					history.push(SiteHREFS.NEED_CHANGE_PASSWORD);
				}

				setInitComplited(true);
				setState(dataMessage.data);
				dispatch(setUserData(dataMessage.data));
				localStorage.setItem("user", JSON.stringify(dataMessage.data));
			}
		);
		ConnectionManager.getInstance().emit(RequestType.INIT, {});
	}, []);

	return (
		<div className="App">
			<header className="App-header">
				{initCompleted === false &&
					(state.id === 0 || state.session === "") && <Login></Login>}
				{initCompleted ? (
					<Switch>
						{state.id === 0 || state.session === "" ? (
							<Login></Login>
						) : (
							<div>
								<Route path="/login">
									<Login></Login>
								</Route>
								<Route exact path={SiteHREFS.NEED_CHANGE_PASSWORD}>
									<ChangePassword></ChangePassword>
								</Route>
								{state.userType === UserType.TEACHER ? (
									<Route
										path={["/main", "/"]}
										render={(props: RouteComponentProps<any>) => {
											if (
												props.location.pathname ===
												SiteHREFS.NEED_CHANGE_PASSWORD
											) {
												return "";
											}
											return (
												<ErrorBoundary>
													<MainMenu></MainMenu>
												</ErrorBoundary>
											);
										}}
									></Route>
								) : (
									""
								)}
								{state.userType === UserType.ADMIN && (
									<Route
										path={["/main", "/"]}
										render={(props: RouteComponentProps<any>) => {
											if (
												props.location.pathname ===
												SiteHREFS.NEED_CHANGE_PASSWORD
											) {
												return "";
											}
											return (
												<ErrorBoundary>
													<AdminMainMenu></AdminMainMenu>
												</ErrorBoundary>
											);
										}}
									></Route>
								)}
								{state.userType === UserType.VIEWER && (
									<Route
										path={["/main", "/"]}
										render={(props: RouteComponentProps<any>) => {
											if (
												props.location.pathname ===
												SiteHREFS.NEED_CHANGE_PASSWORD
											) {
												return "";
											}

											return (
												<ErrorBoundary>
													<ViewerMenu></ViewerMenu>
												</ErrorBoundary>
											);
										}}
									></Route>
								)}
							</div>
						)}
					</Switch>
				) : (
					<Row justify="center" align="middle" style={{ height: "100vh" }}>
						<Col>
							<Spin size="large"></Spin>
						</Col>
					</Row>
				)}
			</header>
		</div>
	);
};
