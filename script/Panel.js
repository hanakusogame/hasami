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
var Panel = /** @class */ (function (_super) {
    __extends(Panel, _super);
    function Panel(scene, x, y, w, h) {
        var _this = _super.call(this, {
            scene: scene,
            x: x, y: y,
            width: w, height: h,
            cssColor: "yellow",
            touchable: true,
            opacity: 0
        }) || this;
        _this.num = 3;
        _this.komaNum = -1;
        _this.colorStrs = ["green", "blue", "yellow", "white"];
        return _this;
    }
    Panel.prototype.setNum = function (i) {
        this.num = i;
        //his.cssColor = this.colorStrs[i];
        //this.modified();
        if (i == 2) {
            this.opacity = 0.2;
        }
        else {
            this.opacity = 0;
        }
        this.modified();
    };
    return Panel;
}(g.FilledRect));
exports.Panel = Panel;
