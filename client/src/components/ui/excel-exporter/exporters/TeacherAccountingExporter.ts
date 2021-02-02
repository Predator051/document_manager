import { Alignment, Borders, Buffer, CellValue, Workbook } from "exceljs";

import { AccountingTeacher } from "../../../../types/accountingTeacher";

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

export async function TeacherAccountingExport(
	accoutings: AccountingTeacher[],
	STANDART_VIEWER_ID: number
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
	firstRow.height = 4 * defaultHeightCoef;
	firstRow.getCell("A").value = defaultTitleText("Дата перевірки");
	firstRow.getCell("B").value = defaultTitleText(
		"Зауваження та вказівки щодо проведення заняття, ведення обліку та журналу"
	);
	firstRow.getCell("C").value = defaultTitleText(
		"Посада, військове звання, прізвище, підпис того, хто перевіряє"
	);

	for (let i = 2; i < accoutings.length + 2; i++) {
		var row = sheet.getRow(i);
		row.getCell("A").value = defaultText(
			accoutings[i - 2].date.toLocaleDateString("uk", {
				year: "2-digit",
				month: "2-digit",
				day: "2-digit",
			})
		);
		row.getCell("B").value = defaultText(accoutings[i - 2].content);

		row.getCell("C").value = {
			richText: [
				{
					text:
						(accoutings[i - 2].from.id === STANDART_VIEWER_ID
							? accoutings[i - 2].fromPosition
							: accoutings[i - 2].from.position.title) + "\n",
				},
				{
					text:
						(accoutings[i - 2].from.id === STANDART_VIEWER_ID
							? accoutings[i - 2].fromRank
							: accoutings[i - 2].from.rank.title) + "\n",
				},
				{
					text:
						accoutings[i - 2].from.id === STANDART_VIEWER_ID
							? accoutings[i - 2].fromSecondname
							: accoutings[i - 2].from.secondName,
				},
			],
		};
		row.height = defaultHeightCoef * 3;
		row.alignment = {
			vertical: "middle",
			wrapText: true,
		};
	}

	const buffer: Promise<Buffer> = workbook.xlsx.writeBuffer();

	return buffer;
}
