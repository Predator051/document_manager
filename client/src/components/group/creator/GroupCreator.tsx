import "moment/locale/uk";

import { EditOutlined } from "@ant-design/icons";
import {
	Button,
	Col,
	DatePicker,
	Descriptions,
	Input,
	Modal,
	Row,
	Select,
	Typography,
} from "antd";
import DatePickerLocal from "antd/es/date-picker/locale/uk_UA";
import * as moment from "moment";
import React, { useEffect, useState } from "react";

import { ConnectionManager } from "../../../managers/connetion/connectionManager";
import {
	ConstripAppeal,
	ConstripAppealToString,
	CreateEmptyGroup,
	Group,
	GroupTraining,
	GroupTrainingType,
	MRSType,
	StandartIdByGroupTrainingType,
} from "../../../types/group";
import { GroupUser } from "../../../types/groupUser";
import {
	RequestCode,
	RequestMessage,
	RequestType,
} from "../../../types/requests";
import { EditableGroupTable } from "./GroupEditableTable";
import { GroupUserUploader } from "./GroupUploader";

moment.locale("uk");

const { Option } = Select;

interface GroupCreatorProps {
	onClose: () => void;
	onCreate: (group: Group) => void;
}

export const GroupCreator: React.FC<GroupCreatorProps> = (
	props: GroupCreatorProps
) => {
	const [userGroups, setUserGroups] = useState<GroupUser[]>([]);
	const [group, setGroup] = useState<Group>(CreateEmptyGroup());
	const [groupTraining, setGroupTraining] = useState<GroupTraining[]>([]);
	const [selectTrainingType, setSelectTrainingType] = useState<number>(
		group.trainingType.id
	);

	useEffect(() => {
		ConnectionManager.getInstance().registerResponseHandler(
			RequestType.GET_ALL_GROUPS_TRAINING_TYPES,
			(data) => {
				const dataMessage = data as RequestMessage<GroupTraining[]>;
				if (dataMessage.requestCode === RequestCode.RES_CODE_INTERNAL_ERROR) {
					console.log(`Error: ${dataMessage.requestCode}`);
					return;
				}

				setGroupTraining(dataMessage.data);
			}
		);
		ConnectionManager.getInstance().emit(
			RequestType.GET_ALL_GROUPS_TRAINING_TYPES,
			{}
		);
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

	const onClickAddGroupUser = () => {
		const newGroupUser: GroupUser = {
			id: 0,
			birthday: "ПУСТО",
			education: "ПУСТО",
			fullname: "ПУСТО",
			groupId: 0,
			rank: "ПУСТО",
		};

		setUserGroups([...userGroups, newGroupUser]);
	};

	const onChangeYear = (data: moment.Moment) => {
		setGroup({
			...group,
			year: data.toDate().getFullYear(),
		});
	};

	const onChangeTrainingType = (gtId: number) => {
		const gt = groupTraining.find((gtobj) => gtobj.id === gtId);

		if (
			gt.type === GroupTrainingType.OTHER &&
			gt.id === StandartIdByGroupTrainingType.other
		) {
			let enteredContent = "";
			const onTextChange: (
				event: React.ChangeEvent<HTMLInputElement>
			) => void = ({ target: { value } }) => {
				enteredContent = value;
			};
			const onOk = () => {
				setGroup({
					...group,
					trainingType: {
						content: enteredContent,
						id: StandartIdByGroupTrainingType.new,
						type: GroupTrainingType.OTHER,
					},
				});
				setGroupTraining([
					...groupTraining.filter(
						(gtobj) => gtobj.id !== StandartIdByGroupTrainingType.new
					),
					{
						content: enteredContent,
						id: StandartIdByGroupTrainingType.new,
						type: GroupTrainingType.OTHER,
					},
				]);
				setSelectTrainingType(StandartIdByGroupTrainingType.new);
			};
			Modal.confirm({
				okText: "Ввести",
				title: "Введіть вид підготовки",
				cancelText: "Відмінити",
				content: (
					<div style={{ marginTop: "1%" }}>
						<Input onChange={onTextChange}></Input>
					</div>
				),
				onOk: onOk,
				zIndex: 1100,
				icon: <EditOutlined />,
				closable: true,
			});
		} else {
			setGroup({
				...group,
				trainingType: gt,
			});

			setSelectTrainingType(gtId);
		}
	};

	const onChangeCicle = (value: number) => {
		setGroup({
			...group,
			cycle: value,
		});
	};
	const onChangeAppeal = (value: ConstripAppeal) => {
		setGroup({
			...group,
			appeal: value,
		});
	};
	const onChangeQuater = (value: number) => {
		setGroup({
			...group,
			quarter: value,
		});
	};
	const onChangeCompany = (value: number) => {
		setGroup({
			...group,
			company: value,
		});
	};
	const onChangePlatoon = (value: number) => {
		setGroup({
			...group,
			platoon: value,
		});
	};

	const onChangeMRSType = (value: MRSType) => {
		setGroup({
			...group,
			mrs: value,
		});
	};

	return (
		<div style={{ marginTop: "1%" }}>
			<Row justify="center">
				<Descriptions title="" bordered style={{ width: "100%" }}>
					<Descriptions.Item
						label="Введіть вид підготовки:"
						span={3}
						labelStyle={descriptionItemLabelStyle}
						contentStyle={descriptionItemContentStyle}
					>
						<Select
							style={{ width: "100%" }}
							onChange={onChangeTrainingType}
							value={selectTrainingType}
						>
							{groupTraining
								.filter((gt) => gt.id !== StandartIdByGroupTrainingType.other)
								.map((gt) => (
									<Option value={gt.id}>{gt.content}</Option>
								))}
							{groupTraining.find(
								(gt) => gt.id === StandartIdByGroupTrainingType.other
							) !== undefined && (
								<Option value={StandartIdByGroupTrainingType.other}>
									{
										groupTraining.find(
											(gt) => gt.id === StandartIdByGroupTrainingType.other
										).content
									}
								</Option>
							)}
						</Select>
					</Descriptions.Item>
					{group.trainingType.type ===
						GroupTrainingType.PROFESSIONAL_CONTRACT && (
						<Descriptions.Item
							label="Оберіть цикл:"
							span={3}
							labelStyle={descriptionItemLabelStyle}
							contentStyle={descriptionItemContentStyle}
						>
							<Select
								defaultValue={undefined}
								style={{ width: "100%" }}
								onChange={onChangeCicle}
							>
								{[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((cicle) => (
									<Option key={cicle.toString()} value={cicle}>
										{cicle}
									</Option>
								))}
							</Select>
						</Descriptions.Item>
					)}
					{group.trainingType.type ===
						GroupTrainingType.PROGESSIONAL_CONSCRIPT && (
						<Descriptions.Item
							label="Оберіть призов:"
							span={3}
							labelStyle={descriptionItemLabelStyle}
							contentStyle={descriptionItemContentStyle}
						>
							<Select style={{ width: "100%" }} onChange={onChangeAppeal}>
								{Object.keys(ConstripAppeal).map((typeStr) => (
									<Option
										value={
											ConstripAppeal[typeStr as keyof typeof ConstripAppeal]
										}
									>
										{ConstripAppealToString(
											ConstripAppeal[typeStr as keyof typeof ConstripAppeal]
										)}
									</Option>
								))}
							</Select>
						</Descriptions.Item>
					)}
					{group.trainingType.type ===
						GroupTrainingType.PROFESSIONAL_SERGEANTS && (
						<Descriptions.Item
							label="Оберіть квартал:"
							span={3}
							labelStyle={descriptionItemLabelStyle}
							contentStyle={descriptionItemContentStyle}
						>
							<Select style={{ width: "100%" }} onChange={onChangeQuater}>
								{[1, 2, 3, 4].map((kv) => (
									<Option value={kv}>{kv.toString()}</Option>
								))}
							</Select>
						</Descriptions.Item>
					)}
					<Descriptions.Item
						label="Оберіть рік:"
						span={3}
						labelStyle={descriptionItemLabelStyle}
						contentStyle={descriptionItemContentStyle}
					>
						<DatePicker
							style={{ width: "100%" }}
							picker="year"
							locale={DatePickerLocal}
							onChange={onChangeYear}
							format="DD-MM-YYYY"
						></DatePicker>
					</Descriptions.Item>
					<Descriptions.Item
						label="Оберіть роту:"
						span={3}
						labelStyle={descriptionItemLabelStyle}
						contentStyle={descriptionItemContentStyle}
					>
						<Select style={{ width: "100%" }} onChange={onChangeCompany}>
							{[1, 2, 3, 4, 5, 6, 7, 8, 9].map((cicle) => (
								<Option key={cicle.toString()} value={cicle}>
									{cicle}
								</Option>
							))}
						</Select>
					</Descriptions.Item>
					<Descriptions.Item
						label="Оберіть взвод:"
						span={3}
						labelStyle={descriptionItemLabelStyle}
						contentStyle={descriptionItemContentStyle}
					>
						<Select
							defaultValue={undefined}
							style={{ width: "100%" }}
							onChange={onChangePlatoon}
						>
							{[1, 2, 3, 4, 5].map((cicle) => (
								<Option key={cicle.toString()} value={cicle}>
									{cicle}
								</Option>
							))}
						</Select>
					</Descriptions.Item>
					<Descriptions.Item
						label="Оберіть ВОС:"
						span={3}
						labelStyle={descriptionItemLabelStyle}
						contentStyle={descriptionItemContentStyle}
					>
						<Select style={{ width: "100%" }} onChange={onChangeMRSType}>
							{Object.keys(MRSType).map((typeStr) => (
								<Option value={MRSType[typeStr as keyof typeof MRSType]}>
									{MRSType[typeStr as keyof typeof MRSType]}
								</Option>
							))}
						</Select>
					</Descriptions.Item>
				</Descriptions>
			</Row>
			<Row style={{ marginTop: "1%" }}>
				<Col flex="50%">
					<Typography.Title level={2}>Заповнити список:</Typography.Title>
				</Col>
				<Col flex="25%">
					<GroupUserUploader
						onLoaded={(ug) => setUserGroups(ug)}
					></GroupUserUploader>
				</Col>
				<Col flex="25%">
					<Button onClick={onClickAddGroupUser}>Додати учня</Button>
				</Col>
			</Row>

			<EditableGroupTable userGroups={userGroups}></EditableGroupTable>
			<Row justify="end" style={{ marginTop: "1%" }}>
				<Button
					type={"primary"}
					onClick={() => {
						props.onCreate({
							...group,
							users: userGroups,
						});
					}}
				>
					Створити
				</Button>
			</Row>
		</div>
	);
};
