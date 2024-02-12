export class Panel extends g.FilledRect {
	public num = 3;
	public komaNum = -1;
	constructor(scene: g.Scene, x: number, y: number, w: number, h: number) {
		super({
			scene: scene,
			x: x, y: y,
			width: w, height: h,
			cssColor: "yellow",
			touchable: true,
			opacity:0
		});
	}

	private colorStrs: string[] = ["green", "blue", "yellow", "white"];
	public setNum(i: number) {
		this.num = i;
		//his.cssColor = this.colorStrs[i];
		//this.modified();
		if (i == 2) {
			this.opacity = 0.2;
		} else {
			this.opacity = 0;
		}
		this.modified();
	}
}