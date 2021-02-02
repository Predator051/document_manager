import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Form, Input, Row, Spin, Result, message } from "antd";
import React, { useState, useEffect } from "react";
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

export function ChangePassword() {
	const dispatch = useDispatch();
	const history = useHistory();
	const [userInfo, setUserInfo] = useState<User | undefined>();
	const me = JSON.parse(localStorage.getItem("user")) as User;

	const onFinish = (data: { password: string }) => {
		//{username: "уававыа", password: "ыаывыаыва"}
		ConnectionManager.getInstance().registerResponseOnceHandler(
			RequestType.UPDATE_USER,
			(data) => {
				const dataMessage = data as RequestMessage<any>;
				if (dataMessage.requestCode === RequestCode.RES_CODE_INTERNAL_ERROR) {
					console.log(`Error: ${dataMessage.requestCode}`);
					return;
				}

				history.push(HREFS.MAIN_MENU);
			}
		);

		if (data.password !== userInfo.login) {
			ConnectionManager.getInstance().emit(RequestType.UPDATE_USER, {
				...userInfo,
				password: data.password,
			} as User);
		} else {
			message.error("Пароль і логін не повинні співпадати");
		}
	};

	useEffect(() => {
		ConnectionManager.getInstance().registerResponseOnceHandler(
			RequestType.GET_USER_INFO,
			(data) => {
				const dataMessage = data as RequestMessage<User>;
				if (dataMessage.requestCode === RequestCode.RES_CODE_INTERNAL_ERROR) {
					console.log(`Error: ${dataMessage.requestCode}`);
					return;
				}
				setUserInfo(dataMessage.data);
			}
		);
		ConnectionManager.getInstance().emit(RequestType.GET_USER_INFO, me.id);
	}, []);

	if (userInfo === undefined) {
		return (
			<div className={styles.box}>
				<Row justify="center" align="middle" style={{ height: "100vh" }}>
					<Spin size="large"></Spin>
				</Row>
			</div>
		);
	}

	return (
		<div className={styles.box}>
			<Result
				status="403"
				title="Дірка у безпеці"
				subTitle="Вибачте, потрібно оновити ваш пароль в цілях безпеки!"
			></Result>
			<br />
			<Form
				name="normal_login"
				className={styles.formWidth}
				initialValues={{ remember: true }}
				onFinish={onFinish}
			>
				<Form.Item
					name="password"
					rules={[
						{ required: true, message: "Будь-ласка, введіть новий пароль!" },
						{},
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
						Оновити
					</Button>
				</Form.Item>
			</Form>
		</div>
	);
}
