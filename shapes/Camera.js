// Simple class example

function Camera(fp, canvasWidth, canvasHeight, mainBall, pivots) {
	this.fp = fp;
	this.baseLine = 0;
	this.hellOffset = -500 * this.fp;
	
	this.canvasWidth = canvasWidth;
	this.canvasHeight = canvasHeight;

	this.mainBall = mainBall;
	this.pivots = pivots;
	this.score = 0;
}


Camera.prototype.update = function() {
	// if (this.mainBall.y <= this.canvasHeight / 5) {
	// 	this.camMove(this.canvasHeight/5 - this.mainBall.y);
	// } else 
	if (this.mainBall.y <= this.canvasHeight / 3 ) {
		this.camMove(8 * this.fp);
	} else if (this.mainBall.y <= this.canvasHeight / 2 ) {
		this.camMove(6 * this.fp);
	} else if (this.mainBall.y <= this.canvasHeight * 4 / 6 ) {
		this.camMove(Math.min(this.canvasHeight * 4 / 6 - this.mainBall.y, 2 * this.fp));
	} else if (this.mainBall.y <= this.canvasHeight * 6 / 10 ) {
		this.camMove(Math.min(this.canvasHeight * 6 / 10 - this.mainBall.y, 1 * this.fp));
	} else if(this.mainBall.y >= this.canvasHeight*17/20) {
		this.camMove(this.canvasHeight*17/20 - this.mainBall.y);	
	} else if (this.mainBall.y >= this.canvasHeight*13/20) {
		this.camMove(Math.max(this.canvasHeight*13/20 - this.mainBall.y, -2 * this.fp));	
	}
	if (this.baseLine <= 0) {
		this.increaseBaseLine(3);
	} else if (this.baseLine <= 35 * this.fp){
		this.increaseBaseLine(4/5);
	} else {
		this.increaseBaseLine(1/5);
	}
}

Camera.prototype.camMove = function(dy) {
	for (var i = this.pivots.length - 1; i >= 0; i--) {
		this.pivots[i].y += dy;
		if (this.pivots[i].y > this.canvasHeight - this.hellOffset) {
			this.pivots[i].destroySoon = true;
		}
	}
	this.mainBall.y += dy;
	this.baseLine -= dy;
	if (this.baseLine < this.hellOffset) {
		this.increaseBaseLine(this.hellOffset - this.baseLine);
	}
	this.baseLine = this.baseLine <= this.hellOffset? this.hellOffset : this.baseLine;
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

Camera.prototype.increaseBaseLine = function(dy) {
	this.score += dy;
	this.baseLine += dy * this.fp;
}

Camera.prototype.getScore = function() {
	return Math.floor(this.score/100);
}

Camera.prototype.getDeadLine = function() {
	return this.canvasHeight - this.baseLine;
}

Camera.prototype.shouldDestroy = function() {
	return false;
}