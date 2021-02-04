import {
	Alignment,
	Borders,
	Buffer,
	CellValue,
	Workbook,
	Worksheet,
} from "exceljs";

import { Group } from "../../../../types/group";
import { Norm } from "../../../../types/norm";
import { NormProcess } from "../../../../types/normProcess";
import { Subject } from "../../../../types/subject";

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

export async function GroupAccountingNormsForTrainingSubjectsExport(
	group: Group,
	subject: Subject,
	norms: Norm[],
	normProcesses: NormProcess[]
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

	const colA = addColumn("A", sheet);
	colA.width = 5;
	const colB = addColumn("B", sheet);
	colB.width = 40;
	var firstRow = sheet.getRow(1);
	firstRow.height = 1 * defaultHeightCoef;
	firstRow.getCell("A").value = defaultTitleText("№ з/п");
	firstRow.getCell("B").value = defaultTitleText(
		"Прізвище, ім’я та по батькові"
	);
	sheet.mergeCells("A1:A3");
	sheet.mergeCells("B1:B3");

	var secondRow = sheet.getRow(2);
	secondRow.height = 2 * defaultHeightCoef;
	var thirtRow = sheet.getRow(3);

	for (let rowIndex = 4; rowIndex < group.users.length + 4; rowIndex++) {
		const record = group.users[rowIndex - 4];

		const currRow = sheet.getRow(rowIndex);
		currRow.getCell("A").value = defaultText((rowIndex - 3).toString());
		currRow.getCell("B").value = defaultText(record.fullname);
	}

	for (
		let iProcess = 0, iDate = 3, iCell = 3;
		iProcess < normProcesses.length;
		iProcess++
	) {
		const dateCell = firstRow.getCell(iDate);
		dateCell.value = defaultTitleText(
			normProcesses[iProcess].date.toLocaleDateString("uk", {
				year: "2-digit",
				month: "2-digit",
				day: "2-digit",
			})
		);
		const titleCell = secondRow.getCell(iDate);
		titleCell.value = {
			richText: [
				{
					text: "Оцінка за норматив",
					font: {
						size: 12,
						name: "Times New Roman",
						bold: true,
					},
				},
			],
		};

		const filteredNorms = norms.filter((n) => {
			return (
				normProcesses[iProcess].marks.findIndex((m) => m.normId === n.id) >=
					0 && n.subjectId === subject.id
			);
		});

		filteredNorms.forEach((norm) => {
			const normCell = thirtRow.getCell(iCell);

			normCell.value = defaultTitleText("№ " + norm.number.toString());

			for (let rowIndex = 4; rowIndex < group.users.length + 4; rowIndex++) {
				const record = group.users[rowIndex - 4];
				const currMark = normProcesses[iProcess].marks.find(
					(m) => m.normId === norm.id && m.userId === record.id
				);

				const currRow = sheet.getRow(rowIndex);
				currRow.getCell(iCell).value = defaultText(
					currMark ? currMark.mark.toString() : ""
				);
			}

			iCell++;
		});

		console.log("idate", iDate, "iCell", iCell);

		const diff = iCell - iDate;
		if (diff >= 2) {
			sheet.mergeCells(1, iDate, 1, iCell - 1);
			sheet.mergeCells(2, iDate, 2, iCell - 1);
		}

		if (diff < 2) {
			sheet.getColumn(iDate).width = 20;
			sheet.getColumn(iDate).border = defaultColumnBorder;
			sheet.getColumn(iDate).alignment = defaultColumnAlignment;
		} else if (diff >= 2) {
			for (let index = iDate; index < iCell; index++) {
				sheet.getColumn(index).width = 10;
				sheet.getColumn(index).border = defaultColumnBorder;
				sheet.getColumn(index).alignment = defaultColumnAlignment;
			}
		}

		iDate += filteredNorms.length;
	}

	const buffer: Promise<Buffer> = workbook.xlsx.writeBuffer();

	return buffer;
}
