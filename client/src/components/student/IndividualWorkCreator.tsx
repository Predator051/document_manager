import "moment/locale/uk";

import {
	Descriptions,
	Row,
	Select,
	Modal,
	Transfer,
	Typography,
	DatePicker,
	Input,
} from "antd";
import * as momentSpace from "moment";
import moment from "moment";
import React, {
	useEffect,
	useState,
	ChangeEventHandler,
	useContext,
} from "react";

import { Group } from "../../types/group";
import { ConnectionManager } from "../../managers/connetion/connectionManager";
import { RequestType, RequestMessage, RequestCode } from "../../types/requests";
import { GenerateGroupName } from "../../helpers/GroupHelper";
import { IndividualWork } from "../../types/individualWork";
import { TransferDirection } from "antd/lib/transfer";
import { Button } from "antd";
import { group } from "console";
import { YearContext } from "../../context/YearContext";

momentSpace.locale("uk");

const { Option } = Select;

interface IndividualWorkCreatorProps {
	onClose: () => void;
	onCreate: (work: IndividualWork) => void;
}

export const IndividualWorkCreator: React.FC<IndividualWorkCreatorProps> = (
	props: IndividualWorkCreatorProps
) => {
	const [groups, setGroups] = useState<Group[]>([]);
	const [selectedGroup, setSelectedGroup] = useState<Group | undefined>(
		undefined
	);

	const [targetKeys, setTargetKeys] = useState<string[]>([]);
	const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
	const [individualWork, setIndividualWork] = useState<IndividualWork>({
		content: "",
		date: new Date(),
		id: 0,
		userId: 0,
		users: [],
		groupId: 0,
	});

	const yearContext = useContext(YearContext);

	const loadAllGroups = () => {
		ConnectionManager.getInstance().registerResponseOnceHandler(
			RequestType.GET_ALL_GROUPS,
			(data) => {
				const dataMessage = data as RequestMessage<Group[]>;
				if (
					dataMessage.requestCode === RequestCode.RES_CODE_INTERNAL_ERROR ||
					dataMessage.requestCode === RequestCode.RES_CODE_NOT_AUTHORIZED
				) {
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
		width: "20%",
		backgroundColor: "#e1e3f0",
		fontSize: "large",
	};

	const descriptionItemContentStyle: React.CSSProperties = {
		width: "45%",
		backgroundColor: "#edf0fc",
		fontSize: "large",
	};

	const onGroupSelectChange = (id: number) => {
		setSelectedGroup(groups.find((gr) => gr.id === id));
	};

	const onTransferChange = (
		targetKeys: string[],
		direction: TransferDirection,
		moveKeys: string[]
	) => {
		setTargetKeys(targetKeys);
	};

	const onTransferSelectChange = (
		sourceSelectedKeys: string[],
		targetSelectedKeys: string[]
	) => {
		setSelectedKeys([...sourceSelectedKeys, ...targetSelectedKeys]);
	};

	const onContentInputChange: (
		event: React.ChangeEvent<HTMLTextAreaElement>
	) => void = ({
		target: { value },
	}: React.ChangeEvent<HTMLTextAreaElement>) => {
		setIndividualWork({ ...individualWork, content: value });
	};

	const onDateChange = (value: momentSpace.Moment) => {
		setIndividualWork({ ...individualWork, date: value.toDate() });
	};

	const onCreateButtonClick = () => {
		props.onCreate({
			content: individualWork.content,
			date: individualWork.date,
			userId: 0,
			id: 0,
			users: targetKeys.map((key) =>
				selectedGroup.users.find((u) => u.id === parseInt(key))
			),
			groupId: selectedGroup.id,
		});
	};

	return (
		<div style={{ marginTop: "1%" }}>
			<Row justify="center">
				<Descriptions title="" bordered style={{ width: "100%" }}>
					<Descriptions.Item
						label="Оберіть групу:"
						span={3}
						labelStyle={descriptionItemLabelStyle}
						contentStyle={descriptionItemContentStyle}
					>
						<Select style={{ width: "100%" }} onChange={onGroupSelectChange}>
							{groups.map((gr) => (
								<Select.Option value={gr.id}>
									{GenerateGroupName(gr)}
								</Select.Option>
							))}
						</Select>
					</Descriptions.Item>
					<Descriptions.Item
						label="Оберіть курсантів:"
						span={3}
						labelStyle={descriptionItemLabelStyle}
						contentStyle={descriptionItemContentStyle}
					>
						<Transfer
							dataSource={selectedGroup?.users
								.sort((a, b) => (a.fullname < b.fullname ? -1 : 1))
								.map((groupUser) => ({
									key: groupUser.id.toString(),
									title: groupUser.fullname,
								}))}
							render={(item) => (
								<span className="custom-item">{item.title}</span>
							)}
							listStyle={{ width: "max-content" }}
							titles={["Група:", "Індивідуальна робота з:"]}
							targetKeys={targetKeys}
							selectedKeys={selectedKeys}
							onChange={onTransferChange}
							onSelectChange={onTransferSelectChange}
							operations={["обрати", "відмінити"]}
							locale={{
								remove: "Видали",
								removeAll: "Видалити все",
								removeCurrent: "Видалити поточний",
								selectAll: "Обрати все",
								selectCurrent: "Обрати поточний",
								selectInvert: "Інвертувати обране",
								itemsUnit: "курсантів(та)",
								itemUnit: "курсант",
							}}
						></Transfer>
					</Descriptions.Item>

					<Descriptions.Item
						label="Оберіть дату індивідуальної роботи:"
						span={3}
						labelStyle={descriptionItemLabelStyle}
						contentStyle={descriptionItemContentStyle}
					>
						<DatePicker
							placeholder="Оберіть дату"
							onChange={onDateChange}
							value={moment(individualWork.date.toDateString())}
							format="DD-MM-YYYY"
						></DatePicker>
					</Descriptions.Item>
					<Descriptions.Item
						label="Введіть зміст роботи:"
						span={3}
						labelStyle={descriptionItemLabelStyle}
						contentStyle={descriptionItemContentStyle}
					>
						<Input.TextArea onChange={onContentInputChange}></Input.TextArea>
					</Descriptions.Item>
				</Descriptions>
			</Row>
			<Row justify="end" style={{ marginTop: "1%" }}>
				<Button
					type="primary"
					disabled={
						individualWork.content === "" ||
						targetKeys.length === 0 ||
						selectedGroup === undefined
					}
					size={"large"}
					onClick={onCreateButtonClick}
				>
					Додати
				</Button>
			</Row>
		</div>
	);
};
