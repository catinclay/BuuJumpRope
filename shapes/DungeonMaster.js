// Simple class example

function DungeonMaster(fp, globalSpeed, canvasWidth, canvasHeight, camera, scoreBoard, pivots, mainBall, bossHolder, attackWaves) {
	this.camera = camera;
	this.scoreBoard = scoreBoard;
	this.pivots = pivots;
	this.fp = fp;
	this.globalSpeed = globalSpeed;
	this.canvasWidth = canvasWidth;
	this.canvasHeight = canvasHeight;
	this.mainBall = mainBall;
	this.bossHolder = bossHolder;
	this.attackWaves = attackWaves;

	this.pivots.push(this.getNewPivot(200, 200, 20));
	this.pivots.push(this.getNewPivot(300, 300, 20));
	this.pivots.push(this.getNewPivot(150, 400, 20));

	this.bossBattle = false;
	this.bossBattleReady = false;
	this.bossBattleMilestone = 75;
	this.previousBossBattleMilestone = 0;
	this.killedBoss = 0;

	this.bossComingAnimationDelay = 300;
	this.bossOffset = -400;

	this.bossDeadAnimationDelay = 180;
}

//The function below returns a Boolean value representing whether the point with the coordinates supplied "hits" the particle.
DungeonMaster.prototype.update = function() {
	for (var i = this.pivots.length - 1; i >= 0; i--) {
		this.pivots[i].update();
	}

	// update boss progress
	if (!this.bossBattleReady) {
		this.scoreBoard.showBossProgress = true;
		this.scoreBoard.updateBossProgress((this.getBossProgress() - this.previousBossBattleMilestone) / (this.bossBattleMilestone - this.previousBossBattleMilestone));
	} else {
		this.scoreBoard.showBossProgress = false;
	}

	if (!this.bossBattle) {
		this.checkGeneratePivot();
		this.checkBossComing();
	} else {
		for (var i = this.bossHolder.length - 1; i >= 0; i--) {
			this.bossHolder[i].update();
		}
		if (this.mainBall.isWaitBossDieDone()) {
			if (this.bossDeadAnimationDelay > 0) {
				this.bossDeadAnimationDelay--;
			} else if (this.bossDeadAnimationDelay == 0){
				this.bossDeadAnimationDelay--;
				this.prepareSuperPivot();
			}
		}
		// working on boss battle preparation
		if (!this.bossBattleReady) { 
			if (this.bossComingAnimationDelay >= 0) {
				this.bossComingAnimationDelay--;
				return;
	    	} else {
	    		this.prepareBossPivot();
	    		this.bossHolder.push(new Boss(this.fp, this.globalSpeed, this.canvasWidth, this.canvasHeight, 200, this.bossOffset-150, this.attackWaves));
	    	}
	    }
	}

	// end boss battle
	if (this.mainBall.hookedPivot != undefined && this.mainBall.hookedPivot.isSuperPivot) {
		this.bossBattle = false;
		this.bossBattleReady = false;
		this.bossDeadAnimationDelay = 180;
		this.bossComingAnimationDelay = 300;
	}

	// check boss die
	if (this.bossBattleReady && !this.mainBall.waitForBossDie) {
		let boss = this.bossHolder[0];
		if (boss.hp == 0) {
			this.killedBoss++;
			this.previousBossBattleMilestone = this.bossBattleMilestone;
			this.bossBattleMilestone += 75 + 35 * this.killedBoss;
			this.bossDying();
		}
	}
}

DungeonMaster.prototype.bossDying = function() {
	for (var i = this.pivots.length - 1; i >= 0; i--) {
		this.pivots[i].isUsed = true;
		this.pivots[i].accelY = 0.1;
	}
	for (var i = this.bossHolder.length - 1; i >= 0; i--) {
		this.bossHolder[i].accelY = 0.1;
	}
	this.mainBall.limitBreakerCounter = 100;
	this.mainBall.waitForBossDie = true;
}

