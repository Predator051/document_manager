import React, { useContext } from "react";

export interface IYearContext {
	year: number;
}

export const YearContext = React.createContext<IYearContext>({
	year: new Date().getFullYear(),
});

export const isYearCurrent = (yearContext: IYearContext) => {
	return new Date().getFullYear() === yearContext.year;
};
