function Game(){}

Game.prototype.init = function(fp, canvasWidth, canvasHeight, imageManager, soundManager){
	console.log("version: 1.22") // clean David test
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
	this.bossHolder = [];
	this.attackWaves = [];
	this.mainBall = new MainBall(this.fp, this.globalSpeed, this.canvasWidth, this.canvasHeight, this.soundManager, Math.random() * 300 +50, 600, this.pivots, this.bossHolder);
	this.mainBallHolder = [this.mainBall];
	this.camera = new Camera(this.fp, this.globalSpeed, this.canvasWidth, this.canvasHeight, this.mainBall, this.pivots, this.currentCombatStatus);
	this.cameraHolder = [this.camera];
	this.gameOver = false;
	this.gameOverScene = new GameOverScene(this.fp, this.canvasWidth, this.canvasHeight);
	this.gameOverSceneHolder = [this.gameOverScene];
	this.scoreBoard = new ScoreBoard(this.fp, this.canvasWidth, this.canvasHeight, this.camera);
	this.scoreBoardHolder = [this.scoreBoard];

	this.dungeonMaster = new DungeonMaster(this.fp, this.globalSpeed, this.canvasWidth, this.canvasHeight, this.imageManager, this.soundManager, this.camera, this.scoreBoard, this.pivots, this.mainBall, this.bossHolder, this.attackWaves);

	this.drawables.push(this.scoreBoardHolder);
	this.drawables.push(this.attackWaves);
	this.drawables.push(this.mainBallHolder);
	this.drawables.push(this.pivots);
	this.drawables.push(this.bossHolder);
	this.drawables.push(this.cameraHolder);
	this.drawables.push(this.gameOverSceneHolder);

}

Game.prototype.checkGameOver = function() {
	this.gameOver = this.dungeonMaster.checkGameOver();
	if (this.gameOver) {
		this.gameOverScene.isGameOver = true;
	}
}

Game.prototype.update = function() {
	if (this.gameOver) {
		this.dungeonMaster.fadeOutBgm();

		// Game over scene, clean up this
		this.gameOverScene.setScore(this.scoreBoard.getScore());
		this.gameOverScene.update();
	} else {
		this.checkGameOver();
		this.mainBall.update();
		this.camera.update();
		this.scoreBoard.update();
		this.dungeonMaster.update();
	}
}

Game.prototype.getDrawables = function() {
	return this.drawables;
}

Game.prototype.inputDownListener = function(touchX, touchY) {
	if (this.gameOverScene.readyToRestart()) {
		this.dungeonMaster.stopBGM();
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