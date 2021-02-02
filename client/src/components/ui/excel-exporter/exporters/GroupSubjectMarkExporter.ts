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
import { ClassEvent } from "../../../../types/classEvent";
import { GroupUserMark } from "../../../../types/groupUserMark";
import { MarkObj } from "../../../group/GroupSubjectMarkTable";

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

const defaultText: (
	text: string,
	bold?: boolean,
	color?: string
) => CellValue = (text: string, bold?: boolean, color?: string) => {
	return {
		richText: [
			{
				font: {
					size: 12,
					name: "Times New Roman",
					bold: bold,
					color: {
						argb: color,
					},
				},
				text: text,
			},
		],
	} as CellValue;
};

const addColumn = (sym: string, sheet: Worksheet) => {
	const colC = sheet.getColumn(sym);
	colC.width = defaultColumnWidth;
	colC.border = defaultColumnBorder;
	colC.alignment = defaultColumnAlignment;

	return colC;
};

export async function GroupSubjectMarkExport(
	group: Group,
	subjects: Subject[],
	classEvents: ClassEvent[]
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
	sheet.mergeCells("A1:A2");
	sheet.mergeCells("B1:B2");
	firstRow.getCell("C").value = defaultTitleText("Предмет навчання");

	if (subjects.length > 1) {
		sheet.mergeCells(1, 3, 1, 3 + subjects.length - 1);
	}

	var secondRow = sheet.getRow(2);
	secondRow.height = 2 * defaultHeightCoef;

	for (let rowIndex = 3; rowIndex < group.users.length + 3; rowIndex++) {
		const record = group.users[rowIndex - 3];

		const currRow = sheet.getRow(rowIndex);
		currRow.getCell("A").value = defaultText((rowIndex - 2).toString());
		currRow.getCell("B").value = defaultText(record.fullname);
	}

	for (let subjCellI = 3; subjCellI < subjects.length + 3; subjCellI++) {
		const subject = subjects[subjCellI - 3];
		const subjCell = secondRow.getCell(subjCellI);

		subjCell.value = defaultText(subject.fullTitle, true);

		const ceBySubject = classEvents.filter(
			(ce) => ce.selectPath.subject === subject.id
		);

		for (let i = 3; i < group.users.length + 3; i++) {
			var row = sheet.getRow(i);
			let record = group.users[i - 3];

			row.getCell("A").value = defaultText((i - 2).toString());
			row.getCell("B").value = defaultText(record.fullname);
			row.height = defaultHeightCoef * 1;
			row.alignment = {
				vertical: "middle",
				wrapText: true,
			};

			const allMarksByUser: GroupUserMark[] = [];
			ceBySubject
				.sort((a, b) => (a.date < b.date ? -1 : 1))
				.forEach((ce) =>
					allMarksByUser.push(
						...ce.presences
							.filter((pr) => pr.userId === record.id)
							.map((pr) => pr.mark)
					)
				);

			const markObj: MarkObj = {
				current: {
					sum: 0,
					count: 0,
				},
				subject: {
					sum: 0,
					count: 0,
				},
				topic: {
					sum: 0,
					count: 0,
				},
			};

			allMarksByUser.forEach((mark) => {
				if (mark.subject !== 0) {
					markObj.subject.count = 1;
					markObj.subject.sum = mark.subject;
				} else if (mark.topic !== 0) {
					markObj.topic.count += 1;
					markObj.topic.sum += mark.topic;
				} else if (mark.current !== 0) {
					markObj.current.count += 1;
					markObj.current.sum += mark.current;
				}
			});

			let markValue: number = 0;
			let color: string = "";
			if (markObj.subject.count !== 0) {
				markValue = markObj.subject.sum / markObj.subject.count;
				color = "00CD201F";
			} else if (markObj.topic.count !== 0) {
				markValue = markObj.topic.sum / markObj.topic.count;
				color = "00108EE9";
			} else if (markObj.current.count !== 0) {
				markValue = markObj.current.sum / markObj.current.count;
			}

			row.getCell(subjCellI).value = defaultText(
				markValue === 0 ? "" : markValue.toString(),
				true,
				color
			);
		}
	}

	if (subjects.length <= 1) {
		sheet.getColumn(3).width = 40;
		sheet.getColumn(3).border = defaultColumnBorder;
		sheet.getColumn(3).alignment = defaultColumnAlignment;
	} else if (subjects.length > 1) {
		for (let i = 3; i < subjects.length + 3; i++) {
			sheet.getColumn(i).width = 20;
			sheet.getColumn(i).alignment = defaultColumnAlignment;
		}
	}

	const buffer: Promise<Buffer> = workbook.xlsx.writeBuffer();

	return buffer;
}
