import "../../../animations/fade-in.css";

import { PageHeader, Button } from "antd";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";

import { saveAs } from "file-saver";
import { DownloadOutlined } from "@ant-design/icons";
import { IndividualWorkExport } from "./exporters/IndividualWorkExporter";

import { Buffer } from "exceljs";

export interface IExcelExporterProps {
	bufferFunction: () => Promise<Buffer>;
	fileName?: string;
	title?: string;
}

export const ExcelExporter: React.FC<IExcelExporterProps> = (
	props: IExcelExporterProps
) => {
	const history = useHistory();

	const onSaveClick = async () => {
		saveAs(
			new Blob([await props.bufferFunction()], {
				type:
					"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
			}),
			props.fileName ? props.fileName + ".xlsx" : "експорт.xlsx"
		);
	};

	return (
		<div>
			<div className="fade-in-left">
				<Button
					icon={<DownloadOutlined></DownloadOutlined>}
					onClick={() => {
						onSaveClick();
					}}
					style={{ width: "100%" }}
				>
					{props.title ? props.title : "Експорт"}
				</Button>
			</div>
		</div>
	);
};
