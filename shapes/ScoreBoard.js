// Simple class example

function ScoreBoard(fp, canvasWidth, canvasHeight, camera) {
	this.fp = fp;
	this.canvasWidth = canvasWidth;
	this.canvasHeight = canvasHeight;
	this.camera = camera;

	this.combo = 0;
	this.comboAnimationCounter = -10;
	this.defaultComboAnimationCounter = 10;

	this.bossProgressRatio = 0;
	this.visibleBossPRogressRatio = 0;
	this.showBossProgress = true;
}

ScoreBoard.prototype.getScore = function() {
	return this.camera.getVisibleScore();
}

ScoreBoard.prototype.update = function() {
	this.score = this.camera.getVisibleScore();
	this.combo = this.camera.getCombo();
}

//A function for drawing the particle.
ScoreBoard.prototype.drawToContext = function(theContext) {
	theContext.font =80*this.fp+"px Comic Sans MS";
	theContext.fillStyle = "#99999955";
	theContext.textAlign = "center";
	theContext.fillText(this.score, this.canvasWidth/2, this.canvasHeight/5);

	// draw combo if needed 
	if (this.combo >= 3) {
		let comboFontMargin = 0;
		if (this.combo < 10) {
			comboFontMargin = this.combo*1*this.fp;
		} else {
			if (this.combo >= 20) {
				this.comboAnimationCounter+=2;
			} else if (this.combo >= 15){
				this.comboAnimationCounter+=1.5;
			} else {
				this.comboAnimationCounter++;
			}
			if(this.comboAnimationCounter >= this.defaultComboAnimationCounter) this.comboAnimationCounter = -10;
				comboFontMargin = Math.abs(this.comboAnimationCounter)+10;
		}
		theContext.font = (30*this.fp+comboFontMargin)+"px Comic Sans MS";
		theContext.fillStyle = "#99999955";
		theContext.textAlign = "center";
		theContext.fillText(this.combo + " combo", this.canvasWidth/2, this.canvasHeight*3/10+comboFontMargin/2);
	}

	// draw boss progress if needed
	if (this.showBossProgress) {
		let marginX = 40 * this.fp;
		let marginY = 160 * this.fp;
		let height = 15 * this.fp;
		let boarder = 2 * this.fp;
		theContext.fillStyle = "#99999955";
		theContext.fillRect(marginX - boarder, marginY - boarder, this.canvasWidth + 2 * (boarder - marginX), height + 2 * boarder);
		theContext.fillStyle = "#FFFFFF";
		this.visibleBossPRogressRatio = (this.visibleBossPRogressRatio * 8 + this.bossProgressRatio) / 9;
		let progressX = (this.canvasWidth - 2 * marginX) * this.visibleBossPRogressRatio;
		theContext.fillRect(marginX, marginY, progressX, height);
	}
	
}

ScoreBoard.prototype.updateBossProgress = function(progressRatio) {
	this.bossProgressRatio = progressRatio;
}

ScoreBoard.prototype.shouldDestroy = function(theContext) {
	return false;
}