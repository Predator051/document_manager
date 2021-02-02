import {
	Workbook,
	Buffer,
	Border,
	Borders,
	Alignment,
	CellValue,
} from "exceljs";
import { Group } from "../../../../types/group";
import { GenerateGroupName } from "../../../../helpers/GroupHelper";
import { IndividualWork } from "../../../../types/individualWork";

const defaultColumnBorder: Partial<Borders> = {
	left: {
		style: "thin",
	},
	bottom: {
		style: "thin",
	},
	right: {
		style: "thin",
	},
	top: {
		style: "thin",
	},
};

const defaultColumnAlignment: Partial<Alignment> = {
	horizontal: "center",
	wrapText: true,
};

const defaultColumnWidth: number = 30;

const defaultTitleText: (text: string) => CellValue = (text: string) => {
	return {
		richText: [
			{
				font: {
					size: 14,
					name: "Times New Roman",
					bold: true,
				},
				text: text,
			},
		],
	};
};

const defaultText: (text: string) => CellValue = (text: string) => {
	return {
		richText: [
			{
				font: {
					size: 12,
					name: "Times New Roman",
				},
				text: text,
			},
		],
	};
};

export async function IndividualWorkExport(
	groups: Group[],
	works: IndividualWork[]
) {
	const workbook = new Workbook();
	workbook.creator = "БІУС";
	workbook.created = new Date();

	workbook.views = [
		{
			x: 0,
			y: 0,
			width: 10000,
			height: 10000,
			firstSheet: 0,
			activeTab: 1,
			visibility: "visible",
		},
	];

	const sheet = workbook.addWorksheet("Індивідуальна робота");

	sheet.state = "visible";

	const colA = sheet.getColumn("A");
	colA.width = defaultColumnWidth;
	colA.border = defaultColumnBorder;
	colA.alignment = defaultColumnAlignment;
	const colB = sheet.getColumn("B");
	colB.width = defaultColumnWidth;
	colB.border = defaultColumnBorder;
	colB.alignment = defaultColumnAlignment;
	const colC = sheet.getColumn("C");
	colC.width = defaultColumnWidth;
	colC.border = defaultColumnBorder;
	colC.alignment = defaultColumnAlignment;
	var firstRow = sheet.getRow(1);
	firstRow.getCell("A").value = defaultTitleText("Навчальна група");
	firstRow.getCell("B").value = defaultTitleText("Прізвище та ініціали");
	firstRow.getCell("C").value = defaultTitleText("Дата та зміст роботи");

	for (let i = 2; i < groups.length + 2; i++) {
		var row = sheet.getRow(i);
		row.getCell("A").value = defaultText(GenerateGroupName(groups[i - 2]));
		row.getCell("B").value = defaultText(
			works[i - 2].users.reduce((prev, curr, currIndex, self) => {
				return (
					prev + curr.fullname + (self.length - 1 !== currIndex ? "\n" : "")
				);
			}, "")
		);

		row.getCell("C").value = {
			richText: [
				{
					text: "Дата: ",
					font: {
						bold: true,
						name: "Times New Roman",
						size: 12,
					},
				},
				{
					text:
						works[i - 2].date.toLocaleDateString("uk", {
							year: "2-digit",
							month: "2-digit",
							day: "2-digit",
						}) + "\n",
					font: {
						name: "Times New Roman",
						size: 12,
					},
				},
				{
					text: "Зміст: ",
					font: {
						bold: true,
						name: "Times New Roman",
						size: 12,
					},
				},
				{
					text: works[i - 2].content,
					font: {
						name: "Times New Roman",
						size: 12,
					},
				},
			],
		};
		row.height =
			works[i - 2].users.length * 16 > 32 ? works[i - 2].users.length * 16 : 32;
		row.alignment = {
			vertical: "middle",
			wrapText: true,
		};
	}

	const buffer: Promise<Buffer> = workbook.xlsx.writeBuffer();

	return buffer;
}
