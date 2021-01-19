import { startOfYear, endOfYear } from "date-fns";

export const getStartEndOfYear = (year: number) => {
	const date = new Date();
	date.setFullYear(year);

	return { start: startOfYear(date), end: endOfYear(date) };
};
