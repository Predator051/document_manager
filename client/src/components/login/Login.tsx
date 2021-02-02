import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Form, Input } from "antd";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";

import { ConnectionManager } from "../../managers/connetion/connectionManager";
import { setUserData } from "../../redux/slicers/accountSlice";
import { RequestCode, RequestMessage, RequestType } from "../../types/requests";
import { User } from "../../types/user";
import { ErrorBox } from "../error/Error";
import { HREFS } from "../menu/Menu";
import { SiteHREFS } from "../site/Site";
import styles from "./login.module.css";
import logo from "./title.png";

export function Login() {
	const dispatch = useDispatch();
	const [error, setErrorData] = useState("");
	const history = useHistory();

	const onFinish = (data: any) => {
		//{username: "уававыа", password: "ыаывыаыва"}
		ConnectionManager.getInstance().registerResponseHandler(
			RequestType.LOGIN,
			(data) => {
				const dataMessage = data as RequestMessage<User>;
				if (
					dataMessage.requestCode === RequestCode.RES_CODE_INTERNAL_ERROR ||
					dataMessage.data.id === 0
				) {
					console.log(`Error: ${dataMessage.requestCode}`);
					setErrorData(dataMessage.messageInfo);
					return;
				}
				setErrorData("");
				dispatch(setUserData(dataMessage.data));
				localStorage.setItem("user", JSON.stringify(dataMessage.data));
				if (
					dataMessage.requestCode ===
					RequestCode.RES_CODE_EQUAL_PASSWORD_AND_LOGIN
				) {
					history.push(SiteHREFS.NEED_CHANGE_PASSWORD);
					window.location.reload(true);
				} else {
					history.push(HREFS.MAIN_MENU);
					window.location.reload(true);
				}
			}
		);
		ConnectionManager.getInstance().emit(RequestType.LOGIN, data);
	};

	return (
		<div className={styles.box}>
			<img src={logo} className="App-logo" alt="logo" />
			<br />
			<Form
				name="normal_login"
				className={styles.formWidth}
				initialValues={{ remember: true }}
				onFinish={onFinish}
			>
				<Form.Item
					name="username"
					rules={[
						{ required: true, message: "Будь-ласка, введіть ваше ім'я!" },
					]}
				>
					<Input
						prefix={<UserOutlined className="site-form-item-icon" />}
						placeholder="Користувач"
						allowClear
					/>
				</Form.Item>
				<Form.Item
					name="password"
					rules={[
						{ required: true, message: "Будь-ласка, введіть ваш пароль!" },
					]}
				>
					<Input.Password
						prefix={<LockOutlined className="site-form-item-icon" />}
						allowClear
						placeholder="Пароль"
					/>
				</Form.Item>

				<Form.Item>
					<Button
						type="primary"
						htmlType="submit"
						className="login-form-button"
						size="large"
					>
						Увійти
					</Button>
				</Form.Item>
			</Form>
			{error !== "" && <ErrorBox description={error}></ErrorBox>}
		</div>
	);
}
