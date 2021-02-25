import {
	Alignment,
	Borders,
	Buffer,
	CellValue,
	Workbook,
	Worksheet,
} from "exceljs";

import { AccountingTeacher } from "../../../../types/accountingTeacher";
import { ClassEvent } from "../../../../types/classEvent";
import { Group, GroupTrainingType } from "../../../../types/group";
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

export async function ExtractClassesExport(
	datas: {
		classEvent: ClassEvent;
		group: Group;
	}[],
	subjects: Subject[]
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
	colA.width = 10;
	const colB = addColumn("B", sheet);
	colB.width = 10;
	const colC = addColumn("C", sheet);
	colC.width = 20;
	const colD = addColumn("D", sheet);
	colD.width = 40;
	const colE = addColumn("E", sheet);
	colE.width = 20;
	const colF = addColumn("F", sheet);
	colF.width = 20;
	var firstRow = sheet.getRow(1);
	firstRow.height = 6 * defaultHeightCoef;
	firstRow.getCell("A").value = defaultTitleText("Дата");
	sheet.mergeCells("A1:A2");
	firstRow.getCell("B").value = defaultTitleText("Проведення занять");
	sheet.mergeCells("B1:C1");
	firstRow.getCell("D").value = defaultTitleText(
		"Предмети навчання, номер теми, її назва номер заняття, його назва номери нормативів, що відпрацьовуються"
	);
	sheet.mergeCells("D1:D2");
	firstRow.getCell("E").value = defaultTitleText("Місце проведення заняття");
	sheet.mergeCells("E1:E2");
	firstRow.getCell("F").value = defaultTitleText("Підпис викладача");
	sheet.mergeCells("F1:F2");

	var secondRow = sheet.getRow(2);
	secondRow.height = 2 * defaultHeightCoef;

	secondRow.getCell("B").value = defaultTitleText("Години занять");
	secondRow.getCell("C").value = defaultTitleText("Підрозділ, ВОС");

	for (let i = 3; i < datas.length + 3; i++) {
		var row = sheet.getRow(i);
		let record = datas[i - 3];

		row.getCell("A").value = defaultText(
			record.classEvent.date.toLocaleDateString("uk", {
				year: "2-digit",
				month: "2-digit",
				day: "2-digit",
			})
		);
		row.getCell("B").value = defaultText(record.classEvent.hours.toString());
		const group = record.group;
		row.getCell("C").value = defaultText(
			group.trainingType.type !== GroupTrainingType.IPP
				? `${group.company} рота, ${group.platoon} взвод, ВОС ${group.mrs.number}`
				: group.ipp.name
		);

		const subject = subjects.find(
			(s) => s.id === record.classEvent.selectPath.subject
		);
		const topic = subject.programTrainings
			.find((pt) => pt.id === record.classEvent.selectPath.programTraining)
			.topics.find((t) => t.id === record.classEvent.selectPath.topic);

		const occupation = topic.occupation.find(
			(oc) => oc.id === record.classEvent.selectPath.occupation
		);
		row.getCell("D").value = {
			richText: [
				{
					text: subject.fullTitle + "\n",
					font: {
						bold: true,
						size: 12,
						name: "Times New Roman",
					},
				},
				{
					text: `Тема ${topic.number}: ${topic.title}\n`,
					font: {
						size: 12,
						name: "Times New Roman",
					},
				},
				{
					text: `Заняття ${occupation.number}: ${occupation.title}`,
					font: {
						size: 12,
						name: "Times New Roman",
					},
				},
			],
		};
		row.getCell("E").value = defaultText(record.classEvent.place);
		row.getCell("F").value = defaultText("");
		row.height = defaultHeightCoef * 3;
		row.alignment = {
			vertical: "middle",
			wrapText: true,
		};
	}

	const buffer: Promise<Buffer> = workbook.xlsx.writeBuffer();

	return buffer;
}
