import { PageHeader, Spin } from "antd";
import React, { useEffect, useState } from "react";
import { RouteComponentProps, useHistory } from "react-router-dom";
import { ConnectionManager } from "../../managers/connetion/connectionManager";
import { ClassEvent } from "../../types/classEvent";
import { RequestCode, RequestMessage, RequestType } from "../../types/requests";
import { ClassLooker } from "../class/ClassLooker";
import { BackPage } from "../ui/BackPage";

interface ShowClassPageProps {
	id: string;
}

export const ShowClassPage: React.FC<
	RouteComponentProps<ShowClassPageProps>
> = ({ match }: RouteComponentProps<ShowClassPageProps>) => {
	const history = useHistory();
	const [classEvent, setClassEvent] = useState<ClassEvent | undefined>(
		undefined
	);

	useEffect(() => {
		ConnectionManager.getInstance().registerResponseHandler(
			RequestType.GET_CLASS_BY_ID,
			(data) => {
				const dataMessage = data as RequestMessage<ClassEvent>;
				if (dataMessage.requestCode === RequestCode.RES_CODE_INTERNAL_ERROR) {
					console.log(`Error: ${dataMessage.requestCode}`);
					return;
				}
				console.log("receive", dataMessage.data);

				setClassEvent(dataMessage.data);
			}
		);
		ConnectionManager.getInstance().emit(RequestType.GET_CLASS_BY_ID, {
			id: match.params.id,
		});
	}, []);

	if (classEvent === undefined) {
		return <Spin></Spin>;
	}

	return (
		<div>
			<BackPage></BackPage>

			<ClassLooker class={classEvent}></ClassLooker>
		</div>
	);
};
