import {
	Router,
	Switch,
	Route,
	Redirect,
	useLocation,
	useHistory,
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

// console.log("render main");
export const Site: React.FC = () => {
	const userJsonString = localStorage.getItem("user");

	const dispatch = useDispatch();
	const [initCompleted, setInitComplited] = useState<boolean>(false);
	let [state, setState] = useState<AccountState>(User.EmptyUser());
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

				console.log("init data", dataMessage);

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
								{state.userType === UserType.TEACHER && (
									<Route path={["/main", "/"]}>
										<MainMenu></MainMenu>
									</Route>
								)}
								{state.userType === UserType.ADMIN && (
									<Route path={["/main", "/"]}>
										<AdminMainMenu></AdminMainMenu>
									</Route>
								)}
								{state.userType === UserType.VIEWER && (
									<Route path={["/main", "/"]}>
										<ViewerMenu></ViewerMenu>
									</Route>
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
