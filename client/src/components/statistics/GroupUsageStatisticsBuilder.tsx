import React, { useEffect, useState, useContext } from "react";
import { Group } from "../../types/group";
import { ClassEvent } from "../../types/classEvent";
import { NormProcess } from "../../types/normProcess";
import { IndividualWork } from "../../types/individualWork";

import { Line, Bar, Scatter } from "@ant-design/charts";
import { YearContext } from "../../context/YearContext";
import { ConnectionManager } from "../../managers/connetion/connectionManager";
import { RequestType, RequestMessage, RequestCode } from "../../types/requests";
import { Spin, Row, Badge } from "antd";
import { group } from "console";
import { ScatterConfig } from "@ant-design/charts/es/scatter";

import ReactDOMServer from "react-dom/server";

export interface GroupUsageStatisticsBuilderProps {
	group: Group;
}

enum StatisticsCategory {
	CLASSES = "Заняття",
	NORMS = "Нормативи",
}

interface StatisticData {
	date: string;
	value: number;
	category: StatisticsCategory;
}

export const GroupUsageStatisticsBuilder: React.FC<GroupUsageStatisticsBuilderProps> = (
	props: GroupUsageStatisticsBuilderProps
) => {
	const [classEvents, setClassEvents] = useState<ClassEvent[]>([]);
	const [normProcesses, setNormProcesses] = useState<NormProcess[]>([]);
	const [loading, setLoading] = useState<{
		classEventLoading: boolean;
		normProcessLoading: boolean;
	}>({
		classEventLoading: true,
		normProcessLoading: true,
	});
	const yearContext = useContext(YearContext);

	useEffect(() => {
		setLoading({ classEventLoading: true, normProcessLoading: true });
		ConnectionManager.getInstance().registerResponseOnceHandler(
			RequestType.GET_CLASS_BY_GROUP,
			(data) => {
				const dataMessage = data as RequestMessage<ClassEvent[]>;
				if (dataMessage.requestCode === RequestCode.RES_CODE_INTERNAL_ERROR) {
					console.log(`Error: ${dataMessage.requestCode}`);
					return;
				}
				dataMessage.data.forEach((ce) => {
					ce.date = new Date(ce.date);
				});

				setClassEvents(dataMessage.data);
				setLoading({ ...loading, classEventLoading: false });
			}
		);
		ConnectionManager.getInstance().emit(RequestType.GET_CLASS_BY_GROUP, {
			groupId: props.group.id,
			year: yearContext.year,
		});
		ConnectionManager.getInstance().registerResponseOnceHandler(
			RequestType.GET_NORM_PROCESSES_BY_GROUP,
			(data) => {
				const dataMessage = data as RequestMessage<NormProcess[]>;
				if (
					dataMessage.requestCode === RequestCode.RES_CODE_INTERNAL_ERROR &&
					dataMessage.data.length < 1
				) {
					console.log(`Error: ${dataMessage.requestCode}`);
					return;
				}
				console.log("recived processes", dataMessage.data);

				dataMessage.data.forEach((normP) => {
					normP.date = new Date(normP.date);
					normP.marks = normP.marks.filter(
						(mark) =>
							props.group.users.findIndex((u) => u.id === mark.userId) > -1
					);
				});
				setNormProcesses(
					dataMessage.data.sort((a, b) => (a.date < b.date ? -1 : 1))
				);
				setLoading({ ...loading, normProcessLoading: false });
			}
		);
		ConnectionManager.getInstance().emit(
			RequestType.GET_NORM_PROCESSES_BY_GROUP,
			{
				groupId: props.group.id,
				year: yearContext.year,
			}
		);
	}, [props.group]);

	// if (loading.classEventLoading || loading.normProcessLoading) {
	// 	return <Spin></Spin>;
	// }

	let data: StatisticData[] = [];

	classEvents.forEach((ce) => {
		data.push({
			category: StatisticsCategory.CLASSES,
			date: ce.date.toString(),
			value: ce.presences.reduce((prev, curr) => {
				return (
					prev +
					(curr.mark.current > 0 || curr.mark.subject > 0 || curr.mark.topic > 0
						? 1
						: 0)
				);
			}, 0),
		});
	});

	normProcesses.forEach((np) => {
		data.push({
			category: StatisticsCategory.NORMS,
			date: np.date.toString(),
			value: np.marks
				.filter(
					(mark) =>
						props.group.users.findIndex((u) => u.id === mark.userId) > -1
				)
				.reduce((prev, curr) => {
					return prev + (curr.mark > 0 ? 1 : 0);
				}, 0),
		});
	});

	data = data.sort((a, b) => (new Date(a.date) < new Date(b.date) ? -1 : 1));

	data.forEach((d) => {
		d.date = new Date(d.date).toLocaleDateString("uk", {
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
		});
	});

	var config: ScatterConfig = {
		appendPadding: 10,
		data: data,
		xField: "date",
		yField: "value",
		shape: "circle",
		colorField: "category",
		color: ({ category }: any) => {
			if (category === StatisticsCategory.CLASSES) {
				return "red";
			}
			return "green";
		},
		sizeField: "value",
		size: ({ value }: any) => {
			if (value <= 3) {
				return value + 8;
			}

			return value + 4;
		},
		tooltip: {
			showCrosshairs: true,
			customContent: (title, data: any[]) => {
				const valueObj = data.find((d) => d.name === "value");
				const categoryObj = data.find((d) => d.name === "category");
				const dateObj = data.find((d) => d.name === "date");

				if (valueObj && categoryObj && dateObj) {
					const htmlString = ReactDOMServer.renderToStaticMarkup(
						<div style={{ padding: "10px" }}>
							<Row style={{ padding: "3px" }}>
								<Badge
									color={valueObj.color}
									text={`Кількість оцінок: ${valueObj.value}`}
								></Badge>
							</Row>
							<Row style={{ padding: "3px" }}>
								<Badge
									color={categoryObj.color}
									text={`${categoryObj.value}`}
								></Badge>
							</Row>
							<Row style={{ padding: "3px" }}>
								<Badge
									color={dateObj.color}
									text={`Дата: ${dateObj.value}`}
								></Badge>
							</Row>
						</div>
					);

					return htmlString;
				}
				return "";
			},
		},
		// yAxis: {
		// 	nice: true,
		// 	line: { style: { stroke: "#aaa" } },
		// },
		// xAxis: {
		// 	min: -100,
		// 	grid: { line: { style: { stroke: "#eee" } } },
		// 	line: { style: { stroke: "#aaa" } },
		// },
	};

	return (
		<div>
			{/* <Line
				data={data}
				// isGroup={true}
				xField="date"
				yField="value"
				seriesField="category"
				color={["#1979C9", "#D62A0D", "#FAA219"]}
				point={{
					shape: (_ref: any) => {
						var category = _ref.category;
						return category === StatisticsCategory.CLASSES
							? "square"
							: "circle";
					},
				}}
				tooltip={{
					showCrosshairs: false,
				}}
				isStack={true}
			></Line> */}
			<Scatter {...config}></Scatter>
		</div>
	);
};
