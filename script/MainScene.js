"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Button_1 = require("./Button");
var Panel_1 = require("./Panel");
var MainScene = /** @class */ (function (_super) {
    __extends(MainScene, _super);
    function MainScene(param) {
        var _this = this;
        param.assetIds = ["koma", "koma2", "win", "help", "img_numbers_n", "test"];
        _this = _super.call(this, param) || this;
        var tl = require("@akashic-extension/akashic-timeline");
        var timeline = new tl.Timeline(_this);
        //配信者のIDを取得
        _this.lastJoinedPlayerId = "";
        g.game.join.add(function (ev) {
            _this.lastJoinedPlayerId = ev.player.id;
        });
        _this.update.add(function () {
        });
        _this.loaded.add(function () {
            /*
            //背景
            const bg = this.createRect(0, 0, 640, 360, "gray");
            this.append(bg);
            */
            var playerIds = ["", ""];
            _this.font = new g.DynamicFont({
                game: g.game,
                fontFamily: g.FontFamily.Monospace,
                size: 15
            });
            var title = _this.createLabel(550, 0, "はさみ将棋", 15);
            title.textColor = "white";
            title.invalidate();
            _this.append(title);
            var help = new g.Sprite({
                scene: _this,
                src: _this.assets["help"],
                x: 490,
                y: 292
            });
            _this.append(help);
            var glyph = JSON.parse(_this.assets["test"].data);
            var numFont = new g.BitmapFont({
                src: _this.assets["img_numbers_n"],
                map: glyph.map,
                defaultGlyphWidth: glyph.width,
                defaultGlyphHeight: glyph.height,
                missingGlyph: glyph.missingGlyph
            });
            var mapLength = 9;
            var mapSize = 72;
            var turn = 0;
            var panels = [];
            var dx = [0, 0, 1, -1];
            var dy = [1, -1, 0, 0];
            var movePoss = [];
            var px = 0;
            var py = 0;
            var scale = 330 / (mapSize * mapLength);
            var stage = new g.E({ scene: _this, x: 5, y: 20, scaleX: scale, scaleY: scale });
            _this.append(stage);
            //勝敗
            var sprState = new g.FrameSprite({
                scene: _this,
                src: _this.assets["win"],
                x: 350,
                y: 10,
                width: 150, height: 150,
                frames: [0, 1]
            });
            _this.append(sprState);
            //スコア
            var scores = [0, 0];
            var sprScores = [];
            var labelScore = [];
            var labelPlayer = [];
            var btnPlayers = [];
            var fontPlayer = new g.DynamicFont({
                game: g.game,
                fontFamily: g.FontFamily.Monospace,
                size: 32
            });
            for (var i = 0; i < 2; i++) {
                var stone = new g.FrameSprite({
                    scene: _this,
                    src: _this.assets["koma2"],
                    x: 360,
                    y: 185 + (i * 60),
                    width: 40, height: 40,
                    frames: [i]
                });
                sprScores.push(stone);
                _this.append(stone);
                labelScore.push(_this.createLabel(410, 190 + (i * 60), "0", 32, numFont));
                _this.append(labelScore[i]);
                var btnPlayer = new Button_1.Button(_this, ["全員", "配信者", "視聴者", "先着"], 480, 185 + (i * 60), 100, 30);
                btnPlayer.label.fontSize = 20;
                btnPlayer.label.invalidate();
                _this.append(btnPlayer);
                btnPlayers.push(btnPlayer);
                btnPlayer.chkEnable = function (ev) {
                    return ev.player.id == _this.lastJoinedPlayerId;
                };
                labelPlayer.push(_this.createLabel(480, 215 + (i * 60), "", 16, fontPlayer));
                labelPlayer[i].textColor = "white";
                _this.append(labelPlayer[i]);
            }
            //リセットボタン
            var btnReset = new Button_1.Button(_this, ["リセット"], 360, 300);
            _this.append(btnReset);
            btnReset.chkEnable = function (ev) {
                return ev.player.id == _this.lastJoinedPlayerId;
            };
            btnReset.pushEvent = function () {
                reset();
            };
            //リセット処理
            var reset = function () {
                sprState.hide();
                for (var y = 1; y < mapLength + 1; y++) {
                    for (var x = 1; x < mapLength + 1; x++) {
                        var panel = panels[y][x];
                        if (y == 1) {
                            panel.setNum(0);
                        }
                        else if (y == mapLength) {
                            panel.setNum(1);
                        }
                        else {
                            panel.setNum(3);
                        }
                        panel.komaNum = -1;
                    }
                }
                for (var i = 0; i < mapLength; i++) {
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
                for (var i = 0; i < 2; i++) {
                    scores[i] = 0;
                    labelScore[i].text = "0";
                    labelScore[i].invalidate();
                }
                playerIds = ["", ""];
                for (var i = 0; i < 2; i++) {
                    labelPlayer[i].text = "";
                    labelPlayer[i].invalidate();
                }
                if (cursorNow.parent != null) {
                    cursorNow.remove();
                }
                sprScores[1].append(cursorTeban);
                turn = 1;
            };
            //座標描画
            var numStrs = ["一", "二", "三", "四", "五", "六", "七", "八", "九"];
            for (var i = 0; i < mapLength; i++) {
                var label = _this.createLabel(mapSize * i + 30, -42, "" + (9 - i));
                label.textColor = "white";
                label.invalidate();
                stage.append(label);
                label = _this.createLabel(mapSize * mapLength, mapSize * i + 20, numStrs[i]);
                label.textColor = "white";
                label.invalidate();
                stage.append(label);
            }
            //枠の描画
            for (var i = 0; i < mapLength + 1; i++) {
                stage.append(_this.createRect(mapSize * i - 2, -2, 4, mapSize * mapLength + 4));
                stage.append(_this.createRect(-2, mapSize * i - 2, mapSize * mapLength + 4, 4));
            }
            //手番表示用カーソル
            var cursorTeban = _this.createRect(-12, 14, 12, 12, "red");
            //直近の着手の手番のカーソル
            var cursorNow = _this.createRect(0, 0, mapSize, mapSize, "#ffff0030");
            var _loop_1 = function (y) {
                panels.push([]);
                var _loop_2 = function (x) {
                    var panel = new Panel_1.Panel(_this, mapSize * (x - 1), mapSize * (y - 1), mapSize - 2, mapSize - 2);
                    stage.append(panel);
                    //クリックイベント
                    panel.pointDown.add(function (ev) {
                        if (sprState.visible())
                            return;
                        if (btnPlayers[turn % 2].num == 1 && ev.player.id != _this.lastJoinedPlayerId)
                            return;
                        if (btnPlayers[turn % 2].num == 2 && ev.player.id == _this.lastJoinedPlayerId)
                            return;
                        if (btnPlayers[turn % 2].num == 3 && (ev.player.id != playerIds[turn % 2] && playerIds[turn % 2] != ""))
                            return;
                        if (btnPlayers[turn % 2].num != 3 || (btnPlayers[turn % 2].num == 3 && playerIds[turn % 2] == "")) {
                            playerIds[turn % 2] = ev.player.id;
                            if (ev.player.name != undefined) {
                                labelPlayer[turn % 2].text = ev.player.name;
                                labelPlayer[turn % 2].invalidate();
                            }
                        }
                        if (panel.num == (turn % 2)) {
                            movePoss.forEach(function (e) {
                                panels[e[1]][e[0]].setNum(3);
                            });
                            movePoss.length = 0;
                            for (var i = 0; i < 4; i++) {
                                var xx = x;
                                var yy = y;
                                while (true) {
                                    xx += dx[i];
                                    yy += dy[i];
                                    if (panels[yy][xx].num >= 2) {
                                        panels[yy][xx].setNum(2);
                                        movePoss.push([xx, yy]);
                                    }
                                    else {
                                        break;
                                    }
                                }
                            }
                            px = x;
                            py = y;
                        }
                        if (panel.num == 2) {
                            movePoss.forEach(function (e) {
                                panels[e[1]][e[0]].setNum(3);
                            });
                            movePoss.length = 0;
                            panels[py][px].setNum(3);
                            panels[y][x].setNum(turn % 2);
                            var komaNum = panels[py][px].komaNum;
                            panels[y][x].komaNum = komaNum;
                            panels[py][px].komaNum = -1;
                            var k = komas[turn % 2][komaNum];
                            timeline.create(k, { modified: k.modified, destroyed: k.destroyed })
                                .moveTo(panels[y][x].x, panels[y][x].y, 200);
                            //komas[turn % 2][komaNum].x = panels[y][x].x;
                            //komas[turn % 2][komaNum].y = panels[y][x].y;
                            //komas[turn % 2][komaNum].modified();
                            //挟んだとき
                            var num_1 = 0;
                            var hitChk_1 = function (x, y, dx, dy) {
                                if (panels[y][x].num >= 2 || panels[y][x].num == -1)
                                    return false;
                                if (panels[y][x].num == turn % 2)
                                    return true;
                                if (hitChk_1(x + dx, y + dy, dx, dy)) {
                                    panels[y][x].setNum(3);
                                    var k_1 = komas[(turn + 1) % 2][panels[y][x].komaNum];
                                    timeline.create(k_1, { modified: k_1.modified, destroyed: k_1.destroyed })
                                        .wait(300).call(function () { return k_1.hide(); });
                                    //komas[(turn + 1) % 2][panels[y][x].komaNum].hide();
                                    num_1++;
                                    return true;
                                }
                                return false;
                            };
                            for (var i = 0; i < 4; i++) {
                                hitChk_1(x + dx[i], y + dy[i], dx[i], dy[i]);
                            }
                            //囲ったとき
                            var test_1 = [];
                            var hitChk2_1 = function (x, y) {
                                if (panels[y][x].num >= 2)
                                    return false;
                                if (panels[y][x].num == turn % 2 || panels[y][x].num == -1)
                                    return true;
                                panels[y][x].num = turn % 2;
                                var flg = true;
                                for (var i = 0; i < 4; i++) {
                                    if (!hitChk2_1(x + dx[i], y + dy[i])) {
                                        flg = false;
                                    }
                                }
                                panels[y][x].num = (turn + 1) % 2;
                                if (flg) {
                                    test_1.push([x, y]);
                                    return true;
                                }
                                return false;
                            };
                            for (var i = 0; i < 4; i++) {
                                test_1.length = 0;
                                if (hitChk2_1(x + dx[i], y + dy[i])) {
                                    test_1.forEach(function (e) {
                                        panels[e[1]][e[0]].setNum(3);
                                        var k = komas[(turn + 1) % 2][panels[e[1]][e[0]].komaNum];
                                        timeline.create(k, { modified: k.modified, destroyed: k.destroyed })
                                            .wait(300).call(function () { return k.hide(); });
                                    });
                                    num_1 += test_1.length;
                                }
                            }
                            if (num_1 != 0) {
                                var i = turn % 2;
                                scores[i] += num_1;
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
                };
                for (var x = 0; x < mapLength + 2; x++) {
                    _loop_2(x);
                }
            };
            for (var y = 0; y < mapLength + 2; y++) {
                _loop_1(y);
            }
            var komas = [];
            komas.push([]);
            for (var i = 0; i < mapLength; i++) {
                var koma = new g.FrameSprite({
                    scene: _this,
                    src: _this.assets["koma"],
                    width: 72,
                    height: 72,
                    frames: [0]
                });
                stage.append(koma);
                komas[0].push(koma);
                panels[1][i + 1].komaNum = i;
            }
            komas.push([]);
            for (var i = 0; i < mapLength; i++) {
                var koma = new g.FrameSprite({
                    scene: _this,
                    src: _this.assets["koma"],
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
        return _this;
    }
    MainScene.prototype.createLabel = function (x, y, s, size, f) {
        if (size === void 0) { size = 32; }
        if (f === void 0) { f = this.font; }
        return new g.Label({
            scene: this,
            x: x, y: y,
            text: s,
            fontSize: size,
            font: f
        });
    };
    MainScene.prototype.createRect = function (x, y, w, h, c) {
        if (c === void 0) { c = "white"; }
        return new g.FilledRect({
            scene: this,
            x: x, y: y,
            width: w, height: h,
            cssColor: c,
        });
    };
    return MainScene;
}(g.Scene));
exports.MainScene = MainScene;
