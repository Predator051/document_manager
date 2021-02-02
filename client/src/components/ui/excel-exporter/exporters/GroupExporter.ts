import { Alignment, Borders, Buffer, CellValue, Workbook, Worksheet } from 'exceljs';

import { Group } from '../../../../types/group';

const defaultHeightCoef = 16;

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
	vertical: "middle",
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

const addColumn = (sym: string, sheet: Worksheet) => {
	const colC = sheet.getColumn(sym);
	colC.width = defaultColumnWidth;
	colC.border = defaultColumnBorder;
	colC.alignment = defaultColumnAlignment;

	return colC;
};

export async function GroupExport(group: Group) {
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

	const colA = addColumn("A", sheet);
	colA.width = 5;
	const colB = addColumn("B", sheet);
	colB.width = 20;
	const colC = addColumn("C", sheet);
	colC.width = 15;
	const colD = addColumn("D", sheet);
	colD.width = 15;
	const colE = addColumn("E", sheet);
	colE.width = 15;
	var firstRow = sheet.getRow(1);
	firstRow.height = 6 * defaultHeightCoef;
	firstRow.getCell("A").value = defaultTitleText("№ з/п");
	firstRow.getCell("B").value = defaultTitleText(
		"Прізвище, ім’я та по батькові"
	);
	firstRow.getCell("C").value = defaultTitleText("Військове звання");
	firstRow.getCell("D").value = defaultTitleText("Дата народження");
	firstRow.getCell("E").value = defaultTitleText("Освіта");

	for (let i = 2; i < group.users.length + 2; i++) {
		var row = sheet.getRow(i);
		let record = group.users[i - 2];

		row.getCell("A").value = defaultText((i - 1).toString());
		row.getCell("B").value = defaultText(record.fullname);
		row.getCell("C").value = defaultText(record.rank);
		row.getCell("D").value = defaultText(record.birthday);
		row.getCell("E").value = defaultText(record.education);
		row.height = defaultHeightCoef * 2;
		row.alignment = {
			vertical: "middle",
			wrapText: true,
		};
	}

	const buffer: Promise<Buffer> = workbook.xlsx.writeBuffer();

	return buffer;
}
