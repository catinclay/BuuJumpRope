// Simple class example

function MainBall(fp, globalSpeed, canvasWidth, canvasHeight, posX, posY, pivots) {
	this.fp = fp
	this.canvasWidth = canvasWidth;
	this.canvasHeight = canvasHeight;
	this.x = posX * fp;
	this.y = posY * fp;
	this.velX = 0;
	this.velY = 0;
	this.accelX = 0;
	this.accelY = 0.15 * fp;
	this.color = "#FF0000";
	this.mainBallStrokeStyle = "#000000";
	this.radius = 10 * fp;


	// Pivots
	this.pivots = pivots;


	// Momentum
	// status:
	// 0 nature falling
	// 1 charging
	// 2 firing
	// 3 pulling
	this.status = 0;
	this.globalSpeed = globalSpeed;
	this.isStanding = true;
	this.defaultMaxSpeedSq = 120 * fp * fp;
	this.maxFallingSpeed = 14 * fp;

	// Charge
	this.chargeCounter = 0;
	this.defaultChargeTimer = 12;
	this.defaultChargingDistance = 4 * this.fp;
	this.chargingDistance = this.defaultChargingDistance;
	this.chargingSpeed = 4 * this.fp;
	this.chargingCycleWidth = 3 * this.fp;

	// Firing
	this.defaultFiringTimer = 10;
	this.currentFiringTimer = 0;
	this.hookedPivot;

	// Pulling
	this.pullingPower = 2;

	// Combo
	this.comboCount = 0;
}

MainBall.prototype.update = function() {
	this.globalSpeed["ratio"] = 1;
	if (this.status == 0) {
		// nature falling
		this.chargingDistance = this.defaultChargingDistance;
		this.chargeCounter = 0;
		this.velY += this.accelY * this.globalSpeed["ratio"];
		// clean hooked pivot
		if (this.hookedPivot != undefined) {
			this.hookedPivot.setHooked(false);
			this.hookedPivot = undefined;
		}
	} else if (this.status == 1) {
		// charging
		this.chargeCounter++;
		if (this.chargeCounter >= this.defaultChargeTimer) {
			this.globalSpeed["ratio"] = 0.2;
		}
		this.velY += this.accelY * this.globalSpeed["ratio"];
		if (this.chargingDistance >= 50 * this.fp) {
			this.chargingDistance += this.chargingSpeed;
		} else {
			this.chargingDistance += 0.5 * this.chargingSpeed;
		}
		// clean hooked pivot
		if (this.hookedPivot != undefined) {
			this.hookedPivot.setHooked(false);
			this.hookedPivot = undefined;
		}
	} else if (this.status == 2) {
		// firing

		// show a "delay" when first enter this status
		if(this.currentFiringTimer == 0) {
			this.velX /= 2;
			this.velY /= 3;
		}

		this.chargingDistance = this.defaultChargingDistance;
		this.chargeCounter = 0;
		this.globalSpeed["ratio"] = 0.2;
		this.currentFiringTimer++;
		if (this.currentFiringTimer >= this.defaultFiringTimer) {
			this.status = 3;
			this.currentFiringTimer = 0;
		}

	} else if (this.status == 3) {
		// pulling
		if (this.isStanding) {
			this.isStanding = false;
		}

		this.chargingDistance = this.defaultChargingDistance;
		this.chargeCounter = 0;
		if (this.hookedPivot == undefined) {
			this.status = 0;
			return;
		}
		var dist = this.disFP(this.hookedPivot);
		let ax = (this.hookedPivot.x - this.x) / dist;
		let ay = (this.hookedPivot.y - this.y) / dist;
		this.velX += ax * this.globalSpeed["ratio"];
		this.velY += ay * this.globalSpeed["ratio"];
	}

	if (this.isStanding && this.velY > 0) {
		this.velY = 0;
	}

	// Check aiming
	for (var i = this.pivots.length - 1; i >= 0; i--) {
		let p = this.pivots[i];
		var dist = this.disFP(p);
		if (!p.isUsed && dist - p.radius <= this.chargingDistance && dist + p.radius >= this.chargingDistance) {
			p.isAiming = true;
		} else {
			p.isAiming = false;
		}
	}

	// limit the max speed
	let currSpeed = this.velX * this.velX + this.velY * this.velY;
	let comboBonus = this.comboCount-1 > 20 ? 20: this.comboCount-1;
	comboBonus = Math.floor(comboBonus / 5) * 5;
	let maxSpeedSq = this.defaultMaxSpeedSq + comboBonus * 20 * this.fp * this.fp;
	if (currSpeed >= maxSpeedSq) {
		let scaleRatio = Math.sqrt(maxSpeedSq / currSpeed);
		this.velX *= scaleRatio;
		this.velY *= scaleRatio;
	}

	// limit the falling speed when nature falling
	if (this.status == 0) {
		this.velY = this.velY >= this.maxFallingSpeed ? this.maxFallingSpeed : this.velY;
	}

	// VelX resistence
	this.velX *= 0.997;

	// Update position
	this.x += this.velX * this.globalSpeed["ratio"];
	this.y += this.velY * this.globalSpeed["ratio"];


	// Bounce
	if (this.x <= 0) {
		this.x *= -1;
		this.velX *= -1;
	}
	if (this.x >= this.canvasWidth) {
		this.x = 2 * this.canvasWidth - this.x;
		this.velX *= -1;
	}

}

