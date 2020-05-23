// Simple class example

function Boss(fp, globalSpeed, canvasWidth, canvasHeight, posX, posY, attackWaves) {
		this.x = posX * fp;
		this.y = posY * fp;
		this.fp = fp;
		this.globalSpeed = globalSpeed;
		this.canvasWidth = canvasWidth;
		this.canvasHeight = canvasHeight;
		this.velX = 0;
		this.velY = 0;
		this.accelX = 0;
		this.accelY = 0;
		this.color = "#BB8888";
		this.width = 400 * this.fp;
		this.height = 200 * this.fp;
		this.maxHp = 100;
		this.hp = 100;
		this.displayHp = this.hp;
		this.isDead = false;

		// Attack
		this.attackCountDown = 180;
		this.attackPeriod = 180;
		this.attackWaves = attackWaves;
		this.attackWavesIndexCD = [0, 0, 0, 0, 0, 0];
}

Boss.prototype.update = function() {
	this.attackCountDown--;
	if (this.attackCountDown <= 0) {
		this.attackCountDown = this.attackPeriod;
		this.attack();
	}

	// Process attackWaves CD
	for (var i = this.attackWavesIndexCD.length - 1; i >= 0; i--) {
		if (this.attackWavesIndexCD[i] > 0) {
			this.attackWavesIndexCD[i]--;
		}
	}

	// Clean up attackWaves if dead
	for (var i = this.attackWaves.length - 1; i >= 0; i--) {
		if (this.hp == 0) {
			this.attackWaves[i].destroySoon = true;
		}
		this.attackWaves[i].update();
	}
	this.velY += this.accelY;
	this.y += this.velY;
}

Boss.prototype.attack = function() {
	let availableIndices = [];
	for (var i = this.attackWavesIndexCD.length - 1; i >= 0; i--) {
		if (this.attackWavesIndexCD[i] <= 0) {
			availableIndices.push(i);
		}
	}
	let randomIndex = Math.floor(Math.random() * availableIndices.length);
	
	let newAttackWave = new AttackWave(this.fp, this.globalSpeed, 200, 10 + this.y/this.fp + 200 * availableIndices[randomIndex]);
	this.attackWaves.push(newAttackWave);
	this.attackWavesIndexCD[randomIndex] = newAttackWave.defaultForecastCounter * 5;
}

Boss.prototype.damage = function(attack) {
	this.hp -= attack;
	if (this.hp < 0) { this.hp = 0; }
}

Boss.prototype.camMove = function(dy) {
	this.y += dy;
	for (var i = this.attackWaves.length - 1; i >= 0; i--) {
		this.attackWaves[i].y += dy;
	}
}

//A function for drawing the particle.
Boss.prototype.drawToContext = function(theContext) {
	let margin = 3 * this.fp;
	theContext.fillStyle = this.color;
	theContext.fillRect(this.x - this.width/2 + margin, this.y - this.height, this.width - 2 * margin, this.height);

	let hpBoarderWidth = 2 * this.fp;
	let hpSlotXDis = 30 * this.fp;
	let hpSlotYDis = 40 * this.fp;
	let hpSlotHeight = 15 * this.fp;

	theContext.fillStyle = "#330000";
	theContext.fillRect(hpSlotXDis - hpBoarderWidth, hpSlotYDis - hpBoarderWidth, this.canvasWidth - 2* hpSlotXDis + 2 * hpBoarderWidth, hpSlotHeight + 2* hpBoarderWidth);

	theContext.fillStyle = "#FFFFFF";
	theContext.fillRect(hpSlotXDis, hpSlotYDis, this.canvasWidth - 2* hpSlotXDis, hpSlotHeight);

	theContext.fillStyle = "#FF000088";
	theContext.fillRect(hpSlotXDis, hpSlotYDis, (this.canvasWidth - 2* hpSlotXDis) * this.displayHp / this.maxHp, hpSlotHeight);
	if (this.displayHp > this.hp) {
		this.displayHp = (this.displayHp * 8 + this.hp)/9;
	}

	theContext.fillStyle = "#FF0000";
	theContext.fillRect(hpSlotXDis, hpSlotYDis, (this.canvasWidth - 2* hpSlotXDis) * this.hp / this.maxHp, hpSlotHeight);
}

Boss.prototype.shouldDestroy = function(theContext) {
	return this.isDead;
}