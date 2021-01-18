import { PageHeader } from "antd";
import React from "react";
import { RouteComponentProps } from "react-router-dom";
import { TeacherExtractClasses } from "../teacher/TeacherExtractClasses";
import { TeacherIndividualWorks } from "../teacher/TeacherIndividualWorks";
import { BackPage } from "../ui/BackPage";

export interface ShowIndividualWorksProps {
	userId: string;
}

export const ShowIndividualWorksPage: React.FC<
	RouteComponentProps<ShowIndividualWorksProps>
> = ({ match }: RouteComponentProps<ShowIndividualWorksProps>) => {
	return (
		<div>
			<BackPage></BackPage>
			<TeacherIndividualWorks
				userId={parseInt(match.params.userId)}
			></TeacherIndividualWorks>
		</div>
	);
};
