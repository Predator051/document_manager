import { PageHeader } from "antd";
import React from "react";
import { RouteComponentProps, useHistory } from "react-router-dom";
import { TeacherGroupSubjectList } from "../teacher/TeacherGroupSubjectList";
import { BackPage } from "../ui/BackPage";

export interface TrainingGroupsPageProps {
	userId: string;
}

export const TeacherGroupsSubjectPage: React.FC<
	RouteComponentProps<TrainingGroupsPageProps>
> = ({ match }: RouteComponentProps<TrainingGroupsPageProps>) => {
	const history = useHistory();
	// const me = JSON.parse(localStorage.getItem("user")) as User;

	return (
		<div>
			<BackPage></BackPage>
			<TeacherGroupSubjectList
				userId={parseInt(match.params.userId)}
			></TeacherGroupSubjectList>
		</div>
	);
};
