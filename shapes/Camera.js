// Simple class example

function Camera(fp, globalSpeed, canvasWidth, canvasHeight, mainBall, pivots, currentCombatStatus) {
	this.fp = fp;
	this.globalSpeed = globalSpeed;
	this.baseLine = -35 * this.fp;
	this.hellOffset = -500 * this.fp;
	
	this.canvasWidth = canvasWidth;
	this.canvasHeight = canvasHeight;

	this.mainBall = mainBall;
	this.pivots = pivots;
	this.rawScore = 0;

	this.currentCombatStatus = currentCombatStatus;

	this.isLimitBreaking = false;
}


Camera.prototype.update = function() {
	// Is Limit Breaking
	if (this.mainBall.hookedPivot != undefined && this.mainBall.hookedPivot.limitBreakCounter > 0) {
		let dy = (this.canvasHeight*2/5 - this.mainBall.hookedPivot.y)/5;
		this.camMove(dy);
		this.rawScore += dy;
		this.isLimitBreaking = true;
		return;
	}
	// update hellOffset
	this.hellOffset = (-500 - this.getScore()) * this.fp;
	// After limit breaking
	if (this.isLimitBreaking) {
		if(this.mainBall.y >= this.canvasHeight*17/20) {
			this.camMove(2*this.fp);
			return;
		} else {
			this.isLimitBreaking = false;
			// reset baseLine without changing score.
			this.baseLine = this.hellOffset;
		}
	}


	// Go up
	if (this.mainBall.y <= this.canvasHeight * 2 / 20) {
		this.camMove(Math.max(10* this.fp, this.canvasHeight * 2/20 - this.mainBall.y));
	} else if (this.mainBall.y <= this.canvasHeight *7/ 20 ) {
		this.camMove(10 * this.fp);
	} else if (this.mainBall.y <= this.canvasHeight *11 / 20 ) {
		this.camMove(6 * this.fp);
	} else if (this.mainBall.y <= this.canvasHeight * 14 / 20 ) {
		// this.camMove(Math.min(this.canvasHeight * 12 / 20 - this.mainBall.y, 5 * this.fp));
		this.camMove(4 * this.fp);
	} else if (this.mainBall.y <= this.canvasHeight * 15 / 20 ) {
		this.camMove(Math.min(this.canvasHeight * 15 / 20 - this.mainBall.y, 2 * this.fp));
	} else if(this.mainBall.y >= this.canvasHeight*17/20) {
		// Go Down
		this.camMove(this.canvasHeight*17/20 - this.mainBall.y);	
	} else if (this.mainBall.y >= this.canvasHeight*15/20) {
		this.camMove(Math.max(this.canvasHeight*15/20 - this.mainBall.y, -2 * this.fp));	
	}

	if (this.baseLine <= -35 * this.fp) {
		this.increaseBaseLine(3, 1);
	} else 
	if (this.baseLine <= 45 * this.fp){
		this.increaseBaseLine(4/5, (this.globalSpeed["ratio"] + 2)/3);
	} else {
		this.increaseBaseLine(2/5, (this.globalSpeed["ratio"] + 1)/2);
	}
	if (this.baseLine < this.hellOffset) {
		this.increaseBaseLine(this.hellOffset - this.baseLine, 1);
	}
}

Camera.prototype.camMove = function(dy) {
	for (var i = this.pivots.length - 1; i >= 0; i--) {
		this.pivots[i].y += dy;
		if (this.pivots[i].y > this.getDeadLine()) {
			this.pivots[i].isUsed = true;
		} else if (this.pivots[i].y > this.canvasHeight - this.hellOffset) {
			this.pivots[i].destroySoon = true;
		}
	}
	this.mainBall.y += dy;
	this.baseLine -= dy;
}

//A function for drawing the particle.
Camera.prototype.drawToContext = function(theContext) {
	theContext.fillStyle = "#FF000077";
	let lineY = this.getDeadLine() - 5 * this.fp;
	theContext.beginPath();
	theContext.moveTo(0, lineY);
	for (var i = 1; i <=20 ; ++i) {
	    theContext.lineTo(this.canvasWidth/40 * (2 * i - 1), lineY - 35 * this.fp);
	    theContext.lineTo(this.canvasWidth/40 * (2 * i) , lineY);
	}
	theContext.closePath();
	theContext.fill();
	

	theContext.fillStyle = "#FF1100DD";
	lineY = this.getDeadLine() - 5 * this.fp;
	theContext.fillRect(0, lineY, this.canvasWidth, 500 * this.fp);
}

Camera.prototype.increaseBaseLine = function(dy, speedRatio) {
	this.rawScore += dy * speedRatio;
	this.baseLine += dy * this.fp * speedRatio;
	this.mainBall.setScore(this.getScore());
}

Camera.prototype.getScore = function() {
	return Math.floor(this.rawScore/200);
}

Camera.prototype.getCombo = function() {
	return this.mainBall.getCombo();
}

Camera.prototype.getDeadLine = function() {
	return this.canvasHeight - this.baseLine;
}

Camera.prototype.shouldDestroy = function() {
	return false;
}