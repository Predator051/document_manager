import express from "express";
import cors from "cors";
import * as http from "http";
import { RequestManager } from "./request-manager";
import { DBManager } from "./managers/db_manager";
import { DBGroupManager } from "./managers/db_group_manager";
import { DBKeyValueManager } from "./managers/db_key_value_manager";
import { STANDART_KEYS, STANDART_VALUES } from "./types/constants";
import { DBPositionManager } from "./managers/db_position_manager";
import { env } from "process";
import { DBSubdivisionManager } from "./managers/db_subdivision_manager";
import { DBUserManager } from "./managers/db_user_manager";
import { UserType } from "./types/user";
import { DBRankManager } from "./managers/db_rank_manager";
import { RankModel } from "./model/rank.model";
import { DBMRSManager } from "./managers/db_mrs_manager";
import { DBIPPManager } from "./managers/db_ipp_manager";
import fileUpload, { UploadedFile } from "express-fileupload";
import { builtinModules } from "module";
import { RandomString } from "./helpers/stringHelper";
import { FileModel } from "./model/file.model";
import { ClassFile } from "./types/classFile";

export class ServerManager {
	public static readonly PORT: number = 8080;
	private app: express.Application;
	private server: http.Server;
	private io: SocketIO.Server;
	private port: string | number;

