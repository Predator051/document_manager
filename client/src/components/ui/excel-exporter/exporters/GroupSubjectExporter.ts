import {
	Alignment,
	Borders,
	Buffer,
	CellValue,
	Workbook,
	Worksheet,
} from "exceljs";

import { ClassEvent } from "../../../../types/classEvent";
import { Group } from "../../../../types/group";
import { UserPresenceType } from "../../../../types/groupUserPresence";
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

const defaultText: (text: string, color?: string) => CellValue = (
	text: string,
	color?: string
) => {
	return {
		richText: [
			{
				font: {
					size: 12,
					name: "Times New Roman",
					color: {
						argb: color,
					},
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

export async function GroupSubjectExport(
	group: Group,
	subject: Subject,
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
	const colC = addColumn("C", sheet);
	colC.width = 20;
	var firstRow = sheet.getRow(1);
	firstRow.height = 6 * defaultHeightCoef;
	firstRow.getCell("A").value = defaultTitleText("№ з/п");
	firstRow.getCell("B").value = defaultTitleText(
		"Прізвище, ім’я та по батькові"
	);
	sheet.mergeCells("A1:A2");
	sheet.mergeCells("B1:B2");
	firstRow.getCell("C").value = defaultTitleText(
		"Дата, присутність, успішність"
	);
	if (classEvents.length > 0) sheet.mergeCells(1, 3, 1, 2 + classEvents.length);

	var secondRow = sheet.getRow(2);
	secondRow.height = 2 * defaultHeightCoef;

	for (let i = 3; i < classEvents.length + 3; i++) {
		const col = sheet.getColumn(i);
		col.width = 10;
		col.border = defaultColumnBorder;
		col.alignment = defaultColumnAlignment;

		const ce = classEvents[i - 3];
		secondRow.getCell(i).value = defaultText(
			ce.date.toLocaleDateString("uk", {
				year: "2-digit",
				month: "2-digit",
				day: "2-digit",
			})
		);
	}

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

		for (let i = 3; i < classEvents.length + 3; i++) {
			const cell = row.getCell(i);
			const ce = classEvents[i - 3];

			const presence = ce.presences.find((pr) => pr.userId === record.id);

			if (presence) {
				let actualMark: number = 0;
				let color: string = "";
				if (presence.mark.subject !== 0) {
					actualMark = presence.mark.subject;
					color = "00cd201f";
				} else if (presence.mark.topic !== 0) {
					actualMark = presence.mark.topic;
					color = "00108ee9";
				} else {
					actualMark = presence.mark.current;
				}

				let presenceSym = "";
				switch (presence.type) {
					case UserPresenceType.BUSSINESS_TRIP:
						presenceSym = "вд";
						break;
					case UserPresenceType.OUTFIT:
						presenceSym = "н";
						break;
					case UserPresenceType.SICK:
						presenceSym = "х";
						break;
					case UserPresenceType.VACATION:
						presenceSym = "в";
						break;
					case UserPresenceType.FREE:
						presenceSym = "вх";
						break;
					default:
						presenceSym = "";
						break;
				}

				cell.value = defaultText(
					(actualMark === 0 ? "" : actualMark.toString()) + presenceSym,
					color
				);
			} else {
				cell.value = defaultText("");
			}
		}

		if (classEvents.length <= 1) {
			sheet.getColumn(3).width = 20;
			sheet.getColumn(3).border = defaultColumnBorder;
		} else if (classEvents.length > 1) {
			for (let i = 3; i < classEvents.length + 2; i++) {
				sheet.getColumn(i).width = 10;
			}
		}
	}

	const buffer: Promise<Buffer> = workbook.xlsx.writeBuffer();

	return buffer;
}
