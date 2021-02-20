import "moment/locale/uk";

import { EditOutlined, QuestionCircleOutlined } from "@ant-design/icons";
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
	Switch,
	message,
	Spin,
	Space,
	Tooltip,
} from "antd";
import DatePickerLocal from "antd/es/date-picker/locale/uk_UA";
import * as momentSpace from "moment";
import moment from "moment";
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
import { ObjectStatus } from "../../../types/constants";
import { MRS } from "../../../types/mrs";

momentSpace.locale("uk");

const { Option } = Select;

interface GroupManipulatorProps {
	onClose: () => void;
	onCreate: (group: Group) => void;
	onExist: (existGroup: Group, enteredGroup: Group) => void;
	group?: Group;
	archiveButton?: boolean;
	createText?: string;
	visibleMode?: boolean;
}

export const GroupManipulator: React.FC<GroupManipulatorProps> = (
	props: GroupManipulatorProps
) => {
	const [userGroups, setUserGroups] = useState<GroupUser[]>(
		props.group ? props.group.users : []
	);
	const [group, setGroup] = useState<Group>(
		props.group ? props.group : CreateEmptyGroup()
	);
	const [groupTraining, setGroupTraining] = useState<GroupTraining[]>([]);
	const [selectTrainingType, setSelectTrainingType] = useState<number>(
		group.trainingType.id
	);
	const [mrss, setMrss] = useState<MRS[]>([]);

	const [isExistLoader, setIsExistLoader] = useState<boolean>(false);

	const [mrsLoading, setMRSLoadings] = useState<boolean>(true);
	const [
		groupTrainingTypeLoading,
		setGroupTrainingTypeLoadings,
	] = useState<boolean>(true);

	const [fileUploaderEncoding, setFileUploaderEncoding] = useState<string>(
		"windows-1251"
	);
	const [isGroupHasActivity, setIsGroupHasActivity] = useState<boolean>(false);

	useEffect(() => {
		ConnectionManager.getInstance().registerResponseOnceHandler(
			RequestType.GET_ALL_GROUPS_TRAINING_TYPES,
			(data) => {
				const dataMessage = data as RequestMessage<GroupTraining[]>;
				if (dataMessage.requestCode === RequestCode.RES_CODE_INTERNAL_ERROR) {
					console.log(`Error: ${dataMessage.requestCode}`);
					return;
				}

				setGroupTraining(dataMessage.data);
				setGroupTrainingTypeLoadings(false);
			}
		);
		ConnectionManager.getInstance().emit(
			RequestType.GET_ALL_GROUPS_TRAINING_TYPES,
			{}
		);
		ConnectionManager.getInstance().registerResponseOnceHandler(
			RequestType.GET_ALL_MRS,
			(data) => {
				const dataMessage = data as RequestMessage<MRS[]>;
				if (dataMessage.requestCode === RequestCode.RES_CODE_INTERNAL_ERROR) {
					console.log(`Error: ${dataMessage.requestCode}`);
					return;
				}

				setMrss(dataMessage.data);
				setMRSLoadings(false);
			}
		);
		ConnectionManager.getInstance().emit(RequestType.GET_ALL_MRS, {});

		ConnectionManager.getInstance().registerResponseOnceHandler(
			RequestType.IS_GROUP_HAS_ACTIVITY,
			(data) => {
				const dataMessage = data as RequestMessage<boolean>;
				if (dataMessage.requestCode === RequestCode.RES_CODE_INTERNAL_ERROR) {
					console.log(`Error: ${dataMessage.requestCode}`);
					return;
				}
				setIsGroupHasActivity(dataMessage.data);
			}
		);
		if (props.group)
			ConnectionManager.getInstance().emit(
				RequestType.IS_GROUP_HAS_ACTIVITY,
				props.group.id
			);
	}, []);

	if (mrsLoading || groupTrainingTypeLoading) {
		return <Spin size="large"></Spin>;
	}

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
			id: Math.floor(Math.random() * (10000000 - 1) + 1),
			birthday: "ПУСТО",
			education: "ПУСТО",
			fullname: "ПУСТО",
			groupId: 0,
			rank: "ПУСТО",
		};

		setUserGroups([...userGroups, newGroupUser]);
	};

	const onChangeYear = (data: momentSpace.Moment) => {
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

	const onChangeMRSType = (value: number) => {
		setGroup({
			...group,
			mrs: mrss.find((mrs) => mrs.id === value),
		});
	};

	const checkGroupParams = () => {
		if (userGroups.length <= 0) {
			return false;
		}

		if (group.year === 0) {
			return false;
		}

		switch (group.trainingType.type) {
			case GroupTrainingType.PROFESSIONAL_CONTRACT: {
				if (group.cycle === 0) return false;
				break;
			}

			case GroupTrainingType.PROFESSIONAL_SERGEANTS: {
				if (group.quarter === 0) return false;
				break;
			}

			default: {
			}
		}

		if (group.trainingType.type !== GroupTrainingType.COURSE) {
			if (group.platoon === 0) return false;
			if (group.company === 0) return false;
		}

		if (group.mrs.id === 0) return false;

		return true;
	};

	const onCreate = () => {
		ConnectionManager.getInstance().registerResponseOnceHandler(
			RequestType.CHECK_GROUP_EXIST,
			(data) => {
				const dataMessage = data as RequestMessage<
					[boolean, Group | undefined]
				>;
				setIsExistLoader(false);
				if (dataMessage.requestCode === RequestCode.RES_CODE_INTERNAL_ERROR) {
					console.log(`Error: ${dataMessage.requestCode}`);
					return;
				}

				if (
					dataMessage.data[0] &&
					((dataMessage.data[1].id !== group.id && group.id !== 0) || //if edit
						(dataMessage.data[0] && group.id === 0)) //if create
				) {
					props.onExist(dataMessage.data[1], {
						...group,
						users: userGroups,
					});
				} else {
					props.onCreate({
						...group,
						users: userGroups,
					});
				}
			}
		);

		setIsExistLoader(true);
		ConnectionManager.getInstance().emit(RequestType.CHECK_GROUP_EXIST, group);
	};

	const onChangeEncoding = (value: string) => {
		setFileUploaderEncoding(value);
	};

	const onUserGroupDelete = (guId: number) => {
		console.log("on delete", guId);

		const deleteGU = userGroups.find((ug) => ug.id === guId);

		ConnectionManager.getInstance().registerResponseOnceHandler(
			RequestType.DELETE_GROUP_USER,
			(data) => {
				const dataMessage = data as RequestMessage<boolean>;
				if (
					dataMessage.requestCode === RequestCode.RES_CODE_INTERNAL_ERROR &&
					!dataMessage.data
				) {
					console.log(`Error: ${dataMessage.requestCode}`);
					return;
				}

				setUserGroups([...userGroups.filter((ug) => ug.id !== guId)]);
				message.success("Користувача успішно видалено!");
			}
		);
		ConnectionManager.getInstance().emit(
			RequestType.DELETE_GROUP_USER,
			deleteGU.id
		);
	};

	return (
		<div style={{ marginTop: "1%" }}>
			<Row justify="center">
				<Descriptions title="" bordered style={{ width: "100%" }}>
					<Descriptions.Item
						label={
							props.visibleMode ? "Вид підготовки" : "Введіть вид підготовки:"
						}
						span={3}
						labelStyle={descriptionItemLabelStyle}
						contentStyle={descriptionItemContentStyle}
					>
						{props.visibleMode ? (
							groupTraining.find((gt) => gt.id === selectTrainingType).content
						) : (
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
						)}
					</Descriptions.Item>
					{group.trainingType.type ===
						GroupTrainingType.PROFESSIONAL_CONTRACT && (
						<Descriptions.Item
							label={props.visibleMode ? "Цикл" : "Оберіть цикл:"}
							span={3}
							labelStyle={descriptionItemLabelStyle}
							contentStyle={descriptionItemContentStyle}
						>
							{props.visibleMode ? (
								group.cycle
							) : (
								<Select
									defaultValue={undefined}
									style={{ width: "100%" }}
									onChange={onChangeCicle}
									value={group.cycle}
								>
									{[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((cicle) => (
										<Option key={cicle.toString()} value={cicle}>
											{cicle}
										</Option>
									))}
								</Select>
							)}
						</Descriptions.Item>
					)}
					{group.trainingType.type ===
						GroupTrainingType.PROGESSIONAL_CONSCRIPT && (
						<Descriptions.Item
							label={props.visibleMode ? "Призов" : "Оберіть призов:"}
							span={3}
							labelStyle={descriptionItemLabelStyle}
							contentStyle={descriptionItemContentStyle}
						>
							{props.visibleMode ? (
								ConstripAppealToString(group.appeal)
							) : (
								<Select
									style={{ width: "100%" }}
									onChange={onChangeAppeal}
									value={group.appeal}
								>
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
							)}
						</Descriptions.Item>
					)}
					{group.trainingType.type ===
						GroupTrainingType.PROFESSIONAL_SERGEANTS && (
						<Descriptions.Item
							label={props.visibleMode ? "Квартал" : "Оберіть квартал:"}
							span={3}
							labelStyle={descriptionItemLabelStyle}
							contentStyle={descriptionItemContentStyle}
						>
							{props.visibleMode ? (
								group.quarter
							) : (
								<Select
									style={{ width: "100%" }}
									onChange={onChangeQuater}
									value={group.quarter}
								>
									{[1, 2, 3, 4].map((kv) => (
										<Option value={kv}>{kv.toString()}</Option>
									))}
								</Select>
							)}
						</Descriptions.Item>
					)}
					<Descriptions.Item
						label={props.visibleMode ? "Рік" : "Оберіть рік:"}
						span={3}
						labelStyle={descriptionItemLabelStyle}
						contentStyle={descriptionItemContentStyle}
					>
						{props.visibleMode ? (
							group.year
						) : (
							<DatePicker
								style={{ width: "100%" }}
								picker="year"
								locale={DatePickerLocal}
								onChange={onChangeYear}
								format="YYYY"
								value={moment(new Date(group.year, 1, 1))}
							></DatePicker>
						)}
					</Descriptions.Item>
					<Descriptions.Item
						label={props.visibleMode ? "Рота" : "Оберіть роту:"}
						span={3}
						labelStyle={descriptionItemLabelStyle}
						contentStyle={descriptionItemContentStyle}
					>
						{props.visibleMode ? (
							group.company
						) : (
							<Select
								style={{ width: "100%" }}
								onChange={onChangeCompany}
								value={group.company}
							>
								{group.trainingType.type === GroupTrainingType.COURSE && (
									<Option key={0} value={0}>
										{0}
									</Option>
								)}

								{[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((cicle) => (
									<Option key={cicle.toString()} value={cicle}>
										{cicle}
									</Option>
								))}
							</Select>
						)}
					</Descriptions.Item>
					<Descriptions.Item
						label={props.visibleMode ? "Взвод" : "Оберіть взвод:"}
						span={3}
						labelStyle={descriptionItemLabelStyle}
						contentStyle={descriptionItemContentStyle}
					>
						{props.visibleMode ? (
							group.platoon
						) : (
							<Select
								defaultValue={undefined}
								style={{ width: "100%" }}
								onChange={onChangePlatoon}
								value={group.platoon}
							>
								{group.trainingType.type === GroupTrainingType.COURSE && (
									<Option key={0} value={0}>
										{0}
									</Option>
								)}
								{[1, 2, 3, 4, 5].map((cicle) => (
									<Option key={cicle.toString()} value={cicle}>
										{cicle}
									</Option>
								))}
							</Select>
						)}
					</Descriptions.Item>
					<Descriptions.Item
						label={props.visibleMode ? "ВОС" : "Оберіть ВОС:"}
						span={3}
						labelStyle={descriptionItemLabelStyle}
						contentStyle={descriptionItemContentStyle}
					>
						{props.visibleMode ? (
							mrss.find((mrs) => mrs.id === group.mrs.id).number
						) : (
							<Select
								style={{ width: "100%" }}
								onChange={onChangeMRSType}
								value={group.mrs.id}
							>
								{mrss.map((mrs) => (
									<Option value={mrs.id}>{mrs.number}</Option>
								))}
							</Select>
						)}
					</Descriptions.Item>
					{props.archiveButton && (
						<Descriptions.Item
							label={
								<Typography.Text type="danger">
									Чи актуальная група:
								</Typography.Text>
							}
							span={3}
							labelStyle={descriptionItemLabelStyle}
							contentStyle={descriptionItemContentStyle}
						>
							<Switch
								onChange={(checked) => {
									setGroup({
										...group,
										status: checked
											? ObjectStatus.NORMAL
											: ObjectStatus.ARCHIVE,
									});
								}}
								checked={group.status === ObjectStatus.NORMAL}
								title={"Чи актуальна група"}
								checkedChildren="Так"
								unCheckedChildren="Ні"
								style={{
									marginLeft: "1%",
								}}
							></Switch>
						</Descriptions.Item>
					)}
				</Descriptions>
			</Row>
			{!props.visibleMode ? (
				<Row style={{ marginTop: "1%" }}>
					<Col flex="auto">
						<Typography.Title level={2}>Заповнити список:</Typography.Title>
					</Col>
					{!isGroupHasActivity && (
						<Col flex="auto" style={{ padding: "3px" }}>
							<Space>
								<GroupUserUploader
									onLoaded={(ug) =>
										setUserGroups(
											ug.sort((a, b) => a.fullname.localeCompare(b.fullname))
										)
									}
									encoding={fileUploaderEncoding}
								></GroupUserUploader>
								<Select
									style={{ minWidth: "150px" }}
									defaultValue={fileUploaderEncoding}
									onChange={onChangeEncoding}
								>
									<Select.Option value="utf8">utf-8</Select.Option>
									<Select.Option value="windows-1251">
										windows-1251
									</Select.Option>
								</Select>
								<Tooltip title="Кодування csv-файлу.">
									<QuestionCircleOutlined />
								</Tooltip>
							</Space>
						</Col>
					)}

					<Col flex="auto" style={{ padding: "3px" }}>
						<Button onClick={onClickAddGroupUser}>Додати учня</Button>
					</Col>
				</Row>
			) : (
				<></>
			)}

			<EditableGroupTable
				userGroups={userGroups}
				editUsers={!props.visibleMode}
				isCanDelete={!isGroupHasActivity}
				onDelete={onUserGroupDelete}
			></EditableGroupTable>
			<Row style={{ marginTop: "1%" }}>
				<Col flex="50%"></Col>
				<Col flex="50%">
					<Row justify="end">
						<Button
							type={"primary"}
							onClick={onCreate}
							disabled={!checkGroupParams()}
							loading={isExistLoader}
						>
							{props.createText ? props.createText : "Створити"}
						</Button>
					</Row>
				</Col>
			</Row>
		</div>
	);
};
