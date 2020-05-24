// Simple class example

function Pivot(fp, globalSpeed, canvasWidth, canvasHeight, posX, posY, radius, pivotColor) {
	this.fp = fp;
	this.globalSpeed = globalSpeed;
	this.canvasWidth = canvasWidth;
	this.canvasHeight = canvasHeight;
	this.x = posX * fp;
	this.y = posY * fp;
	this.velX = 0;
	this.velY = 0;
	this.accelX = 0;
	this.accelY = 0;
	this.color = pivotColor;
	this.strokeStyle = "#005500"

	this.aimColor = "#FFFF00";
	this.aimStrokeStyle = "#999900"

	this.usedColor = "#88000055";
	this.usedStrokeStyle = "#44000077";

	this.isAiming = false;
	this.radius = radius * fp;
	this.isHooked = false;

	this.isUsed = false;
	this.isUsedTimer = -100;

	this.destroySoon = false;

	this.originLimitBreakCounter = 0;
	this.limitBreakCounter = 0;

	this.isSuperPivot = false;
	this.defaultSuperPivotAnimationTimer = 60;
	this.superPivotAnimationTimer = 0;

	this.isShowingLimitBreak = false;
}

Pivot.prototype.setUsed = function(isBossBattle) {
	this.isUsed = true;
	this.isUsedTimer = isBossBattle? 720 : -100;
}

Pivot.prototype.update = function() {

	// super pivot animation
	if (this.isSuperPivot && (this.isHooked || !this.isUsed)) {
		this.superPivotAnimationTimer++;
		if (this.superPivotAnimationTimer >= this.defaultSuperPivotAnimationTimer) {
			this.superPivotAnimationTimer = 0;
		}
	}


	if (this.isUsed && this.isUsedTimer != -100) {
		this.isUsedTimer-= this.globalSpeed["ratio"];
		if(this.isUsedTimer <= 0) {
			this.isUsed = false;
		}
	}
	this.velY += this.accelY;
	this.y += this.velY;
}

Pivot.prototype.setHooked = function(isHooked) {
	this.isHooked = isHooked;
	this.limitBreakCounter = 0;
	this.isShowingLimitBreak = false;
}

Pivot.prototype.setLimitBreakCounter = function(limitBreak) {
	this.originLimitBreakCounter += limitBreak;
	this.limitBreakCounter += limitBreak;
	this.isShowingLimitBreak = true;
}

Pivot.prototype.triggerLimitBreak = function(speedBonus) {
	let dis = (this.originLimitBreakCounter*12/20 - Math.abs(this.limitBreakCounter - this.originLimitBreakCounter/2))/35;
	dis += speedBonus * (this.originLimitBreakCounter*1/40) / 35;
	if (this.limitBreakCounter > 0) {
		this.limitBreakCounter-= dis;
		this.y -= dis * this.fp;
	}
}

//A function for drawing the particle.
Pivot.prototype.drawToContext = function(theContext) {

	// super pivot animation
	if (this.isSuperPivot && (this.isHooked || !this.isUsed)) {
		let spaProgress = this.superPivotAnimationTimer / this.defaultSuperPivotAnimationTimer;
		theContext.beginPath();
		theContext.arc(this.x, this.y, this.radius * 3 * spaProgress, 0, 2 * Math.PI);
		theContext.fillStyle = "rgba(255, 255, 0, " + (1 - spaProgress) + ")";
		theContext.fill();
	}

	// draw the pivot
	if (this.isAiming || this.isHooked) {
		theContext.fillStyle = this.aimColor;
		theContext.strokeStyle = this.aimStrokeStyle;
	} else if (this.isUsed) {
		theContext.fillStyle = this.usedColor;
		theContext.strokeStyle = this.usedStrokeStyle;
	} else {
		theContext.fillStyle = this.color;
		theContext.strokeStyle = this.strokeStyle;
	}

	theContext.beginPath();
	let sqr = 0.8 * this.radius;
 	theContext.moveTo(this.x - sqr, this.y - sqr);
    theContext.lineTo(this.x - sqr, this.y + sqr);
    theContext.lineTo(this.x + sqr, this.y + sqr);
    theContext.lineTo(this.x + sqr, this.y - sqr);
	theContext.closePath();
	theContext.fill();
	theContext.lineWidth = 2 * this.fp;
	theContext.stroke();

	theContext.beginPath();
 	theContext.moveTo(this.x + this.radius, this.y);
    theContext.lineTo(this.x, this.y + this.radius);
    theContext.lineTo(this.x - this.radius, this.y);
    theContext.lineTo(this.x, this.y - this.radius);
	theContext.closePath();
	theContext.fill();
	theContext.lineWidth = 2 * this.fp;
	theContext.stroke();

	// draw the LB animation
	if (this.isShowingLimitBreak) {
		let rawProgress = 1 - this.limitBreakCounter / this.originLimitBreakCounter;
		let progress = 	Math.min(1, rawProgress * 1.1);

		let limitBreakerWidth = (10 + progress * 2) * this.fp;
		theContext.fillStyle = "rgba(255, " + (1-progress)*125+ ", 0, 0.3)";
		let margin = (1.15*this.radius);

		// left
		theContext.fillRect((this.x - margin) * progress, (this.y - margin) * progress, limitBreakerWidth, this.canvasHeight - progress * (this.canvasHeight - 2 * margin));
		// right
		theContext.fillRect(this.canvasWidth * (1 - progress) + (this.x + margin) * progress, (this.y - margin) * progress, 
			-limitBreakerWidth, this.canvasHeight - progress * (this.canvasHeight - 2 * margin));
		// top
		theContext.fillRect((this.x - margin) * progress, (this.y - margin) * progress, this.canvasWidth - progress * (this.canvasWidth - 2 * margin), limitBreakerWidth);
		// bottom
		theContext.fillRect((this.x - margin) * progress, this.canvasHeight * (1 - progress) + (this.y + margin) * progress, 
			this.canvasWidth - progress * (this.canvasWidth - 2 * margin), -limitBreakerWidth);


		let earlyProgress = Math.min(1, progress * 5);
		let earlyLimitBreakerWidth = (10 - earlyProgress * 6) * this.fp;
		theContext.fillStyle = "rgba(255, " + (1-earlyProgress)*125+ ", 0, 0.8)";
		let earlyMargin = (1.15 * this.radius)/earlyProgress;
		// left
		theContext.fillRect(this.x - earlyMargin, this.y - earlyMargin, earlyLimitBreakerWidth, 2*earlyMargin);
		// right
		theContext.fillRect(this.x + earlyMargin, this.y - earlyMargin, -earlyLimitBreakerWidth, 2*earlyMargin);
		// top
		theContext.fillRect(this.x - earlyMargin, this.y - earlyMargin, 2 * earlyMargin, earlyLimitBreakerWidth);
		// bottom
		theContext.fillRect(this.x - earlyMargin, this.y + earlyMargin, 2 * earlyMargin, -earlyLimitBreakerWidth);
	}
}

Pivot.prototype.shouldDestroy = function(theContext) {
	return this.destroySoon;
}