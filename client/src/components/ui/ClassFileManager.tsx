import {
	Row,
	Input,
	Col,
	Button,
	Upload,
	message,
	Card,
	Table,
	TableProps,
	Typography,
	Tooltip,
} from "antd";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { UploadOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import { DraggerProps, UploadProps } from "antd/lib/upload";
import { ConnectionManager } from "../../managers/connetion/connectionManager";
import { ClassFile } from "../../types/classFile";
import { RequestType, RequestMessage, RequestCode } from "../../types/requests";
import { ColumnsType } from "antd/lib/table/interface";
import { LoadClassFile } from "../../helpers/LoadHelper";
import { DateComparer } from "../../helpers/SorterHelper";

const { Dragger } = Upload;

export interface ClassFileManagerProps {
	onSelect: (files: ClassFile[]) => void;
	occupationId: number;
	selectedFiles: ClassFile[];
	edit?: boolean;
}

interface TableData {
	id: number;
	file: ClassFile;
}

export const ClassFileManager: React.FC<ClassFileManagerProps> = (
	props: ClassFileManagerProps
) => {
	const [files, setFiles] = useState<ClassFile[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [selectedFiles, setSelectedFiles] = useState<React.ReactText[]>(
		props.selectedFiles.map((f) => f.id)
	);
	const [searchText, setSearchText] = useState<string>("");

	const loadAllFiles = () => {
		setLoading(true);
		ConnectionManager.getInstance().registerResponseOnceHandler(
			RequestType.GET_FILES_BY_OCCUPATION,
			(data) => {
				const dataMessage = data as RequestMessage<ClassFile[]>;
				if (dataMessage.requestCode === RequestCode.RES_CODE_INTERNAL_ERROR) {
					console.log(`Error: ${dataMessage.requestCode}`);
					return;
				}

				console.log("files", dataMessage.data);

				setLoading(false);
				setFiles(dataMessage.data);
			}
		);
		ConnectionManager.getInstance().emit(
			RequestType.GET_FILES_BY_OCCUPATION,
			props.occupationId
		);
	};
	useEffect(() => {
		loadAllFiles();
	}, [props.occupationId]);

	const onSearch = (value: string) => {
		setSearchText(value);
	};

	const updateFile = (file: ClassFile) => {
		ConnectionManager.getInstance().registerResponseOnceHandler(
			RequestType.UPDATE_CLASS_FILE,
			(data) => {
				const dataMessage = data as RequestMessage<any>;
				if (dataMessage.requestCode === RequestCode.RES_CODE_INTERNAL_ERROR) {
					console.log(`Error: ${dataMessage.requestCode}`);
					return;
				}

				message.success(`Файл успішно доданий`);
				loadAllFiles();
			}
		);
		ConnectionManager.getInstance().emit(RequestType.UPDATE_CLASS_FILE, file);
	};

	const uploadProps: UploadProps = {
		name: "file",
		action: ConnectionManager.getHostAndPort() + "/upload",
		onChange(info) {
			if (info.file.status !== "uploading") {
				console.log("uploading", info.file, info.fileList);
			}
			if (info.file.status === "done") {
				console.log("done");
				updateFile({
					filename: info.file.name,
					id: info.file.response.file_ids[0],
					occupation: props.occupationId,
					createAt: new Date(),
				});
			} else if (info.file.status === "error") {
				message.error(`${info.file.name} помилка при додавання файлу.`);
			}
		},
		beforeUpload: (file) => {
			const bytes = 2147483648; //2 gb in bytes

			if (file.size > bytes) return false;

			return true;
		},
	};

	const columns: ColumnsType<TableData> = [
		{
			title: "Назва файлу",
			render: (data: TableData) => {
				return <Typography.Text strong>{data.file.filename}</Typography.Text>;
			},
		},
		{
			title: "Файл додано",
			render: (data: TableData) => {
				return new Date(data.file.createAt).toLocaleDateString("uk", {
					year: "numeric",
					month: "2-digit",
					day: "2-digit",
					hour: "numeric",
					minute: "numeric",
				});
			},
			sorter: (a, b) => DateComparer(a.file.createAt, b.file.createAt),
			defaultSortOrder: "descend",
		},
		{
			title: "Дії",
			render: (data: TableData) => {
				return (
					<Button
						type={"link"}
						onClick={() => {
							LoadClassFile(data.file);
						}}
					>
						Завантажити
					</Button>
				);
			},
		},
	];

	let tableData: TableData[] = files
		.filter(
			(file) =>
				file.filename.toLowerCase().indexOf(searchText.toLowerCase()) >= 0
		)
		.map((file) => ({
			id: file.id,
			file: file,
		}));

	let additionTableProps: TableProps<TableData> = {};

	if (props.edit) {
		additionTableProps = {
			...additionTableProps,
			rowSelection: {
				type: "checkbox",
				onChange: (selectedRowKeys: React.Key[]) => {
					setSelectedFiles(selectedRowKeys);
				},
				selectedRowKeys: selectedFiles,
			},
		};
	} else {
		tableData = tableData.filter((f) =>
			props.selectedFiles.some((sf) => sf.id === f.id)
		);
	}

	return (
		<div>
			<Row>
				<Col flex="49%">
					<Input.Search
						placeholder="Пошук файлів"
						onSearch={onSearch}
						onChange={({ target: { value } }) => {
							onSearch(value);
						}}
						size="large"
						allowClear
					/>
				</Col>
				<Col flex="49%">
					{props.edit ? (
						<Tooltip title="Завантажити файл. Максимальний розмір файлу 2 гб.">
							<Upload {...uploadProps}>
								<Button icon={<UploadOutlined />} size="large">
									Завантажити файл
								</Button>
							</Upload>
						</Tooltip>
					) : (
						<div></div>
					)}
				</Col>
				<Card
					style={{ width: "100%" }}
					title={
						props.edit
							? "Раніше прикріплені файли для цього заняття:"
							: "Прикріплені файли"
					}
				>
					<Table
						{...additionTableProps}
						columns={columns}
						dataSource={tableData}
						rowKey={(data: TableData) => data.id}
						loading={loading}
						bordered
					/>
				</Card>
			</Row>
			<Row justify="end">
				<Button
					type="primary"
					onClick={() => {
						props.onSelect(
							files.filter((file) => {
								return selectedFiles.some((sf) => sf === file.id);
							})
						);
					}}
				>
					{props.edit ? "Обрати" : "ОК"}
				</Button>
			</Row>
		</div>
	);
};
