import { PageHeader } from "antd";
import React from "react";
import { RouteComponentProps, useHistory } from "react-router-dom";
import { TeacherGroupList } from "../teacher/TeacherGroupList";
import { BackPage } from "../ui/BackPage";

export interface TrainingGroupsPageProps {
	userId: string;
}

export const TrainingGroupsPage: React.FC<
	RouteComponentProps<TrainingGroupsPageProps>
> = ({ match }: RouteComponentProps<TrainingGroupsPageProps>) => {
	const history = useHistory();
	// const me = JSON.parse(localStorage.getItem("user")) as User;

	return (
		<div>
			<BackPage></BackPage>
			<TeacherGroupList
				userId={parseInt(match.params.userId)}
			></TeacherGroupList>
		</div>
	);
};
