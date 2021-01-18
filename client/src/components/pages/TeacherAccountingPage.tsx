import { PageHeader } from "antd";
import React from "react";
import { RouteComponentProps } from "react-router-dom";
import { TeacherExtractClasses } from "../teacher/TeacherExtractClasses";
import { TeacherAccounting } from "../teacher/TeacherAccounting";
import { BackPage } from "../ui/BackPage";


export interface AccountingTeacherPageProps {
	userId: string;
}

export const AccountingTeacherPage: React.FC<
	RouteComponentProps<AccountingTeacherPageProps>
> = ({ match }: RouteComponentProps<AccountingTeacherPageProps>) => {
	return (
		<div>
			<BackPage></BackPage>
			<TeacherAccounting
				userId={parseInt(match.params.userId)}
			></TeacherAccounting>
		</div>
	);
};
