import React, { useState, useEffect } from "react";
import { BackPage } from "../ui/BackPage";
import { Post } from "../../types/post";
import { ConnectionManager } from "../../managers/connetion/connectionManager";
import { RequestType, RequestMessage, RequestCode } from "../../types/requests";
import SunEditor from "suneditor-react";
import "suneditor/dist/css/suneditor.min.css";
import Spin from "antd/lib/spin";

interface HowToPageProps {}

export const HowToPage: React.FC = () => {
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

	return (
		<div>
			<BackPage></BackPage>
			<Spin spinning={loading}>
				<SunEditor
					enable={false}
					enableToolbar={false}
					disable
					setContents={post?.post}
					lang="ua"
					setOptions={{
						height: "90vh",
						buttonList: [],
						resizingBar: false,
					}}
				/>
			</Spin>
		</div>
	);
};
