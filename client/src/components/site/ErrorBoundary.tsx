import React, { useState, useEffect } from "react";
import { Result, Button } from "antd";
import { HREFS } from "../menu/Menu";
import { HomeOutlined, UploadOutlined, RedoOutlined } from "@ant-design/icons";

export class ErrorBoundary extends React.Component<{}, { hasError: boolean }> {
	constructor(props: any) {
		super(props);
		this.state = { hasError: false };
	}
	static getDerivedStateFromError(error: any) {
		return { hasError: true };
	}
	componentDidCatch(error: any, errorInfo: any) {}

	render() {
		if (this.state.hasError) {
			return (
				<Result
					status="500"
					title="Щось пішло не так"
					subTitle="Спробуйте виконати дію ще раз. Якщо проблема не зникає, то зверніться до адміністратора"
					extra={
						<Button.Group>
							<Button
								type="primary"
								onClick={() => {
									window.location.replace(HREFS.MAIN_MENU);
								}}
								icon={<HomeOutlined></HomeOutlined>}
							>
								В головне меню
							</Button>
							<Button
								type="primary"
								onClick={() => {
									window.location.reload();
								}}
								icon={<RedoOutlined></RedoOutlined>}
							>
								Оновити поточну сторінку
							</Button>
						</Button.Group>
					}
				></Result>
			);
		}

		return this.props.children;
	}
}
