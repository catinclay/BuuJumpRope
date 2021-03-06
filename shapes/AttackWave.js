// Simple class example

function AttackWave(fp, globalSpeed, posX, posY) {
	this.fp = fp;
	this.x = posX * fp;
	this.y = posY * fp;
	this.velX = 0;
	this.velY = 0;
	this.accelX = 0;
	this.accelY = 0;
	this.color = "#FF0000";
	this.width = 400 * this.fp;
	this.height = 200 * this.fp;
	this.globalSpeed = globalSpeed;

	this.destroySoon = false;
	
	this.defaultForecastCounter = 40;
	this.forecastCounter = this.defaultForecastCounter;
	this.preAttackTimer = 4 * this.defaultForecastCounter;
	this.onGoingAttackTimer = 0;
}

AttackWave.prototype.update = function() {
	if (this.preAttackTimer > 0) {
		this.preAttackTimer -= 1 * this.globalSpeed["ratio"];
		this.forecastCounter -= 1 * this.globalSpeed["ratio"];
		if (this.forecastCounter < 0) {
		 this.forecastCounter = this.defaultForecastCounter; 
		}
	} else {
		this.onGoingAttackTimer++;
		if (this.onGoingAttackTimer >= this.defaultForecastCounter * 1.8) {
			this.destroySoon = true;
		}
	}
}

AttackWave.prototype.hasDamage = function(ballY) {
	let inDamagePeriod = this.onGoingAttackTimer >= this.defaultForecastCounter && this.onGoingAttackTimer <= this.defaultForecastCounter *5/4;
	let inDamageArea = ballY >= this.y ? (ballY <= this.y + this.height ? true : false) :false;
	return inDamagePeriod && inDamageArea;
}

//A function for drawing the particle.
AttackWave.prototype.drawToContext = function(theContext) {
	if (this.preAttackTimer > 0) {
		let a = (Math.abs(this.forecastCounter - this.defaultForecastCounter/2))/this.defaultForecastCounter/3;
		theContext.fillStyle = "rgba(255, 0, 0, " + a + ")";
		theContext.fillRect(this.x - this.width/2, this.y, this.width, this.height);
		if (this.y >= 650 *this.fp) {
			theContext.fillStyle = "rgba(255, 0, 0, " + a + ")";
			let gap = 125 * this.fp;
			theContext.beginPath();
			for (var i = 0; i < 3; ++i) {
				theContext.moveTo(25 * this.fp + i * gap , 650 * this.fp);
				theContext.lineTo(125 * this.fp + i * gap , 650 * this.fp);
				theContext.lineTo(75 * this.fp + i * gap , 675 * this.fp);
				theContext.closePath();
			}
			theContext.fill();
		} else if (this.y <= 100 * this.fp - this.height){
			theContext.fillStyle = "rgba(255, 0, 0, " + a + ")";
			let gap = 125 * this.fp;
			theContext.beginPath();
			for (var i = 0; i < 3; ++i) {
				theContext.moveTo(25 * this.fp + i * gap , 100 * this.fp);
				theContext.lineTo(125 * this.fp + i * gap , 100 * this.fp);
				theContext.lineTo(75 * this.fp + i * gap , 75 * this.fp);
				theContext.closePath();
			}
			theContext.fill();
		}
	} else {
		if (this.onGoingAttackTimer <= this.defaultForecastCounter * 7 / 8) {
			theContext.fillStyle = "rgba(255, 0, 0, " + (0.2 + 0.3 * this.onGoingAttackTimer/this.defaultForecastCounter) + ")";
			theContext.fillRect(this.x - this.width/2, this.y, this.width, this.height);

		} else {
			let attackAnimationProgress = Math.min(this.defaultForecastCounter/4, this.onGoingAttackTimer - this.defaultForecastCounter* 7 / 8) / (this.defaultForecastCounter/4);
			let spikeWidth = 10 * this.fp;
			let spikeHeight = 20 * this.fp;
			theContext.beginPath();
			theContext.fillStyle = "#CC0000";
			let marginX = 5 * this.fp;
			let marginY = 10 * this.fp;
			let gapX = 3 * this.fp + spikeWidth;
			let gapY = 3 * this.fp + spikeHeight;
			for(var i = 0; i < 31; ++i) {
				for(var j = 0; j < 9; ++j) {
					theContext.moveTo(marginX + i * gapX - spikeWidth/2, this.y + j * gapY + marginY);
					theContext.lineTo(marginX + i * gapX + spikeWidth/2, this.y + j * gapY + marginY);
					theContext.lineTo(marginX + i * gapX, this.y - (attackAnimationProgress * spikeHeight) + j * gapY+ marginY);
					theContext.closePath();
				}
			}
			theContext.fill();
		}
	}
}

AttackWave.prototype.shouldDestroy = function(theContext) {
	return this.destroySoon;
}