MainBall.prototype.charge = function() {
	// charging
	this.status = 1;
}

MainBall.prototype.fire = function() {
	// return if not charging
	if (this.status != 1) { return; }

	// check if charge long enough
	if (this.chargeCounter < this.defaultChargeTimer) {
		this.status = 0;
		return;
	}

	this.currentFiringTimer = 0;
	let targetPivot;
	for (var i = this.pivots.length - 1; i >= 0; i--) {
		let p = this.pivots[i];
		if (p.isAiming == false) { continue; }
		if (targetPivot == undefined || p.y < targetPivot.y) {
			targetPivot = p;
		}
	}
	if (targetPivot == undefined) {
		// no target, nature falling.
		this.comboCount = 0;
		this.status = 0;
		return;
	} else {
		this.comboCount++;
		// has target, firing
		this.status = 2;
		targetPivot.setHooked(true);
		targetPivot.isUsed = true;
		this.hookedPivot = targetPivot;
	}
}

MainBall.prototype.getCombo = function(){
	return this.comboCount;
}

MainBall.prototype.disFP = function(p) {
	return Math.sqrt((this.x - p.x) * (this.x - p.x) + (this.y - p.y) * (this.y - p.y));
}


//A function for drawing the particle.
MainBall.prototype.drawToContext = function(theContext) {
	// Draws the MainBall
	theContext.beginPath();
	theContext.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
	theContext.fillStyle = this.color;
	theContext.fill();
	theContext.strokeStyle = this.mainBallStrokeStyle;
	theContext.lineWidth = 2 * this.fp;
	theContext.stroke();

	// charging
	if (this.status == 1 && this.chargeCounter >= this.defaultChargeTimer) {
		// Draws the charging circle
		theContext.fillStyle = "#00000066";
		theContext.beginPath();
		theContext.arc(this.x, this.y, this.chargingDistance, 0, 1 * Math.PI, false);
		theContext.arc(this.x, this.y, this.chargingDistance + this.chargingCycleWidth, 1 * Math.PI, 0, true);
		theContext.closePath();
		theContext.fill();
		theContext.beginPath();
		theContext.arc(this.x, this.y, this.chargingDistance, 0, 1 * Math.PI, true);
		theContext.arc(this.x, this.y, this.chargingDistance + this.chargingCycleWidth, 1 * Math.PI, 0, false);
		theContext.closePath();
		theContext.fill();
	}

	// Draw the line
	let ropeLevel = Math.floor((this.comboCount-1 > 20 ? 20: this.comboCount-1)/5);
	let ropeColor = "#008800";
	if (ropeLevel >= 2) {
		ropeColor = "#880000"
	} else if (ropeLevel >= 1) {
		ropeColor = "#000088"
	}

	// firing
	if (this.status == 2) {
		// draw the line
		let dx = (this.hookedPivot.x - this.x) * this.currentFiringTimer / this.defaultFiringTimer;
		let dy = (this.hookedPivot.y - this.y) * this.currentFiringTimer / this.defaultFiringTimer;
		theContext.strokeStyle = ropeColor
		theContext.beginPath();
	 	theContext.moveTo(this.x, this.y);
    	theContext.lineTo(this.x + dx, this.y + dy);
		theContext.lineWidth = (2 + ropeLevel) * this.fp;
		theContext.stroke();
	}

	// pulling
	if (this.status == 3) {
		// draw the line
		theContext.strokeStyle = ropeColor
		theContext.beginPath();
	 	theContext.moveTo(this.x, this.y);
    	theContext.lineTo(this.hookedPivot.x, this.hookedPivot.y);
		theContext.lineWidth = (2 + ropeLevel) * this.fp;
		theContext.stroke();
	}
}

MainBall.prototype.shouldDestroy = function(theContext) {
	return false;
}