	constructor() {
		this.createApp();
		this.config();
		this.createServer();
		this.sockets();
		this.listen();
		DBManager.get().then(async () => {
			DBGroupManager.CreateStandartGroupTrainingTypes();
			await RankModel.CreateStandart();
			await DBMRSManager.CreateStandart();
			await DBIPPManager.CreateStandart();

			let rank = await DBKeyValueManager.GetById(
				STANDART_KEYS.STANDART_ADMIN_RANK
			);

			let position = await DBKeyValueManager.GetById(
				STANDART_KEYS.STANDART_POSITION
			);
			if (position === undefined) {
				const posEntity = DBPositionManager.CreateEmptyEntity();
				posEntity.title = "admin";
				const res = await DBPositionManager.SaveEntity(posEntity);
				if (res) {
					const kvEntity = DBKeyValueManager.CreateEmptyEntity();
					kvEntity.id = STANDART_KEYS.STANDART_POSITION;
					kvEntity.value = res.id;
					position = await DBKeyValueManager.SaveEntity(kvEntity);
				}
			}

			let positionSecondAdmin = await DBKeyValueManager.GetById(
				STANDART_KEYS.STANDART_SECOND_ADMIN_POSITION
			);
			if (positionSecondAdmin === undefined) {
				const posEntity = DBPositionManager.CreateEmptyEntity();
				posEntity.title = "адміністратори";
				const res = await DBPositionManager.SaveEntity(posEntity);
				if (res) {
					const kvEntity = DBKeyValueManager.CreateEmptyEntity();
					kvEntity.id = STANDART_KEYS.STANDART_SECOND_ADMIN_POSITION;
					kvEntity.value = res.id;
					positionSecondAdmin = await DBKeyValueManager.SaveEntity(kvEntity);
				}
			}

			let positionViewer = await DBKeyValueManager.GetById(
				STANDART_KEYS.STANDART_VIEWER_POSITION
			);
			if (positionViewer === undefined) {
				const posEntity = DBPositionManager.CreateEmptyEntity();
				posEntity.title = "перевіряючі";
				const res = await DBPositionManager.SaveEntity(posEntity);
				if (res) {
					const kvEntity = DBKeyValueManager.CreateEmptyEntity();
					kvEntity.id = STANDART_KEYS.STANDART_VIEWER_POSITION;
					kvEntity.value = res.id;
					positionViewer = await DBKeyValueManager.SaveEntity(kvEntity);
				}
			}

			let subdivision = await DBKeyValueManager.GetById(
				STANDART_KEYS.STANDART_SUBDIVISION
			);
			if (subdivision === undefined) {
				const subEntity = DBSubdivisionManager.CreateEmptyEntity();
				subEntity.title = "admin";
				const res = await DBSubdivisionManager.SaveEntity(subEntity);
				if (res) {
					const kvEntity = DBKeyValueManager.CreateEmptyEntity();
					kvEntity.id = STANDART_KEYS.STANDART_SUBDIVISION;
					kvEntity.value = res.id;
					subdivision = await DBKeyValueManager.SaveEntity(kvEntity);
				}
			}

			let subdivisionSecondAdmin = await DBKeyValueManager.GetById(
				STANDART_KEYS.STANDART_SECOND_ADMIN_SUBDIVISION
			);
			if (subdivisionSecondAdmin === undefined) {
				const subEntity = DBSubdivisionManager.CreateEmptyEntity();
				subEntity.title = "адміністратори";
				const res = await DBSubdivisionManager.SaveEntity(subEntity);
				if (res) {
					const kvEntity = DBKeyValueManager.CreateEmptyEntity();
					kvEntity.id = STANDART_KEYS.STANDART_SECOND_ADMIN_SUBDIVISION;
					kvEntity.value = res.id;
					subdivisionSecondAdmin = await DBKeyValueManager.SaveEntity(kvEntity);
				}
			}

			let subdivisionViewer = await DBKeyValueManager.GetById(
				STANDART_KEYS.STANDART_VIEWER_SUBDIVISION
			);
			if (subdivisionViewer === undefined) {
				const subEntity = DBSubdivisionManager.CreateEmptyEntity();
				subEntity.title = "перевіряючі";
				const res = await DBSubdivisionManager.SaveEntity(subEntity);
				if (res) {
					const kvEntity = DBKeyValueManager.CreateEmptyEntity();
					kvEntity.id = STANDART_KEYS.STANDART_VIEWER_SUBDIVISION;
					kvEntity.value = res.id;
					subdivisionViewer = await DBKeyValueManager.SaveEntity(kvEntity);
				}
			}

			let admin = await DBKeyValueManager.GetById(STANDART_KEYS.STANDART_ADMIN);

			if (admin === undefined) {
				const adminEntity = await DBUserManager.CreateEmptyEntity();
				adminEntity.login = "admin";
				adminEntity.password = "admin";
				adminEntity.userType = UserType.ADMIN;
				adminEntity.firstName = "Алексей";
				adminEntity.secondName = "Кукишев";

				if (subdivision && position && rank) {
					const cycleEntity = await DBSubdivisionManager.GetById(
						subdivision.value
					);

					if (cycleEntity) {
						adminEntity.cycle = cycleEntity;
					}

					const positionEntity = await DBPositionManager.GetById(
						position.value
					);

					if (positionEntity) {
						adminEntity.position = positionEntity;
					}

					const rankEntity = await DBRankManager.GetById(rank.value);

					if (rankEntity) {
						adminEntity.rank = rankEntity;
					}
				}

				const res = await DBUserManager.Save(adminEntity);
				if (res) {
					const kvEntity = DBKeyValueManager.CreateEmptyEntity();
					kvEntity.id = STANDART_KEYS.STANDART_ADMIN;
					kvEntity.value = res.id;
					admin = await DBKeyValueManager.SaveEntity(kvEntity);
				}
			}

			let viewer = await DBKeyValueManager.GetById(
				STANDART_KEYS.STANDART_VIEWER
			);

			if (viewer === undefined) {
				const viewerEntity = await DBUserManager.CreateEmptyEntity();
				viewerEntity.login = "viewer";
				viewerEntity.password = "viewer";
				viewerEntity.userType = UserType.VIEWER;
				viewerEntity.firstName = "";
				viewerEntity.secondName = "";

				if (subdivisionViewer && positionViewer && rank) {
					const cycleEntity = await DBSubdivisionManager.GetById(
						subdivisionViewer.value
					);

					if (cycleEntity) {
						viewerEntity.cycle = cycleEntity;
					}

					const positionEntity = await DBPositionManager.GetById(
						positionViewer.value
					);

					if (positionEntity) {
						viewerEntity.position = positionEntity;
					}

					const rankEntity = await DBRankManager.GetById(rank.value);

					if (rankEntity) {
						viewerEntity.rank = rankEntity;
					}
				}

				const res = await DBUserManager.Save(viewerEntity);
				if (res) {
					const kvEntity = DBKeyValueManager.CreateEmptyEntity();
					kvEntity.id = STANDART_KEYS.STANDART_VIEWER;
					kvEntity.value = res.id;
					viewer = await DBKeyValueManager.SaveEntity(kvEntity);
				}
			}

			if (
				position &&
				subdivision &&
				admin &&
				subdivisionSecondAdmin &&
				subdivisionViewer &&
				positionSecondAdmin &&
				positionViewer &&
				viewer &&
				rank
			) {
				STANDART_VALUES.set(STANDART_KEYS.STANDART_POSITION, position.value);
				STANDART_VALUES.set(STANDART_KEYS.STANDART_ADMIN, admin.value);
				STANDART_VALUES.set(STANDART_KEYS.STANDART_VIEWER, viewer.value);
				STANDART_VALUES.set(
					STANDART_KEYS.STANDART_SUBDIVISION,
					subdivision.value
				);
				STANDART_VALUES.set(
					STANDART_KEYS.STANDART_SECOND_ADMIN_SUBDIVISION,
					subdivisionSecondAdmin.value
				);
				STANDART_VALUES.set(
					STANDART_KEYS.STANDART_VIEWER_SUBDIVISION,
					subdivisionViewer.value
				);
				STANDART_VALUES.set(
					STANDART_KEYS.STANDART_SECOND_ADMIN_POSITION,
					positionSecondAdmin.value
				);
				STANDART_VALUES.set(
					STANDART_KEYS.STANDART_VIEWER_POSITION,
					positionViewer.value
				);
				STANDART_VALUES.set(STANDART_KEYS.STANDART_ADMIN_RANK, rank.value);
				console.log("STANDART VALUES LOADED: ", STANDART_VALUES);
			}
		});
	}

