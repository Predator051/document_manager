import { PageHeader } from "antd";
import React from "react";
import { RouteComponentProps, useHistory } from "react-router-dom";
import { TeacherGroupSubjectList } from "../teacher/TeacherGroupSubjectList";
import { BackPage } from "../ui/BackPage";
import { TeacherGroupNormList } from "../teacher/TeacherGroupNormList";

export interface TeacherGroupsNormPageProps {
	userId: string;
}

export const TeacherGroupsNormPage: React.FC<
	RouteComponentProps<TeacherGroupsNormPageProps>
> = ({ match }: RouteComponentProps<TeacherGroupsNormPageProps>) => {
	const history = useHistory();
	// const me = JSON.parse(localStorage.getItem("user")) as User;

	return (
		<div>
			<BackPage></BackPage>
			<TeacherGroupNormList
				userId={parseInt(match.params.userId)}
			></TeacherGroupNormList>
		</div>
	);
};
