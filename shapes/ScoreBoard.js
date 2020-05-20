// Simple class example

function ScoreBoard(fp, canvasWidth, canvasHeight, camera) {
	this.fp = fp;
	this.canvasWidth = canvasWidth;
	this.canvasHeight = canvasHeight;
	this.camera = camera;
}

ScoreBoard.prototype.getScore = function() {
	return this.camera.getScore();
}

ScoreBoard.prototype.update = function() {
	this.score = this.camera.getScore();
}

//A function for drawing the particle.
ScoreBoard.prototype.drawToContext = function(theContext) {
	theContext.font =80*this.fp+"px Comic Sans MS";
	theContext.fillStyle = "#99999955";
	theContext.textAlign = "center";
	theContext.fillText(this.score, this.canvasWidth/2, this.canvasHeight/5);

}

ScoreBoard.prototype.shouldDestroy = function(theContext) {
	return false;
}