import * as socketIo from "socket.io-client";
import { RequestType, RequestMessage, RequestCode } from "../../types/requests";
import store from "../../app/store";
import { setUserData } from "../../redux/slicers/accountSlice";
import { User } from "../../types/user";
import { message } from "antd";

export class ConnectionManager {
	private static instance: ConnectionManager;
	private m_socket: SocketIOClient.Socket;
	private m_registeredResponseHandler: Array<RequestType>;

	private constructor(socket: SocketIOClient.Socket) {
		this.m_socket = socket;
		this.m_registeredResponseHandler = new Array<RequestType>();
	}

	public static getInstance(): ConnectionManager {
		if (!ConnectionManager.instance) {
			ConnectionManager.instance = new ConnectionManager(
				socketIo.connect("http://localhost:8080")
			);
			ConnectionManager.instance.m_socket.on("error", (err: string) => {
				if (err === "NOT AUTHORIZED" && window.location.pathname !== "/login") {
					console.log("NOT AUTHORIZED");

					localStorage.setItem("user", JSON.stringify(User.EmptyUser()));
					store.dispatch(setUserData(User.EmptyUser()));
					window.location.assign("/login");
				}
			});
			ConnectionManager.instance.m_socket.on("disconnect", (reason: string) => {
				setTimeout(() => {
					if (!ConnectionManager.instance.m_socket.connected) {
						message.error("Не має підключення до серверу!");
					}
				}, 2000);
			});
			ConnectionManager.instance.m_socket.on(
				"connect_error",
				(reason: string) => {
					setTimeout(() => {
						if (!ConnectionManager.instance.m_socket.connected) {
							message.error("Не має підключення до серверу!");
						}
					}, 2000);
				}
			);
		}

		return ConnectionManager.instance;
	}

	public emit(requestType: RequestType, data: any) {
		let userData = JSON.parse(localStorage.getItem("user"));
		if (userData === null || userData === undefined) {
			userData = { session: "" };
		}
		const emitData: RequestMessage<typeof data> = {
			data: data,
			messageInfo: "",
			requestCode: RequestCode.RES_CODE_SUCCESS,
			session: userData.session,
		};

		this.m_socket.emit(requestType, emitData);
	}

	public registerResponseHandler(
		requestType: RequestType,
		functionHandler: (data: any) => void
	) {
		this.m_socket.on(requestType, functionHandler);
		this.m_registeredResponseHandler.push(requestType);
	}

	public removeRegisteredHandler(requestType: RequestType, fn?: Function) {
		this.m_socket.off(requestType, fn);
	}

	public registerResponseOnceHandler(
		requestType: RequestType,
		functionHandler: (data: any) => void
	) {
		this.m_socket.once(requestType, functionHandler);
	}
}
