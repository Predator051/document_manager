import "./App.css";
import "antd/dist/antd.css";

import "devextreme/dist/css/dx.common.css";
import "devextreme/dist/css/dx.light.css";

import React, { useEffect, useState } from "react";
import { BrowserRouter as Router } from "react-router-dom";

import { Site } from "./components/site/Site";
import { YearContext } from "./context/YearContext";
import { ErrorBoundary } from "./components/site/ErrorBoundary";

import { locale, loadMessages } from "devextreme/localization";
import ruMessages from "./localization/ru.json";

loadMessages(ruMessages);
locale("ru");

function App() {
	return (
		<ErrorBoundary>
			<YearContext.Provider value={{ year: new Date().getFullYear() }}>
				<div>
					<Router basename="/">
						<Site></Site>
					</Router>
				</div>
			</YearContext.Provider>
		</ErrorBoundary>
	);
}

export default App;
