import { Alert, Menu, Dropdown, Button } from "antd";
import React from "react";
import { DownOutlined, UserOutlined } from "@ant-design/icons";
import styles from "./userMenu.module.css";
import { User } from "../../../types/user";
import store from "../../../app/store";
import { setUserData } from "../../../redux/slicers/accountSlice";
import { SiteHREFS } from "../../site/Site";

export class UserMenu extends React.Component<{
	name?: string;
}> {
	exitClick() {
		localStorage.setItem("user", JSON.stringify(User.EmptyUser()));
		store.dispatch(setUserData(User.EmptyUser()));
		window.location.reload();
	}

	render() {
		console.log("name", this.props.name);

		return (
			<Dropdown
				overlay={
					<div>
						<Menu>
							<Menu.Item
								onClick={() => {
									window.location.replace(SiteHREFS.PROFILE_EDIT);
									// window.location.reload();
								}}
							>
								Налаштування
							</Menu.Item>
							<Menu.Item danger onClick={this.exitClick}>
								Вийти
							</Menu.Item>
						</Menu>
					</div>
				}
				placement="bottomRight"
			>
				<div>
					{this.props.name === "" || this.props.name === undefined
						? "USER"
						: this.props.name.toUpperCase()}{" "}
					<UserOutlined />
				</div>
			</Dropdown>
		);
	}
}