	private createApp(): void {
		this.app = express();
		this.app.use(cors());
		this.app.use(fileUpload());
		this.app.use(express.json());

		this.app.post("/upload", async function (req, res) {
			if (!req.files || Object.keys(req.files).length === 0) {
				return res.status(400).send("No files were uploaded.");
			}

			const sampleFiles = req.files;
			const ids: number[] = [];
			for (const key of Object.keys(sampleFiles)) {
				let file = sampleFiles[key] as UploadedFile;

				let savedDBFile = await FileModel.Update({
					filename: file.name,
					id: 0,
					occupation: 0,
					createAt: new Date(),
				});

				file.mv(FileModel.BuildFilePath(savedDBFile.data, __dirname), (err) => {
					if (err) {
						res.status(500).send();
					}
				});
				ids.push(savedDBFile.data.id);
			}

			res.status(200).json({ file_ids: ids });
		});
		this.app.post("/download", async function (req, res) {
			const file = req.body as ClassFile;
			if (file) {
				console.log(FileModel.BuildFilePath(file, __dirname));

				res.download(
					FileModel.BuildFilePath(file, __dirname),
					file.filename,
					(err) => {
						if (err) console.log(err);
					}
				);
			}
		});
	}

	private createServer(): void {
		this.server = http.createServer(this.app);
	}

	private config(): void {
		this.port = process.env.PORT || ServerManager.PORT;
	}

	private sockets(): void {
		this.io = require("socket.io").listen(this.server, { origins: "*:*" });
	}

	private listen(): void {
		this.server.listen(this.port, () => {
			console.log("Running server on port %s", this.port);
		});
		this.io.on("connect", (socket: SocketIO.Socket) => {
			console.log("Connected client on port %s.", this.port);
			RequestManager.on(socket, this.io);
		});
	}

	public getApp(): express.Application {
		return this.app;
	}
}
