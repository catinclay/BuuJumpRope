function Game(){}

Game.prototype.init = function(fp, canvasWidth, canvasHeight, imageManager, soundManager){
	console.log("version: 1.10") // clean David test
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
	this.camera = new Camera(this.fp, this.globalSpeed, this.canvasWidth, this.canvasHeight, this.mainBall, this.pivots, this.currentCombatStatus);
	this.cameraHolder = [this.camera];
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


	this.pivots.push(this.getNewPivot(200, 200, 20));
	this.pivots.push(this.getNewPivot(300, 300, 20));
	this.pivots.push(this.getNewPivot(150, 400, 20));

}


Game.prototype.checkGeneratePivot = function(){
	//TODO clean up this
	let highestPivotY = this.pivots[this.pivots.length-1].y/this.fp;

	if (highestPivotY > 0) {
		this.pivots.push(this.getNewPivot(
			this.getRandomPivotX(), highestPivotY - 60 - Math.random() * 100, 
			this.getRandomPivotRadius()));

		if (Math.random() > this.getExtraPivotRatio()) {
			this.pivots.push(this.getNewPivot(
			this.getRandomPivotX(), highestPivotY - Math.random() * 20, 
			this.getRandomPivotRadius()));
		}
	}
}

Game.prototype.getNewPivot = function(x, y, r) {
	let score = this.camera.getScore();
	let pivotColor = "#009900";
	if (score > 300) {
		pivotColor = "#AAAA00";
	} else if (score > 150) {
		pivotColor = "#990099";
	} else if (score > 50) {
		pivotColor = "#1111EE99";

	}
	return new Pivot(this.fp, this.globalSpeed, this.canvasWidth, this.canvasHeight, x, y, r, pivotColor);
}

Game.prototype.getExtraPivotRatio = function() {
	let score = this.camera.getScore();
	if (score > 250) {
		return 0.96;
	} else if (score > 125) {
		return 0.9;
	} 
	return 0.85
}

Game.prototype.getRandomPivotX = function() {
	return Math.random() * 300 + 50;
}

Game.prototype.getRandomPivotRadius = function() {
	let score = this.camera.getScore();
	if (score < 50)
		return Math.random() * 8 + Math.random() * 8 + 10;
	if (score < 100)
		return Math.random() * 8 + Math.random() * 7 + 5;
	if (score < 150)
		return Math.random() * 8 + Math.random() * 6 + 4;
	if (score < 200)
		return Math.random() * 8 + Math.random() * 5 + 3;
	if (score < 250)
		return Math.random() * 8 + Math.random() * 4 + 3;
	return Math.random() * 6 + Math.random() * 4 + 3;
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
		this.checkGeneratePivot();
	}
}

Game.prototype.getDrawables = function() {
	return this.drawables;
}

Game.prototype.inputDownListener = function(touchX, touchY) {
	if (this.gameOverScene.readyToRestart()) {
		this.initGame();
	} else {
		this.mainBall.inputDown(); // charging
	}
}

Game.prototype.inputMoveListener = function(touchX, touchY) {
}

Game.prototype.inputUpListener = function(touchX, touchY) {
	this.mainBall.inputUp();
}