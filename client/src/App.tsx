import "./App.css";
import "antd/dist/antd.css";

import React, { useEffect, useState } from "react";
import { BrowserRouter as Router } from "react-router-dom";

import { Site } from "./components/site/Site";
import { YearContext } from "./context/YearContext";
import { ErrorBoundary } from "./components/site/ErrorBoundary";

function App() {
	return (
		<ErrorBoundary>
			<YearContext.Provider value={{ year: new Date().getFullYear() }}>
				<div>
					<Router>
						<Site></Site>
					</Router>
				</div>
			</YearContext.Provider>
		</ErrorBoundary>
	);
}

export default App;
