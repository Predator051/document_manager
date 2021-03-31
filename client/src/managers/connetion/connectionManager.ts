import * as socketIo from "socket.io-client";
import { RequestType, RequestMessage, RequestCode } from "../../types/requests";
import store from "../../app/store";
import { setUserData } from "../../redux/slicers/accountSlice";
import { User } from "../../types/user";
import { message } from "antd";

enum ConnectionStatus {
	DISCONNECT,
	CONNECTING,
	CONNECTED,
}

export class ConnectionManager {
	private static instance: ConnectionManager;
	private m_socket: SocketIOClient.Socket;
	private m_registeredResponseHandler: Array<RequestType>;
	private static host: string = "http://localhost:8080";
	private clbOnConnectionStatusChange: (
		status: boolean
	) => void | undefined = undefined;

	public static getHostAndPort() {
		return this.host;
	}

	public static getStatus() {
		return this.instance.m_socket.connected;
	}

	public onConnectionStatusChange(clb: (status: boolean) => void) {
		this.clbOnConnectionStatusChange = clb;
	}

	private static connectionStatus: ConnectionStatus =
		ConnectionStatus.CONNECTED;

	private constructor(socket: SocketIOClient.Socket) {
		this.m_socket = socket;
		this.m_registeredResponseHandler = new Array<RequestType>();
	}

	private static changeConnectionStatus(newStatus: ConnectionStatus): void {
		this.connectionStatus = newStatus;
		this.onChangeConnectionStatus();
	}

	private static onChangeConnectionStatus() {
		if (this.getInstance().clbOnConnectionStatusChange) {
			this.getInstance().clbOnConnectionStatusChange(this.getStatus());
		}
		switch (this.connectionStatus) {
			case ConnectionStatus.CONNECTED: {
				// message.success("Підключено!");
				break;
			}
			case ConnectionStatus.DISCONNECT: {
				message.error("Не може підлючитися до серверу!", 5);
				this.changeConnectionStatus(ConnectionStatus.CONNECTING);
				break;
			}
			case ConnectionStatus.CONNECTING: {
				const tempFunc = () => {
					if (this.connectionStatus !== ConnectionStatus.CONNECTED) {
						message.loading({
							content: "Підключення до серверу!",
							key: "connectinMessage",
							duration: 0,
						});
						setTimeout(tempFunc, 2000);
					} else {
						message.success({
							content: "Підключено!",
							key: "connectinMessage",
							duration: 1,
						});
					}
				};
				tempFunc();
				break;
			}
		}
	}

	public static getInstance(): ConnectionManager {
		if (!ConnectionManager.instance) {
			ConnectionManager.instance = new ConnectionManager(
				socketIo.connect(this.host)
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
				// setTimeout(() => {
				// 	if (!ConnectionManager.instance.m_socket.connected) {
				// 		message.error("Не має підключення до серверу!");
				// 	}
				// }, 2000);
				this.changeConnectionStatus(ConnectionStatus.DISCONNECT);
			});
			ConnectionManager.instance.m_socket.on(
				"connect_error",
				(reason: string) => {
					// setTimeout(() => {
					// 	if (!ConnectionManager.instance.m_socket.connected) {
					// 		message.error("Не має підключення до серверу!");
					// 		message.loading("Підключення до серверу");
					// 	}
					// }, 2000);
				}
			);
			ConnectionManager.instance.m_socket.on("connect", () => {
				this.changeConnectionStatus(ConnectionStatus.CONNECTED);
			});
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
