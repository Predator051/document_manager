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
	HOW_TO_PAGE = "/howto/",
	TEACHER_GROUPS_SUBJECT_PAGE = "/groups/subject/list/",
	TEACHER_GROUPS_NORM_PAGE = "/groups/norm/list/",
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

	const divStyle: React.CSSProperties = {
		height: "30vh",
		width: "30vw",
		// backgroundColor: "#2988E2",
		borderRadius: "5px",
		margin: "5px",
	};

	return (
		<div>
			<Typography.Title level={3} className="swing-in-top-fwd">
				{userInfo.secondName.toUpperCase()} {userInfo.firstName.toUpperCase()}
			</Typography.Title>
			<Row justify="center" align="middle">
				<div
					className={"add_text_shadow swing-in-right-fwd"}
					style={divStyle}
					onClick={() => {
						history.push(TeacherJournalHREFS.HOW_TO_PAGE);
					}}
				>
					<Row
						align="middle"
						style={{ width: "100%", height: "100%" }}
						justify="center"
					>
						Правила ведення журналу
					</Row>
				</div>
				<div
					className={"add_text_shadow swing-in-right-fwd"}
					style={divStyle}
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
					className={"add_text_shadow swing-in-right-fwd"}
					style={divStyle}
					onClick={() => {
						history.push(
							TeacherJournalHREFS.TEACHER_GROUPS_SUBJECT_PAGE +
								props.userId.toString()
						);
					}}
				>
					<Row
						align="middle"
						style={{ width: "100%", height: "100%" }}
						justify="center"
					>
						Облік проведення занять з предметів підготовки
					</Row>
				</div>
			</Row>
			<Row justify="center">
				<div
					className={"add_text_shadow swing-in-right-fwd"}
					style={divStyle}
					onClick={() => {
						history.push(
							TeacherJournalHREFS.TEACHER_GROUPS_NORM_PAGE +
								props.userId.toString()
						);
					}}
				>
					<Row
						align="middle"
						style={{ width: "100%", height: "100%" }}
						justify="center"
					>
						Облік виконання нормативів з предметів підготовки
					</Row>
				</div>
				<div
					className={"add_text_shadow swing-in-right-fwd"}
					style={divStyle}
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
					className={"add_text_shadow swing-in-right-fwd"}
					style={divStyle}
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
