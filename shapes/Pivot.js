// Simple class example

function Pivot(fp, globalSpeed, posX, posY, radius) {
	this.fp = fp;
	this.globalSpeed = globalSpeed;
	this.x = posX * fp;
	this.y = posY * fp;
	this.velX = 0;
	this.velY = 0;
	this.accelX = 0;
	this.accelY = 0;
	this.color = "#009900";
	this.strokeStyle = "#005500"

	this.aimColor = "#FFFF00";
	this.aimStrokeStyle = "#999900"

	this.usedColor = "#88000055";
	this.usedStrokeStyle = "#44000077";

	this.isAiming = false;
	this.radius = radius * fp;
	this.isHooked = false;

	this.isUsed = false;

	this.destroySoon = false;
}

//A function for drawing the particle.
Pivot.prototype.drawToContext = function(theContext) {
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

	// draw the pivot
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


}

Pivot.prototype.shouldDestroy = function(theContext) {
	return this.destroySoon;
}