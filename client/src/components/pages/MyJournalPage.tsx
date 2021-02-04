import { PageHeader } from "antd";
import React from "react";
import { User } from "../../types/user";
import { TeacherJournal } from "../teacher/TeacherJournal";
import { BackPage } from "../ui/BackPage";

export const MyJournalPage: React.FC = () => {
	const me = JSON.parse(localStorage.getItem("user")) as User;
	return (
		<div style={{ marginTop: "1%" }}>
			{/* <BackPage></BackPage> */}
			<TeacherJournal userId={me.id}></TeacherJournal>
		</div>
	);
};
