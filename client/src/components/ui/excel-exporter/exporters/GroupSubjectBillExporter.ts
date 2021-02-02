import {
	Alignment,
	Borders,
	Buffer,
	CellValue,
	Workbook,
	Worksheet,
} from "exceljs";

import { ClassEvent } from "../../../../types/classEvent";
import {
	ConstripAppeal,
	Group,
	GroupTrainingType,
} from "../../../../types/group";
import { GroupUserMark } from "../../../../types/groupUserMark";
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

const defaultTitleText: (text: string, bold?: boolean) => CellValue = (
	text: string,
	bold?: boolean
) => {
	return {
		richText: [
			{
				font: {
					size: 14,
					name: "Times New Roman",
					bold: bold,
				},
				text: text,
			},
		],
	} as CellValue;
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
					color: {
						argb: color,
					},
					bold: bold,
				},
				text: text,
			},
		],
	};
};

const addColumn = (sym: string, sheet: Worksheet) => {
	const colC = sheet.getColumn(sym);
	// colC.width = defaultColumnWidth;
	// colC.border = defaultColumnBorder;
	// colC.alignment = defaultColumnAlignment;

	return colC;
};

export async function GroupSubjectBillExport(
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

	const col2Width = 4;
	const col3Width = 4;
	const col4Width = 4;
	const col5Width = 2;
	const col6Width = 2;
	const col7Width = 2;
	const col8Width = 2;
	const colWidthArr = [
		col2Width,
		col3Width,
		col4Width,
		col5Width,
		col6Width,
		col7Width,
		col8Width,
	];

	const colA = addColumn("A", sheet);
	colA.width = 5;
	// sheet.getColumn(7).width = 20;
	// sheet.getColumn(8).width = 20;
	var firstRow = sheet.getRow(1);
	firstRow.height = 2 * defaultHeightCoef;
	firstRow.getCell("A").value = defaultTitleText("ВІДОМІСТЬ", false);
	firstRow.getCell("A").alignment = defaultColumnAlignment;
	sheet.mergeCells(
		1,
		1,
		1,
		colWidthArr.reduce((prev, curr) => prev + curr, 0) - 1
	);

	sheet.getRow(2).getCell(1).value = defaultText(
		`Оцінки результатів комплексного іспиту ${group.platoon} навчального взводу зв'язку ${group.company} навчальної роти зв'язку ` +
			(group.trainingType.type === GroupTrainingType.PROFESSIONAL_CONTRACT
				? `${group.cycle} циклу`
				: group.trainingType.type === GroupTrainingType.PROGESSIONAL_CONSCRIPT
				? group.appeal === ConstripAppeal.AUTUMN
					? "осіннього призову"
					: "весіннього призову"
				: group.trainingType.type === GroupTrainingType.PROFESSIONAL_SERGEANTS
				? `${group.quarter} кварталу`
				: "") +
			` підготовки ${group.year} року`
	);
	sheet.getRow(2).height = 2 * defaultHeightCoef;
	sheet.getCell(2, 1).alignment = defaultColumnAlignment;
	sheet.mergeCells(
		2,
		1,
		2,
		colWidthArr.reduce((prev, curr) => prev + curr, 0) - 1
	);

	sheet.getRow(3).getCell(1).value = defaultText(subject.fullTitle);
	sheet.getRow(3).height = 2 * defaultHeightCoef;
	sheet.getCell(3, 1).alignment = defaultColumnAlignment;
	sheet.mergeCells(
		3,
		1,
		3,
		colWidthArr.reduce((prev, curr) => prev + curr, 0) - 1
	);

	sheet.getRow(4).getCell(1).value = defaultText(
		"на " +
			new Date().toLocaleDateString("uk", {
				year: "numeric",
				month: "2-digit",
				day: "2-digit",
			})
	);
	sheet.getRow(4).height = 2 * defaultHeightCoef;
	sheet.getCell(4, 1).alignment = defaultColumnAlignment;
	sheet.mergeCells(
		4,
		1,
		4,
		colWidthArr.reduce((prev, curr) => prev + curr, 0) - 1
	);

	sheet.getCell(5, 1).value = defaultText("№ п/п");
	sheet.getCell(5, 2).value = defaultText("Військове звання");
	sheet.getCell(5, 6).value = defaultText("Прізвище та ініціали");
	sheet.getCell(5, 10).value = defaultText("№ задачі, нормативу");
	sheet.getCell(5, 14).value = defaultText("Теорія");
	sheet.getCell(5, 16).value = defaultText("Практика");
	sheet.getCell(5, 18).value = defaultText("Загальна оцінка");

	sheet.getCell(6, 14).value = defaultText("Оцінка");
	sheet.getCell(6, 16).value = defaultText("Результат");
	sheet.getCell(6, 17).value = defaultText("Оцінка");

	sheet.mergeCells("A5:A6");
	sheet.mergeCells(5, 2, 6, 5); //Військове звання
	sheet.mergeCells(5, 6, 6, 9); //Прізвище та ініціали
	sheet.mergeCells(5, 10, 6, 13); //№ задачі, нормативу
	sheet.mergeCells(5, 14, 5, 15); //Теорія
	sheet.mergeCells(5, 16, 5, 17); //Практика
	sheet.mergeCells(5, 18, 6, 19); //Загальна оцінка
	sheet.mergeCells(6, 14, 6, 15); //Загальна оцінка -> Оцінка

	// sheet.mergeCells("C5:C6");
	// sheet.mergeCells("D5:D6");

	// sheet.mergeCells(5, 6, 5, 7);
	// sheet.mergeCells(5, 8, 6, 8);

	sheet.getRows(5, 3).forEach((row) => {
		row.alignment = defaultColumnAlignment;
		row.height = 2 * defaultHeightCoef;
		// row.border = defaultColumnBorder;
	});

	const row7 = sheet.getRow(7);
	row7.getCell(1).value = defaultText("1");
	for (let i = 2, colStart = 2; i < 9; i++) {
		if (i === 8) debugger;
		row7.getCell(colStart).value = defaultText(i.toString());
		if (i !== 6 && i !== 7) {
			sheet.mergeCells(7, colStart, 7, colStart + colWidthArr[i - 2] - 1);
			colStart += colWidthArr[i - 2];
		} else {
			colStart++;
		}
	}

	for (let i = 5; i < group.users.length + 8; i++) {
		for (
			let j = 1;
			j < colWidthArr.reduce((prev, curr) => prev + curr, 0);
			j++
		) {
			sheet.getCell(i, j).border = defaultColumnBorder;
			if (i > 7) {
				sheet.getCell(i, j).alignment = {
					horizontal: "left",
					vertical: "middle",
					wrapText: true,
				};
			}
		}
	}

	const usersMarks: Map<number, number> = new Map<number, number>();

	for (let uIndex = 8; uIndex < group.users.length + 8; uIndex++) {
		const user = group.users[uIndex - 8];
		const rowIndexed = sheet.getRow(uIndex);

		rowIndexed.getCell(1).value = defaultText((uIndex - 7).toString());
		// rowIndexed.getCell(2).value = defaultText(user.rank);
		// rowIndexed.getCell(3).value = defaultText(user.fullname);

		const allMarksByUser: GroupUserMark[] = [];
		classEvents
			.sort((a, b) => (a.date < b.date ? -1 : 1))
			.forEach((ce) =>
				allMarksByUser.push(
					...ce.presences
						.filter((pr) => pr.userId === user.id)
						.map((pr) => pr.mark)
				)
			);

		let markValue: number = 0;
		allMarksByUser.forEach((mark) => {
			if (mark.subject !== 0) {
				markValue = mark.subject;
			}
		});

		usersMarks.set(user.id, markValue);

		for (let i = 2, colStart = 2; i < 9; i++) {
			if (i === 2) {
				rowIndexed.getCell(colStart).value = defaultText(user.rank);
			} else if (i === 3) {
				rowIndexed.getCell(colStart).value = defaultText(user.fullname);
			} else if (i === 8) {
				rowIndexed.getCell(colStart).value = defaultText(
					markValue === 0 ? "" : markValue.toString(),
					true
				);
			}

			if (i !== 6 && i !== 7) {
				sheet.mergeCells(
					uIndex,
					colStart,
					uIndex,
					colStart + colWidthArr[i - 2] - 1
				);
				colStart += colWidthArr[i - 2];
			} else {
				colStart++;
			}
		}
	}

	let afterTableIndex = 8 + group.users.length;

	sheet.mergeCells(afterTableIndex, 1, afterTableIndex, 5);

	sheet.getRow(++afterTableIndex).getCell(1).value = defaultText(
		"(посада командира підрозділу)"
	);
	sheet.mergeCells(afterTableIndex, 1, afterTableIndex, 5);
	++afterTableIndex;
	sheet.mergeCells(afterTableIndex, 1, afterTableIndex, 5);
	sheet.getRow(++afterTableIndex).getCell(1).value = defaultText(
		"(в/звання, підпис, ім'я та прізвище)"
	);
	sheet.mergeCells(afterTableIndex, 1, afterTableIndex, 5);

	afterTableIndex = 12 + group.users.length;

	sheet.getRow(++afterTableIndex).getCell(2).value = defaultText(
		"Результати перевірки"
	);
	sheet.mergeCells(afterTableIndex, 2, afterTableIndex, 4);

	sheet.getRow(++afterTableIndex).getCell(2).value = defaultText(`За штатом`);
	sheet.mergeCells(afterTableIndex, 2, afterTableIndex, 3);

	sheet.getRow(afterTableIndex).getCell(4).value = defaultText(
		group.users.length.toString()
	);
	sheet.getRow(afterTableIndex).getCell(5).value = defaultText("осіб");

	sheet.getRow(++afterTableIndex).getCell(2).value = defaultText(`За списком`);
	sheet.mergeCells(afterTableIndex, 2, afterTableIndex, 3);

	sheet.getRow(afterTableIndex).getCell(4).value = defaultText(
		group.users.length.toString()
	);
	sheet.getRow(afterTableIndex).getCell(5).value = defaultText("осіб");
	sheet.getRow(afterTableIndex).getCell(6).value = defaultText("100");
	sheet.getRow(afterTableIndex).getCell(7).value = defaultText("%");

	const procentCalc = (all: number, part: number) => {
		return (100 * part) / all;
	};

	const checked = Array.from(usersMarks).reduce((prev, curr) => {
		return prev + (curr[1] !== 0 || curr[1] !== 0 || curr[1] !== 0 ? 1 : 0);
	}, 0);

	sheet.getRow(++afterTableIndex).getCell(2).value = defaultText(
		`Перевірялось`
	);
	sheet.mergeCells(afterTableIndex, 2, afterTableIndex, 3);

	sheet.getRow(afterTableIndex).getCell(4).value = defaultText(
		checked.toString()
	);
	sheet.getRow(afterTableIndex).getCell(5).value = defaultText("осіб");
	sheet.getRow(afterTableIndex).getCell(6).value = defaultText(
		procentCalc(group.users.length, checked).toFixed(1)
	);
	sheet.getRow(afterTableIndex).getCell(7).value = defaultText("%");

	const unpresent = Array.from(usersMarks).reduce((prev, curr) => {
		return prev + (curr[1] === 0 && curr[1] === 0 && curr[1] === 0 ? 1 : 0);
	}, 0);

	sheet.getRow(++afterTableIndex).getCell(2).value = defaultText(`Відсутні`);
	sheet.mergeCells(afterTableIndex, 2, afterTableIndex, 3);

	sheet.getRow(afterTableIndex).getCell(4).value = defaultText(
		unpresent.toString()
	);
	sheet.getRow(afterTableIndex).getCell(5).value = defaultText("осіб");
	sheet.getRow(afterTableIndex).getCell(6).value = defaultText(
		procentCalc(group.users.length, unpresent).toFixed(1)
	);
	sheet.getRow(afterTableIndex).getCell(7).value = defaultText("%");

	// Оцінено на

	afterTableIndex = 12 + group.users.length;
	sheet.getRow(++afterTableIndex).getCell(10).value = defaultText(
		"Оцінено на:"
	);
	sheet.mergeCells(afterTableIndex, 10, afterTableIndex, 12);

	sheet.getRow(++afterTableIndex).getCell(10).value = defaultText(`"відмінно"`);
	sheet.mergeCells(afterTableIndex, 10, afterTableIndex, 11);

	const perfect = Array.from(usersMarks).reduce((prev, curr) => {
		return prev + (curr[1] === 5 ? 1 : 0);
	}, 0);

	sheet.getRow(afterTableIndex).getCell(12).value = defaultText(
		perfect.toString()
	);
	sheet.getRow(afterTableIndex).getCell(13).value = defaultText("осіб");
	sheet.getRow(afterTableIndex).getCell(14).value = defaultText(
		procentCalc(group.users.length, perfect).toFixed(1)
	);
	sheet.getRow(afterTableIndex).getCell(15).value = defaultText("%");

	sheet.getRow(++afterTableIndex).getCell(10).value = defaultText(`"добре"`);
	sheet.mergeCells(afterTableIndex, 10, afterTableIndex, 11);

	const good = Array.from(usersMarks).reduce((prev, curr) => {
		return prev + (curr[1] === 4 ? 1 : 0);
	}, 0);

	sheet.getRow(afterTableIndex).getCell(12).value = defaultText(
		good.toString()
	);
	sheet.getRow(afterTableIndex).getCell(13).value = defaultText("осіб");
	sheet.getRow(afterTableIndex).getCell(14).value = defaultText(
		procentCalc(group.users.length, good).toFixed(1)
	);
	sheet.getRow(afterTableIndex).getCell(15).value = defaultText("%");

	sheet.getRow(++afterTableIndex).getCell(10).value = defaultText(
		`"задовільно"`
	);
	sheet.mergeCells(afterTableIndex, 10, afterTableIndex, 11);

	const notbad = Array.from(usersMarks).reduce((prev, curr) => {
		return prev + (curr[1] === 3 ? 1 : 0);
	}, 0);

	sheet.getRow(afterTableIndex).getCell(12).value = defaultText(
		notbad.toString()
	);
	sheet.getRow(afterTableIndex).getCell(13).value = defaultText("осіб");
	sheet.getRow(afterTableIndex).getCell(14).value = defaultText(
		procentCalc(group.users.length, notbad).toFixed(1)
	);
	sheet.getRow(afterTableIndex).getCell(15).value = defaultText("%");

	sheet.getRow(++afterTableIndex).getCell(10).value = defaultText(
		`"незадовільно"`
	);
	sheet.mergeCells(afterTableIndex, 10, afterTableIndex, 11);

	const bad = Array.from(usersMarks).reduce((prev, curr) => {
		return prev + (curr[1] <= 2 && curr[1] !== 0 ? 1 : 0);
	}, 0);

	sheet.getRow(afterTableIndex).getCell(12).value = defaultText(bad.toString());
	sheet.getRow(afterTableIndex).getCell(13).value = defaultText("осіб");
	sheet.getRow(afterTableIndex).getCell(14).value = defaultText(
		procentCalc(group.users.length, bad).toFixed(1)
	);
	sheet.getRow(afterTableIndex).getCell(15).value = defaultText("%");

	sheet.getRow(++afterTableIndex).getCell(10).value = defaultText(
		`"Відсоток виконання"`
	);
	sheet.mergeCells(afterTableIndex, 10, afterTableIndex, 12);

	const allProcComplited =
		procentCalc(group.users.length, perfect) +
		procentCalc(group.users.length, good) +
		procentCalc(group.users.length, notbad);

	sheet.getRow(afterTableIndex).getCell(13).value = defaultText(
		allProcComplited.toFixed(1)
	);
	sheet.getRow(afterTableIndex).getCell(14).value = defaultText("%");

	sheet.getRow(++afterTableIndex).getCell(10).value = defaultText(
		`"Загальна оцінка"`
	);
	sheet.mergeCells(afterTableIndex, 10, afterTableIndex, 12);

	sheet.getRow(++afterTableIndex).getCell(1).value = defaultText(
		`Зауваження (недоліки): `
	);
	sheet.mergeCells(
		afterTableIndex,
		1,
		afterTableIndex,
		colWidthArr.reduce((prev, curr) => prev + curr, 0) - 1
	);
	++afterTableIndex;
	sheet.mergeCells(
		afterTableIndex,
		1,
		afterTableIndex,
		colWidthArr.reduce((prev, curr) => prev + curr, 0) - 1
	);
	++afterTableIndex;
	sheet.mergeCells(
		afterTableIndex,
		1,
		afterTableIndex,
		colWidthArr.reduce((prev, curr) => prev + curr, 0) - 1
	);
	sheet.getRow(++afterTableIndex).getCell(1).value = {
		richText: [
			{
				text: `(військове звання, підпис, ініціали, прізвище того, хто перевіряв)`,
				font: {
					size: 9,
					name: "Times New Roman",
				},
			},
		],
	};
	sheet.mergeCells(
		afterTableIndex,
		1,
		afterTableIndex,
		colWidthArr.reduce((prev, curr) => prev + curr, 0) - 1
	);
	sheet.getRow(afterTableIndex).height = defaultHeightCoef * 0.7;
	sheet.getRow(afterTableIndex).alignment = {
		horizontal: "center",
		vertical: "top",
	};

	sheet.getRow(++afterTableIndex).getCell(1).value = defaultText(
		`"__" ____2021року`
	);
	sheet.mergeCells(
		afterTableIndex,
		1,
		afterTableIndex,
		colWidthArr.reduce((prev, curr) => prev + curr, 0) - 1
	);

	const buffer: Promise<Buffer> = workbook.xlsx.writeBuffer();

	return buffer;
}
