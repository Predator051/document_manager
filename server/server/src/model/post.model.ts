import { RequestCode, RequestMessage } from "../types/requests";
import { DBPostManager } from "../managers/db_post_manager";
import { Post } from "../types/post";

export class PostModel {
	public static async getAll(): Promise<RequestMessage<Post[]>> {
		const Posts = await DBPostManager.GetAll();

		return {
			data: Posts.map((pos) => pos.ToRequestObject()),
			messageInfo: `SUCCESS`,
			requestCode: RequestCode.RES_CODE_SUCCESS,
			session: "",
		};
	}

	public static async update(
		post: Post
	): Promise<RequestMessage<Post | undefined>> {
		let positionEntity = await DBPostManager.GetById(post.id);
		if (positionEntity === undefined) {
			positionEntity = DBPostManager.CreateEmptyEntity();
		}

		positionEntity.post = post.post;
		positionEntity.createAt = post.createAt;

		const res = await DBPostManager.SaveEntity(positionEntity);

		return {
			data: res?.ToRequestObject(),
			messageInfo: `SUCCESS`,
			requestCode: RequestCode.RES_CODE_SUCCESS,
			session: "",
		};
	}
}