DungeonMaster.prototype.prepareSuperPivot = function() {
	let superPivot = this.getNewPivot(200, 300, 20, "#FFFFFF");
	superPivot.originLimitBreakCounter = 500;
	superPivot.limitBreakCounter = 500;
	superPivot.isSuperPivot = true;
	this.pivots.push(superPivot);
}

DungeonMaster.prototype.prepareBossPivot = function() {
	let offset = this.bossOffset;

	this.pivots.push(this.getNewPivot(75, 100 + offset, 8, "#888888"));
	this.pivots.push(this.getNewPivot(200, 125 + offset, 15, "#888888"));
	this.pivots.push(this.getNewPivot(325, 100 + offset, 8, "#888888"));
	

	this.pivots.push(this.getNewPivot(150, 275 + offset, 15, "#888888"));
	this.pivots.push(this.getNewPivot(250, 275 + offset, 15, "#888888"));


	this.pivots.push(this.getNewPivot(75, 450 + offset, 8, "#888888"));
	this.pivots.push(this.getNewPivot(200, 425 + offset, 15, "#888888"));
	this.pivots.push(this.getNewPivot(325, 450 + offset, 8, "#888888"));


	this.pivots.push(this.getNewPivot(75, 100, 8, "#888888"));
	this.pivots.push(this.getNewPivot(200, 125, 15, "#888888"));
	this.pivots.push(this.getNewPivot(325, 100, 8, "#888888"));
	

	this.pivots.push(this.getNewPivot(150, 275, 15, "#888888"));
	this.pivots.push(this.getNewPivot(250, 275, 15, "#888888"));


	this.pivots.push(this.getNewPivot(75, 450, 8, "#888888"));
	this.pivots.push(this.getNewPivot(200, 425, 15, "#888888"));
	this.pivots.push(this.getNewPivot(325, 450, 8, "#888888"));

	this.bossBattleReady = true;
}

DungeonMaster.prototype.checkGameOver = function() {
	if (!this.bossBattle) {
		if (this.camera.getDeadLine() <= this.mainBall.y) {
			this.mainBall.hp = 0;
			return true;
		}
	} else {
		return this.mainBall.hp <= 0;
	}
	return false;
	
}

DungeonMaster.prototype.checkBossComing = function() {
	if (this.getBossProgress() >= this.bossBattleMilestone) {
		this.bossBattle = true;
		for (var i = this.pivots.length - 1; i >= 0; i--) {
			this.pivots[i].isUsed = true;
			this.pivots[i].accelY = 0.1;
		}
		this.camera.startBossBattle();
		this.mainBall.startBossBattle();
	}
}

DungeonMaster.prototype.getBossProgress = function() {
	return this.camera.getScore();
}


DungeonMaster.prototype.checkGeneratePivot = function(){
	//TODO clean up this
	let highestPivotY = this.pivots[this.pivots.length-1].y/this.fp;

	if (highestPivotY > -700* this.fp) {
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

DungeonMaster.prototype.getNewPivot = function(x, y, r, c) {
	if (c == undefined) c = this.getPivotColor();
	return new Pivot(this.fp, this.globalSpeed, this.canvasWidth, this.canvasHeight, x, y, r, c);
}

DungeonMaster.prototype.getPivotColor = function() {
	let score = this.camera.getScore();
	if (score > 300) {
		return "#AAAA00";
	} else if (score > 150) {
		return "#990099";
	} else if (score > 50) {
		return "#1111EE99";
	}
	return "#009900";
}

DungeonMaster.prototype.getExtraPivotRatio = function() {
	let score = this.camera.getScore();
	if (score > 250) {
		return 0.96;
	} else if (score > 125) {
		return 0.9;
	} 
	return 0.85
}

DungeonMaster.prototype.getRandomPivotX = function() {
	return Math.random() * 300 + 50;
}

DungeonMaster.prototype.getRandomPivotRadius = function() {
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

DungeonMaster.prototype.shouldDestroy = function() {
	return false;
}