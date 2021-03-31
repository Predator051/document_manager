import React, { useEffect, useState } from "react";
import { ConnectionManager } from "../../../managers/connetion/connectionManager";
import {
	RequestType,
	RequestMessage,
	RequestCode,
} from "../../../types/requests";
import { Post } from "../../../types/post";
import SunEditor, { buttonList } from "suneditor-react";
import "suneditor/dist/css/suneditor.min.css";
import { Button, message, Affix, Row, Spin, Skeleton, Card } from "antd";

export interface PostEditPageProps {}

export const PostEditPage: React.FC<PostEditPageProps> = (
	props: PostEditPageProps
) => {
	const [post, setPost] = useState<Post>();
	const [loading, setLoading] = useState<boolean>(true);

	const loadActualPost = () => {
		setLoading(true);
		ConnectionManager.getInstance().registerResponseOnceHandler(
			RequestType.GET_ALL_POST,
			(data) => {
				const dataMessage = data as RequestMessage<Post[]>;
				if (dataMessage.requestCode === RequestCode.RES_CODE_INTERNAL_ERROR) {
					console.log(`Error: ${dataMessage.requestCode}`);
					return;
				}

				if (dataMessage.data.length > 0) {
					console.log("in");

					setPost(
						dataMessage.data.reduce((prev, curr) =>
							new Date(prev.createAt) <= new Date(curr.createAt) ? curr : prev
						)
					);
				} else {
					setPost({
						createAt: new Date(),
						id: 0,
						post: "",
					});
				}
				setLoading(false);
			}
		);
		ConnectionManager.getInstance().emit(RequestType.GET_ALL_POST, {});
	};

	useEffect(() => {
		loadActualPost();
	}, []);

	const onSaveClick = () => {
		ConnectionManager.getInstance().registerResponseOnceHandler(
			RequestType.UPDATE_POST,
			(data) => {
				const dataMessage = data as RequestMessage<any>;
				if (dataMessage.requestCode === RequestCode.RES_CODE_INTERNAL_ERROR) {
					message.success(
						"Сталася помилка! Зверніться до системного адміністратора!"
					);
					console.log(`Error: ${dataMessage.requestCode}`);
					return;
				}

				message.success("Успішно оновлено!");
				loadActualPost();
			}
		);
		ConnectionManager.getInstance().emit(RequestType.UPDATE_POST, post);
	};

	const onPostContentChange = (existPost: Post, content: string) => {
		console.log("post", existPost);

		setPost({ ...existPost, post: content });
	};

	return (
		<div style={{ margin: "1%" }}>
			{loading ? (
				<Spin>
					<SunEditor
						lang="ua"
						setOptions={{
							height: "90vh",
							buttonList: [
								["undo", "redo"],
								["font", "fontSize", "formatBlock"],
								["paragraphStyle", "blockquote"],
								[
									"bold",
									"underline",
									"italic",
									"strike",
									"subscript",
									"superscript",
								],
								["fontColor", "hiliteColor", "textStyle"],
								["removeFormat"],
								"/",
								["outdent", "indent"],
								["align", "horizontalRule", "list", "lineHeight"],
								["table", "link", "image", "video", "audio"],
								["fullScreen", "showBlocks", "codeView"],
								["preview", "print"],
								["save", "template"],
							],
						}}
					/>
				</Spin>
			) : (
				<Card
					title="Редагувати правила ведення журналу"
					style={{ height: "auto" }}
				>
					<SunEditor
						width="100%"
						setContents={post?.post}
						onChange={onPostContentChange.bind(null, post)}
						lang="ua"
						setOptions={{
							height: "90vh",
							buttonList: [
								["undo", "redo"],
								["font", "fontSize", "formatBlock"],
								["paragraphStyle", "blockquote"],
								[
									"bold",
									"underline",
									"italic",
									"strike",
									"subscript",
									"superscript",
								],
								["fontColor", "hiliteColor", "textStyle"],
								["removeFormat"],
								"/",
								["outdent", "indent"],
								["align", "horizontalRule", "list", "lineHeight"],
								["table", "link", "image", "video", "audio"],
								["fullScreen", "showBlocks", "codeView"],
								["preview", "print"],
								["save", "template"],
							],
						}}
					/>
				</Card>
			)}

			<Affix offsetBottom={50}>
				<Row justify="end" style={{ marginRight: "5vw" }}>
					<Button
						type="primary"
						onClick={onSaveClick}
						loading={loading}
						size="middle"
					>
						Зберегти
					</Button>
				</Row>
			</Affix>
		</div>
	);
};
