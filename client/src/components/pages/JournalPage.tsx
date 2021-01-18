import { PageHeader } from "antd";
import React from "react";
import { User } from "../../types/user";
import { TeacherJournal } from "../teacher/TeacherJournal";
import { RouteComponentProps } from "react-router-dom";
import { BackPage } from "../ui/BackPage";

interface JournalPageProps {
	id: string;
}

export const JournalPage: React.FC<RouteComponentProps<JournalPageProps>> = ({
	match,
}: RouteComponentProps<JournalPageProps>) => {
	console.log("match", match);

	return (
		<div>
			<BackPage></BackPage>
			<TeacherJournal userId={parseInt(match.params.id)}></TeacherJournal>
		</div>
	);
};
