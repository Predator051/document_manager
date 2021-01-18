import "../../animations/text-focus-in.css";

import React from "react";
import { RouteComponentProps } from "react-router-dom";

import { TeacherExtractClasses } from "../teacher/TeacherExtractClasses";
import { BackPage } from "../ui/BackPage";

export interface ExtractClassesPageProps {
	userId: string;
}

export const ExtractClassesPage: React.FC<
	RouteComponentProps<ExtractClassesPageProps>
> = ({ match }: RouteComponentProps<ExtractClassesPageProps>) => {
	return (
		<div className="text-focus-in">
			<BackPage></BackPage>
			<TeacherExtractClasses
				userId={parseInt(match.params.userId)}
			></TeacherExtractClasses>
		</div>
	);
};
