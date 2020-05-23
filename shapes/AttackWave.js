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
		if (this.onGoingAttackTimer >= this.defaultForecastCounter * 2) {
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
	} else {
		if (this.onGoingAttackTimer <= this.defaultForecastCounter) {
			theContext.fillStyle = "rgba(255, 0, 0, " + (0.2 + 0.3 * this.onGoingAttackTimer/this.defaultForecastCounter) + ")";
			theContext.fillRect(this.x - this.width/2, this.y, this.width, this.height);
		} else {
			let attackAnimationProgress = Math.min(this.defaultForecastCounter/4, this.onGoingAttackTimer - this.defaultForecastCounter) / (this.defaultForecastCounter/4);
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

			// let arrowEdge = 5 * this.fp;
			// let xDis = 480 * this.fp * ((this.onGoingAttackTimer - this.defaultForecastCounter)/this.defaultForecastCounter);
			// let yMargin = 5 * this.fp;
			// let yGap = 30 * this.fp;
			// theContext.strokeStyle = "#000000";
			// theContext.lineWidth = 2 * this.fp;
			// for (var i = 0; i < 5; ++i) {
			// 	   theContext.moveTo(xDis, this.y + yMargin + yGap * i);
			//     theContext.lineTo(xDis-3*arrowEdge, this.y - arrowEdge + yMargin + yGap * i);
			//     theContext.lineTo(xDis-3*arrowEdge, this.y + arrowEdge + yMargin + yGap * i);
			//     theContext.lineTo(xDis, this.y + yMargin + yGap * i);
			//     theContext.lineTo(xDis-80 * this.fp, this.y + yMargin + yGap * i);
	  		// }
			// theContext.stroke();
		}
	}
}

AttackWave.prototype.shouldDestroy = function(theContext) {
	return this.destroySoon;
}