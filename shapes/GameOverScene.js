// Simple class example

function GameOverScene(canvasWidth, canvasHeight) {
	this.canvasWidth = canvasWidth;
	this.canvasHeight = canvasHeight;
	this.isGameOver = false;
	this.gameOverTimer = 0;
	this.gameOverPeriod = 60;
	this.score = 0;
}
GameOverScene.prototype.update = function() {
	if (this.isGameOver && this.gameOverTimer < this.gameOverPeriod) {
		this.gameOverTimer++;
	}
}

GameOverScene.prototype.readyToRestart = function() {
	return this.gameOverTimer >= this.gameOverPeriod;
}

GameOverScene.prototype.setScore = function(score) {
	this.score = score;
}

//A function for drawing the particle.
GameOverScene.prototype.drawToContext = function(theContext) {
	if (this.isGameOver) {
		theContext.fillStyle = "rgba(150, 0, 0, " + this.gameOverTimer/(this.gameOverPeriod * 1.5) + ")";
		theContext.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
	}

	if (this.readyToRestart()) {
		theContext.font = "80px Comic Sans MS";
		theContext.fillStyle = "#000000";
		theContext.textAlign = "center";
		theContext.fillText(this.score, this.canvasWidth/2, this.canvasHeight/2);
		theContext.font = "50px Comic Sans MS";
		theContext.fillStyle = "#000000";
		theContext.textAlign = "center";
		theContext.fillText("Retry", this.canvasWidth/2, this.canvasHeight*2/3);
	}

}

GameOverScene.prototype.shouldDestroy = function(theContext) {
	return false;
}