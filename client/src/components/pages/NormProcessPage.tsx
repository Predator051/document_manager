import { Button, Col, DatePicker, Descriptions, Row, Select } from "antd";
import React, { useEffect, useState, useContext } from "react";
import { GenerateGroupName } from "../../helpers/GroupHelper";
import { ConnectionManager } from "../../managers/connetion/connectionManager";
import { Group } from "../../types/group";
import { RequestCode, RequestMessage, RequestType } from "../../types/requests";
import { NormGroupProcessShower } from "../norm/NormGroupProcessShower";
import { NormInfoDrawer } from "../norm/NormInfoDrawer";
import { YearContext } from "../../context/YearContext";
import { BackPage } from "../ui/BackPage";

export const NormProcessPage: React.FC = () => {
	const [rerender, setRerender] = useState<boolean>(false);
	const [groups, setGroups] = useState<Group[]>([]);
	const [normInfoDrawerVisible, setNormInfoDrawerVisible] = useState<boolean>(
		false
	);
	const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
	const [selectedGroup, setSelectedGroup] = useState<Group | undefined>(
		undefined
	);
	const yearContext = useContext(YearContext);

	const loadAllGroups = () => {
		ConnectionManager.getInstance().registerResponseOnceHandler(
			RequestType.GET_ALL_GROUPS,
			(data) => {
				const dataMessage = data as RequestMessage<Group[]>;
				if (dataMessage.requestCode === RequestCode.RES_CODE_INTERNAL_ERROR) {
					console.log(`Error: ${dataMessage.requestCode}`);
					return;
				}

				setGroups(dataMessage.data);
			}
		);
		ConnectionManager.getInstance().emit(RequestType.GET_ALL_GROUPS, {
			year: yearContext.year,
		});
	};

	useEffect(() => {
		loadAllGroups();
	}, []);

	const descriptionItemLabelStyle: React.CSSProperties = {
		width: "45%",
		backgroundColor: "#e1e3f0",
		fontSize: "large",
	};

	const descriptionItemContentStyle: React.CSSProperties = {
		width: "45%",
		backgroundColor: "#edf0fc",
		fontSize: "large",
	};

	const onGroupChange = (value: number) => {
		setSelectedGroup(groups.find((gr) => gr.id === value));
		setRerender(!rerender);
	};

	const onDateChange = (date: moment.Moment) => {
		if (date && date.isValid()) {
			setSelectedDate(date.toDate());
		} else {
			setSelectedDate(undefined);
		}
	};
	return (
		<div>
			<BackPage></BackPage>
			<Row style={{ marginTop: "1%" }} className="swing-in-top-fwd">
				<Col flex={"50%"}>
					<Descriptions bordered style={{ width: "100%" }}>
						<Descriptions.Item
							label="Оберіть групу"
							span={3}
							labelStyle={descriptionItemLabelStyle}
							contentStyle={descriptionItemContentStyle}
						>
							<Select style={{ width: "100%" }} onChange={onGroupChange}>
								{groups.map((gr) => (
									<Select.Option value={gr.id}>
										{gr.id} {GenerateGroupName(gr)}
									</Select.Option>
								))}
							</Select>
						</Descriptions.Item>
						<Descriptions.Item
							label="Оберіть дату"
							span={3}
							labelStyle={descriptionItemLabelStyle}
							contentStyle={descriptionItemContentStyle}
						>
							<DatePicker
								style={{ width: "100%" }}
								onChange={onDateChange}
								format="DD-MM-YYYY"
							></DatePicker>
						</Descriptions.Item>
					</Descriptions>
				</Col>
				<Col flex="auto">
					<Button
						type="dashed"
						onClick={() => {
							setNormInfoDrawerVisible(true);
						}}
						style={{ height: "100%", width: "100%" }}
					>
						Переглянуты чи додати нормативи
					</Button>
				</Col>
			</Row>
			{selectedDate && selectedGroup && (
				<NormGroupProcessShower
					date={selectedDate}
					group={selectedGroup}
					rerender={rerender}
				></NormGroupProcessShower>
			)}

			<NormInfoDrawer
				visible={normInfoDrawerVisible}
				onClose={() => {
					setNormInfoDrawerVisible(false);
					setRerender(!rerender);
				}}
				editable={true}
			></NormInfoDrawer>
		</div>
	);
};
