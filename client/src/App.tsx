import React, { useState, useEffect } from "react";
import "./App.css";
import "antd/dist/antd.css";
import { BrowserRouter as Router } from "react-router-dom";
import { Site } from "./components/site/Site";
import { ConnectionManager } from "./managers/connetion/connectionManager";
import { RequestType, RequestMessage, RequestCode } from "./types/requests";
import { Spin, Row, Col } from "antd";
//import Background from "./25928.jpg";
import { User } from "./types/user";

function App() {
	// const [initCompleted, setInitComplited] = useState<boolean>(false);
	// useEffect(() => {
	// 	ConnectionManager.getInstance().registerResponseOnceHandler(
	// 		RequestType.INIT,
	// 		(data) => {
	// 			const dataMessage = data as RequestMessage<User>;
	// 			if (dataMessage.requestCode === RequestCode.RES_CODE_INTERNAL_ERROR) {
	// 				console.log(`Error: ${dataMessage.requestCode}`);
	// 				return;
	// 			}

	// 			setInitComplited(true);
	// 		}
	// 	);
	// 	ConnectionManager.getInstance().emit(RequestType.INIT, {});
	// }, []);
	// console.log("render main");

	return (
		<div>
			{/* {initCompleted ? ( */}
			<Router>
				<Site></Site>
			</Router>
			{/* // ) : (
			// 	<Row justify="center" align="middle" style={{ height: "100vh" }}>
			// 		<Col>
			// 			<Spin size="large"></Spin>
			// 		</Col>
			// 	</Row>
			// )} */}
		</div>
	);
}

export default App;
