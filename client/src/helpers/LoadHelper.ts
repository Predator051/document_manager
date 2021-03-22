import { ClassFile } from "../types/classFile";
import { ConnectionManager } from "../managers/connetion/connectionManager";

export async function LoadClassFiles(files: ClassFile[]) {
	files.forEach((file) => LoadClassFile(file));
}

export async function LoadClassFile(file: ClassFile) {
	fetch(ConnectionManager.getHostAndPort() + `/download`, {
		method: "POST",
		mode: "cors",
		cache: "no-cache",
		credentials: "same-origin",
		headers: {
			"Content-Type": "application/json",
		},
		redirect: "follow",
		referrerPolicy: "no-referrer",
		body: JSON.stringify(file),
	}).then(async (res) => {
		console.log("res", res);
		if (res.ok) {
			saveAs(await res.blob(), file.filename);
		}
	});
}
