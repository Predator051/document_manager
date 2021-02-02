import { Row, Spin, Typography } from "antd";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import "../../../node_modules/hover.css/css/hover.css";
import { ConnectionManager } from "../../managers/connetion/connectionManager";
import { RequestCode, RequestMessage, RequestType } from "../../types/requests";
import { User } from "../../types/user";

import "../../animations/swing-in.css";

export interface TeacherJournalProps {
	userId: number;
}

export enum TeacherJournalHREFS {
	EXTRACT_CLASSES_PAGE = "/extract/",
	TRAINING_GROUPS_PAGE = "/groups/list/",
	INDIVIDUAL_WORKS = "/individual/works/",
	TEACHER_ACCOUNTING = "/teacher/accounting/",
}

export const TeacherJournal: React.FC<TeacherJournalProps> = (
	props: TeacherJournalProps
) => {
	const history = useHistory();
	const [userInfo, setUserInfo] = useState<User | undefined>(undefined);

	useEffect(() => {
		ConnectionManager.getInstance().registerResponseOnceHandler(
			RequestType.GET_USER_INFO,
			(data) => {
				const dataMessage = data as RequestMessage<User>;
				if (dataMessage.requestCode === RequestCode.RES_CODE_INTERNAL_ERROR) {
					console.log(`Error: ${dataMessage.requestCode}`);
					return;
				}
				console.log("receive", dataMessage.data);

				setUserInfo(dataMessage.data);
			}
		);
		ConnectionManager.getInstance().emit(
			RequestType.GET_USER_INFO,
			props.userId
		);
	}, []);

	if (userInfo === undefined) {
		return <Spin></Spin>;
	}

	return (
		<div>
			<Typography.Title level={3} className="swing-in-top-fwd">
				{userInfo.secondName.toUpperCase()} {userInfo.firstName.toUpperCase()}
			</Typography.Title>
			<Row justify="center" align="middle">
				<div
					className={"hvr-sweep-to-right swing-in-right-fwd"}
					style={{
						height: "25vh",
						width: "25vw",
					}}
					onClick={() => {
						history.push(
							TeacherJournalHREFS.EXTRACT_CLASSES_PAGE + props.userId.toString()
						);
					}}
				>
					<Row
						align="middle"
						style={{ width: "100%", height: "100%" }}
						justify="center"
					>
						Витяг з розкладу занять
					</Row>
				</div>
				<div
					className={"hvr-sweep-to-left swing-in-right-fwd"}
					style={{
						height: "25vh",
						width: "25vw",
					}}
					onClick={() => {
						history.push(
							TeacherJournalHREFS.TRAINING_GROUPS_PAGE + props.userId.toString()
						);
					}}
				>
					<Row
						align="middle"
						style={{ width: "100%", height: "100%" }}
						justify="center"
					>
						Списки навчальних груп
					</Row>
				</div>
			</Row>
			<Row justify="center">
				<div
					className={"hvr-sweep-to-right swing-in-right-fwd"}
					style={{
						height: "25vh",
						width: "25vw",
					}}
					onClick={() => {
						history.push(
							TeacherJournalHREFS.INDIVIDUAL_WORKS + props.userId.toString()
						);
					}}
				>
					<Row
						align="middle"
						style={{ width: "100%", height: "100%" }}
						justify="center"
					>
						Додаткова робота з курсантами
					</Row>
				</div>

				<div
					className={"hvr-sweep-to-left swing-in-right-fwd"}
					style={{
						height: "25vh",
						width: "25vw",
					}}
					onClick={() => {
						history.push(
							TeacherJournalHREFS.TEACHER_ACCOUNTING + props.userId.toString()
						);
					}}
				>
					<Row
						align="middle"
						style={{ width: "100%", height: "100%" }}
						justify="center"
					>
						Результати контролю за ходом підготовки та ведення обліку
					</Row>
				</div>
			</Row>
		</div>
	);
};
