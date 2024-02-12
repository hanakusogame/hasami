import { Button } from "./Button";
import { Panel } from "./Panel";
declare function require(x: string): any;

export class MainScene extends g.Scene {
	private lastJoinedPlayerId: string;//配信者のID
	private font: g.Font;

	constructor(param: g.SceneParameterObject) {
		param.assetIds = ["koma","koma2","win","help", "img_numbers_n", "test"];
		super(param);

		const tl = require("@akashic-extension/akashic-timeline");
		const timeline = new tl.Timeline(this);

		//配信者のIDを取得
		this.lastJoinedPlayerId = "";
		g.game.join.add((ev) => {
			this.lastJoinedPlayerId = ev.player.id;
		});

		this.update.add(() => {
		});

		this.loaded.add(() => {
			/*
			//背景
			const bg = this.createRect(0, 0, 640, 360, "gray");
			this.append(bg);
			*/

			let playerIds = ["", ""];

			this.font = new g.DynamicFont({
				game: g.game,
				fontFamily: g.FontFamily.Monospace,
				size: 15
			});

			const title = this.createLabel(550, 0, "はさみ将棋",15);
			title.textColor = "white";
			title.invalidate();
			this.append(title);

			const help = new g.Sprite({
				scene: this,
				src: this.assets["help"],
				x: 490,
				y:292
			});
			this.append(help);

			const glyph = JSON.parse((this.assets["test"] as g.TextAsset).data);
			const numFont = new g.BitmapFont({
				src: this.assets["img_numbers_n"],
				map: glyph.map,
				defaultGlyphWidth: glyph.width,
				defaultGlyphHeight: glyph.height,
				missingGlyph: glyph.missingGlyph
			});

			const mapLength = 9;
			const mapSize = 72;
			let turn = 0;

			const panels: Panel[][] = [];

			const dx = [0, 0, 1, -1];
			const dy = [1, -1, 0, 0];
			const movePoss: [number,number][] = [];
			let px = 0;
			let py = 0;

			const scale = 330 / (mapSize * mapLength);
			const stage = new g.E({ scene: this, x: 5, y: 20, scaleX: scale, scaleY:scale});
			this.append(stage);

			//勝敗
			let sprState = new g.FrameSprite({
				scene: this,
				src: this.assets["win"] as g.ImageAsset,
				x: 350,
				y: 10,
				width: 150, height: 150,
				frames: [0, 1]
			});
			this.append(sprState);

			//スコア
			let scores = [0, 0];
			const sprScores: g.FrameSprite[] = [];
			const labelScore: g.Label[] = [];
			const labelPlayer: g.Label[] = [];
			const btnPlayers: Button[] = [];

			const fontPlayer = new g.DynamicFont({
				game: g.game,
				fontFamily: g.FontFamily.Monospace,
				size: 32
			});

			for (let i = 0; i < 2; i++) {
				let stone = new g.FrameSprite({
					scene: this,
					src: this.assets["koma2"] as g.ImageAsset,
					x: 360,
					y: 185 + (i * 60),
					width: 40, height: 40,
					frames: [i]
				});

				sprScores.push(stone);
				this.append(stone);

				labelScore.push(this.createLabel(410, 190 + (i * 60), "0",32,numFont));
				this.append(labelScore[i]);

				let btnPlayer = new Button(this, ["全員", "配信者", "視聴者", "先着"], 480, 185 + (i * 60), 100, 30);
				btnPlayer.label.fontSize = 20;
				btnPlayer.label.invalidate();
				this.append(btnPlayer);
				btnPlayers.push(btnPlayer);
				btnPlayer.chkEnable = (ev) => {
					return ev.player.id == this.lastJoinedPlayerId;
				};

				labelPlayer.push(this.createLabel(480, 215 + (i * 60), "", 16, fontPlayer));
				labelPlayer[i].textColor = "white";
				this.append(labelPlayer[i]);
			}

			//リセットボタン
			const btnReset = new Button(this, ["リセット"], 360, 300);
			this.append(btnReset);
			btnReset.chkEnable = (ev) => {
				return ev.player.id == this.lastJoinedPlayerId;
			};
			btnReset.pushEvent = () => {
				reset();
			};

			//リセット処理
			const reset: () => void = () => {
				sprState.hide();
				for (let y = 1; y < mapLength + 1; y++) {
					for (let x = 1; x < mapLength + 1; x++) {
						const panel = panels[y][x];
						if (y == 1) {
							panel.setNum(0);
						} else if (y == mapLength) {
							panel.setNum(1);
						} else {
							panel.setNum(3);
						}
						panel.komaNum = -1;
					}
				}

				for (let i = 0; i < mapLength; i++) {
					komas[0][i].x = mapSize * i;
					komas[0][i].y = 0;
					komas[0][i].show();
					komas[0][i].modified();

					komas[1][i].x = mapSize * i;
					komas[1][i].y = mapSize * (mapLength - 1);
					komas[1][i].show();
					komas[1][i].modified();

					panels[1][i + 1].komaNum = i;
					panels[mapLength][i + 1].komaNum = i;
				}

				for (let i = 0; i < 2; i++) {
					scores[i] = 0;
					labelScore[i].text = "0";
					labelScore[i].invalidate();
				}

				playerIds = ["", ""];
				for (let i = 0; i < 2; i++) {
					labelPlayer[i].text = "";
					labelPlayer[i].invalidate();
				}

				if (cursorNow.parent != null) {
					cursorNow.remove();
				}

				sprScores[1].append(cursorTeban);

				turn = 1;

			}

			//座標描画
			const numStrs = ["一", "二", "三", "四", "五", "六", "七", "八", "九"];
			for (let i = 0; i < mapLength; i++) {
				let label = this.createLabel(mapSize * i + 30, -42, "" + (9 - i));
				label.textColor = "white";
				label.invalidate();
				stage.append(label);

				label = this.createLabel(mapSize * mapLength, mapSize * i + 20, numStrs[i]);
				label.textColor = "white";
				label.invalidate();
				stage.append(label);
			}

			//枠の描画
			for (let i = 0; i < mapLength + 1; i++){
				stage.append(this.createRect(mapSize * i-2, -2, 4, mapSize * mapLength + 4));
				stage.append(this.createRect(-2,mapSize * i-2,  mapSize * mapLength + 4, 4));
			}

			//手番表示用カーソル
			const cursorTeban = this.createRect(-12, 14, 12, 12, "red");

			//直近の着手の手番のカーソル
			const cursorNow = this.createRect(0, 0, mapSize, mapSize, "#ffff0030");

			for (let y = 0; y < mapLength + 2; y++){
				panels.push([]);
				for (let x = 0; x < mapLength + 2; x++) {
					const panel = new Panel(this, mapSize * ( x - 1 ), mapSize * ( y - 1 ), mapSize - 2, mapSize - 2);
					stage.append(panel);

					//クリックイベント
					panel.pointDown.add((ev) => {

						if (sprState.visible()) return;

						if (btnPlayers[turn % 2].num == 1 && ev.player.id != this.lastJoinedPlayerId) return;
						if (btnPlayers[turn % 2].num == 2 && ev.player.id == this.lastJoinedPlayerId) return;
						if (btnPlayers[turn % 2].num == 3 && (ev.player.id != playerIds[turn % 2] && playerIds[turn % 2] != "")) return;

						if (btnPlayers[turn % 2].num != 3 || (btnPlayers[turn % 2].num == 3 && playerIds[turn % 2] == "")) {
							playerIds[turn % 2] = ev.player.id
							if (ev.player.name != undefined) {
								labelPlayer[turn % 2].text = ev.player.name;
								labelPlayer[turn % 2].invalidate();
							}
						}

						if (panel.num == (turn % 2)) {
							movePoss.forEach((e) => {
								panels[e[1]][e[0]].setNum(3);
							});
							movePoss.length = 0;
							for (let i = 0; i < 4; i++){
								let xx = x;
								let yy = y;
								while (true) {
									xx+=dx[i];
									yy+=dy[i];
									if (panels[yy][xx].num >= 2) {
										panels[yy][xx].setNum(2);
										movePoss.push([xx, yy]);
									} else {
										break;
									}
								}
							}
							px = x;
							py = y;
						}
						
						if (panel.num == 2) {
							movePoss.forEach((e) => {
								panels[e[1]][e[0]].setNum(3);
							});
							movePoss.length = 0;
							panels[py][px].setNum(3);
							panels[y][x].setNum(turn % 2);
							const komaNum = panels[py][px].komaNum;
							panels[y][x].komaNum = komaNum;
							panels[py][px].komaNum = -1;

							const k = komas[turn % 2][komaNum];
							timeline.create(k, { modified: k.modified, destroyed: k.destroyed })
								.moveTo(panels[y][x].x, panels[y][x].y, 200);
							//komas[turn % 2][komaNum].x = panels[y][x].x;
							//komas[turn % 2][komaNum].y = panels[y][x].y;
							//komas[turn % 2][komaNum].modified();

							//挟んだとき
							let num = 0;
							const hitChk: (x:number,y:number,dx:number,dy:number) => boolean = (x,y,dx,dy) => {
								if (panels[y][x].num >= 2 || panels[y][x].num == -1) return false;
								if (panels[y][x].num == turn % 2) return true;
								if (hitChk(x + dx, y + dy, dx, dy)) {
									panels[y][x].setNum(3);
									const k = komas[(turn + 1) % 2][panels[y][x].komaNum];
									timeline.create(k, { modified: k.modified, destroyed: k.destroyed })
										.wait(300).call(() => k.hide());
									//komas[(turn + 1) % 2][panels[y][x].komaNum].hide();
									num++;
									return true;
								}
								return false;
							}

							for (let i = 0; i < 4; i++){
								hitChk(x + dx[i], y + dy[i], dx[i], dy[i]);
							}

							//囲ったとき
							const test: [number, number][] = [];
							const hitChk2: (x: number, y: number) => boolean = (x, y) => {
								if (panels[y][x].num >= 2) return false;
								if (panels[y][x].num == turn % 2 || panels[y][x].num == -1) return true;
								panels[y][x].num = turn % 2;
								let flg = true;
								for (let i = 0; i < 4; i++) {
									if (!hitChk2(x + dx[i], y + dy[i])) {
										flg = false;
									} 
								}

								panels[y][x].num = (turn + 1) % 2;
								if (flg) {
									test.push([x, y]);
									return true;
								} 
								return false;
							}

							for (let i = 0; i < 4; i++) {
								test.length = 0;
								if (hitChk2(x + dx[i], y + dy[i])) {
									test.forEach((e) => {
										panels[e[1]][e[0]].setNum(3);
										const k = komas[(turn + 1) % 2][panels[e[1]][e[0]].komaNum];
										timeline.create(k, { modified: k.modified, destroyed: k.destroyed })
											.wait(300).call(() => k.hide());
									});
									num += test.length;
								}
							}

							if (num != 0) {
								const i = turn % 2;
								scores[i] += num;
								labelScore[i].text = "" + scores[i];
								labelScore[i].invalidate();

								if (scores[i] >= 3) {
									sprState.show();
									sprState.frameNumber = i;
									sprState.modified();
								}
							}

							komas[turn % 2][panels[y][x].komaNum].append(cursorNow);

							turn++;

							sprScores[turn % 2].append(cursorTeban);
						}

					});

					if (x == 0 || y == 0 || x == mapLength + 1 || y == mapLength + 1) {
						panel.num = -1;
						panel.hide();
					}

					panels[y].push(panel);
				}
			}

			const komas: g.FrameSprite[][] = [];
			
			komas.push([]);
			for (let i = 0; i < mapLength; i++){
				const koma = new g.FrameSprite({
					scene: this,
					src: this.assets["koma"] as g.ImageAsset,
					width: 72,
					height: 72,
					frames: [0]
				});
				stage.append(koma);
				komas[0].push(koma);
				panels[1][i+1].komaNum = i;
			}

			komas.push([]);
			for (let i = 0; i < mapLength; i++) {
				const koma = new g.FrameSprite({
					scene: this,
					src: this.assets["koma"] as g.ImageAsset,
					width: 72,
					height: 72,
					frames: [1],
				});
				stage.append(koma);
				komas[1].push(koma);
				panels[mapLength][i + 1].komaNum = i;
			}
			
			reset();
		});
	}

	private createLabel(x: number, y: number, s: string,size:number = 32, f:g.Font = this.font) {
		return new g.Label({
			scene: this,
			x: x, y: y,
			text: s,
			fontSize: size,
			font: f
		});
	}

	private createRect(x: number, y: number, w: number, h: number, c: string = "white") {
		return new g.FilledRect({
			scene: this,
			x: x, y: y,
			width: w, height: h,
			cssColor: c,
		});
	}
}