import "../../../node_modules/hover.css/css/hover.css";
import "../../animations/fade-in.css";
import "./fixes.css";

import { PageHeader, Typography } from "antd";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";

export const BackPage: React.FC = () => {
	const history = useHistory();

	return (
		<div>
			{window.history.length > 1 && (
				<div className="fade-in-left">
					<PageHeader
						onBack={() => {
							window.history.back();
						}}
						title={<Typography.Text>Назад</Typography.Text>}
					></PageHeader>
				</div>
			)}
		</div>
	);
};
