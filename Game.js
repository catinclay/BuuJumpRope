function Game(){}

Game.prototype.init = function(fp, canvasWidth, canvasHeight, imageManager, soundManager){
	console.log("version: 1.05")
	// flexible pixel.
	this.fp = fp;
	this.canvasWidth = canvasWidth;
	this.canvasHeight = canvasHeight;
	this.imageManager = imageManager;
	this.soundManager = soundManager;
	this.initGame();
}

Game.prototype.initGame = function() {
	this.drawables = [];
	this.globalSpeed = {ratio:1};
	this.pivots = [];
	this.mainBall = new MainBall(this.fp, this.globalSpeed, this.canvasWidth, this.canvasHeight, Math.random() * 300 +50, 600, this.pivots);
	this.mainBallHolder = [this.mainBall];
	this.camera = new Camera(this.fp, this.canvasWidth, this.canvasHeight, this.mainBall, this.pivots);
	this.cameraHolder = [this.camera];
	this.pivots.push(new Pivot(this.fp, this.globalSpeed, 200, 200, 20));
	this.pivots.push(new Pivot(this.fp, this.globalSpeed, 300, 300, 20));
	this.pivots.push(new Pivot(this.fp, this.globalSpeed, 150, 400, 20));
	this.gameOver = false;
	this.gameOverScene = new GameOverScene(this.fp, this.canvasWidth, this.canvasHeight);
	this.gameOverSceneHolder = [this.gameOverScene];
	this.scoreBoard = new ScoreBoard(this.fp, this.canvasWidth, this.canvasHeight, this.camera);
	this.scoreBoardHolder = [this.scoreBoard];

	this.drawables.push(this.scoreBoardHolder);
	this.drawables.push(this.mainBallHolder);
	this.drawables.push(this.pivots);
	this.drawables.push(this.cameraHolder);
	this.drawables.push(this.gameOverSceneHolder);

}


Game.prototype.generatePivot = function(){
	//TODO clean up this
	let highestPivot = this.pivots[this.pivots.length-1];
	if (highestPivot.y > 0) {
		this.pivots.push(new Pivot(this.fp, this.globalSpeed, this.getRandomPivotX(), highestPivot.y/this.fp - 50 - Math.random() * 100, this.getRandomPivotRadius()));
		if (Math.random() > 0.85) {
			this.pivots.push(new Pivot(this.fp, this.globalSpeed, this.getRandomPivotX(), highestPivot.y/this.fp - Math.random() * 20, this.getRandomPivotRadius()));
		}
	}
}

Game.prototype.getRandomPivotX = function() {
	return Math.random() * 300 + 50;
}

Game.prototype.getRandomPivotRadius = function() {
	return Math.random() * 8 + Math.random() * 8 + 4;
}

Game.prototype.checkGameOver = function() {
	if (this.camera.getDeadLine() <= this.mainBall.y) {
		this.gameOver = true;
		this.gameOverScene.isGameOver = true;
	}
}

Game.prototype.update = function() {
	this.checkGameOver();
	if (this.gameOver) {
		// Game over scene, clean up this
		this.gameOverScene.setScore(this.scoreBoard.getScore());
		this.gameOverScene.update();
	} else {
		this.mainBall.update();
		this.camera.update();
		this.scoreBoard.update();
		this.generatePivot();
	}
}

Game.prototype.getDrawables = function() {
	return this.drawables;
}

Game.prototype.inputDownListener = function(touchX, touchY) {
	if (this.gameOverScene.readyToRestart()) {
		this.initGame();
	} else {
		this.mainBall.charge(); // charging
	}
}

Game.prototype.inputMoveListener = function(touchX, touchY) {
}

Game.prototype.inputUpListener = function(touchX, touchY) {
	this.mainBall.fire();
}