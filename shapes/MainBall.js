// Simple class example

function MainBall(fp, globalSpeed, canvasWidth, canvasHeight, soundManager, posX, posY, pivots, bossHolder) {
	this.fp = fp
	this.canvasWidth = canvasWidth;
	this.canvasHeight = canvasHeight;
	this.soundManager = soundManager;
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

	// boss
	this.bossHolder = bossHolder;

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
	this.defaultChargeTimer = 9;
	this.defaultChargingDistance = 4 * this.fp;
	this.chargingDistance = this.defaultChargingDistance;
	this.chargingSpeed = 4 * this.fp;
	this.chargingCycleWidth = 3 * this.fp;

	// Firing
	this.defaultFiringTimer = 10;
	this.currentFiringTimer = 0;
	this.hookedPivot;

	// Pulling

	// Combo
	this.comboCount = 0;

	// Limit breaker
	this.defaultLimitBreaker = 100;
	this.limitBreakerCounter = 0;

	// score
	this.score = 0;
	this.comboScore = 0;

	// Boss
	this.bossBattle = false;
	this.bossBattleReady = false;
	this.bossBattleGroundOffset = canvasHeight - 50 * this.fp;
	this.currentBossBattleGround = canvasHeight + 100 * this.fp;
	this.waitForBossDie = false;

	// Attack and damage
	this.attack = 14;
	this.maxHp = 3;
	this.hp = this.maxHp;
	this.invisibleDuration = 180;
	this.invisibleTimer = 0;
}

MainBall.prototype.startBossBattle = function() {
	this.status = 0;
	this.bossBattle = true;
	this.currentBossBattleGround = this.canvasHeight + 100 * this.fp;
}

MainBall.prototype.endBossBattle = function() {
	this.hp = this.maxHp;
	this.bossHolder[0].isDead = true;
	this.bossBattle = false;
	this.bossBattleReady = false;
	this.waitForBossDie = false;
}

MainBall.prototype.isWaitBossDieDone = function() {
	return this.waitForBossDie && this.y == this.currentBossBattleGround;
}

MainBall.prototype.bossBattleUpdate = function() {
	if (this.waitForBossDie) {
		if (this.y > this.currentBossBattleGround) {
			this.y = this.currentBossBattleGround;
			this.velY = 0;
		}
	}

	if (!this.bossBattleReady) {
		if (this.currentBossBattleGround >= this.bossBattleGroundOffset) {
			this.currentBossBattleGround -= 1 * this.fp;
		}
		if (this.y > this.currentBossBattleGround) {
			this.y = this.currentBossBattleGround;
		}
		if (this.currentBossBattleGround <= this.bossBattleGroundOffset && this.y == this.currentBossBattleGround) {
			this.hp = 3;
			this.bossBattleReady = true;
			this.velY = 0;
		}
		return;
	}

	// Bounce Y
	if (this.y > this.currentBossBattleGround) {
		if (this.velY > 0) { this.velY *= -0.5; }
		this.y -= 2 * (this.y - this.currentBossBattleGround);
	}

	if (this.bossHolder.length > 0) {
		let boss = this.bossHolder[0];

		if (boss.hp > 0) { 
			// Check attackWave
			if (this.invisibleTimer <= 0) {
				for (var i = boss.attackWaves.length - 1; i >= 0; i--) {
					if(boss.attackWaves[i].hasDamage(this.y)) {
						this.damaged();
					}
				}
			}

			// Hit boss
			let knockBackDis = boss.isHit(this.x, this.y);
			if (knockBackDis!=0) {
				this.y += knockBackDis;
				if (this.velY < 0) { this.velY *= -1; }
				boss.damage(this.attack);
				this.status = 0;
			}
		}
	}
}

MainBall.prototype.damaged = function() {
	this.comboCount = 0;
	if (this.invisibleTimer <= 0) {
		this.hp--;		
		this.invisibleTimer = this.invisibleDuration;
	}

	if (this.invisibleTimer == this.invisibleDuration || this.invisibleDuration - this.invisibleTimer >= 5) {
		this.soundManager.play("mainball-hit");
	}

	this.status = 0;
	this.velX /= 3;
	this.velY = -6 * this.fp;
}

MainBall.prototype.setScore = function(score) {
	this.score = score;
}

MainBall.prototype.getComboScore = function() {
	return Math.floor(this.comboScore);
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
		// only do addLB or trigger LB in one time.

		// First time enter this status
		if(this.currentFiringTimer == 0) {
			// show a "delay" when first enter this status
			this.velX /= 2;
			this.velY /= 3;
			// play sfx for firing
			this.soundManager.play("whip-sound");
			if (this.hookedPivot.isSuperPivot) {
				this.endBossBattle();
			}
			if (this.limitBreakerCounter >= this.defaultLimitBreaker) {
				if (!this.bossBattle) {
					this.soundManager.play("lb-sfx");
					this.limitBreakerCounter -= this.defaultLimitBreaker;
					let comboBonus = Math.floor((this.comboCount > 20 ? 20: this.comboCount)/5);
					this.hookedPivot.setLimitBreakCounter(1200 + 200 * comboBonus);
				}
			} else {
				let mockCombo = this.comboCount > 7? 7 : this.comboCount;
				let addLB = 2 + (mockCombo * mockCombo * Math.sqrt(mockCombo))/10 + Math.max(0, this.comboCount - 7)/4;
				this.limitBreakerCounter += addLB;
			}
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


		// limit the max speed
		let currSpeed = this.velX * this.velX + this.velY * this.velY;
		let comboBonus = Math.floor((this.comboCount > 20 ? 20: this.comboCount)/5);
		let scoreBonus = Math.floor(this.score);
		let maxSpeedSq = this.bossBattle? 
			// boss battle
			this.defaultMaxSpeedSq + 150 * this.fp * this.fp : 
			// climbing
			this.defaultMaxSpeedSq + comboBonus * 80 * this.fp * this.fp + scoreBonus * this.fp * this.fp;
		if (currSpeed >= maxSpeedSq) {
			let scaleRatio = Math.sqrt(maxSpeedSq / currSpeed);
			this.velX *= scaleRatio;
			this.velY *= scaleRatio;
		}

		// LimitBreak!
		this.hookedPivot.triggerLimitBreak(comboBonus + scoreBonus/100);
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
	if (this.invisibleTimer > 0) {
		this.invisibleTimer -= this.globalSpeed["ratio"];
		if(this.invisibleTimer < 0) {
			this.invisibleTimer = 0;
		}
	}

	// bossBattle
	if (this.bossBattle) {
		this.bossBattleUpdate();
	}
}

MainBall.prototype.inputDown = function() {
	// The behavior is 1st click for release rope and 2nd for aiming again.
	// if (this.status == 3) {
	// 	this.status = 0;
	// } else {
	// 	this.charge();
	// }
	if (!((this.status == 3 || this.status == 2) && this.hookedPivot.limitBreakCounter > this.hookedPivot.originLimitBreakCounter/2)) 
	this.charge();
}

MainBall.prototype.charge = function() {
	// charging
	this.status = 1;
}

MainBall.prototype.inputUp = function() {
	if (this.status == 1) {
		this.fire();
	}
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
		this.comboScore += this.comboCount/10;
		// has target, firing
		this.status = 2;
		targetPivot.setHooked(true);
		targetPivot.setUsed(this.bossBattleReady);
		this.hookedPivot = targetPivot;
	}
}

MainBall.prototype.isHookingSuperPivot = function() {
	return this.hookedPivot != undefined && this.hookedPivot.isSuperPivot;
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
	if (this.invisibleTimer == 0 || Math.floor(this.invisibleTimer / 10) % 2 != 0) {
		theContext.beginPath();
		theContext.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
		theContext.fillStyle = this.color;
		theContext.fill();
		theContext.strokeStyle = this.mainBallStrokeStyle;
		theContext.lineWidth = 2 * this.fp;
		theContext.stroke();
	}

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
	let ropeLevel = Math.floor((this.comboCount > 20 ? 20: this.comboCount)/5);
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

	// Limit breaker
	let limitBreakerWidth = 0;
	let dummyLimitBreakerCounter = Math.min(this.defaultLimitBreaker, this.limitBreakerCounter);

	if (this.limitBreakerCounter < this.defaultLimitBreaker / 2) {
		limitBreakerWidth = 6 * this.fp;
		theContext.fillStyle = "rgba(0, 200, 0, 0.5)";
	} else if (this.limitBreakerCounter < this.defaultLimitBreaker *4 / 5) {
		limitBreakerWidth = 8 * this.fp;
		theContext.fillStyle = "rgba(0, 0, 200, 0.5)";
	} else if (this.limitBreakerCounter < this.defaultLimitBreaker) {
		limitBreakerWidth = 10 * this.fp;
		theContext.fillStyle = "rgba(200, 0, 0, 0.5)";
	} else if (dummyLimitBreakerCounter == this.defaultLimitBreaker) {
		limitBreakerWidth = 10 * this.fp;
		theContext.fillStyle = "rgba(255, 255, 0, 0.8)";
	}
	theContext.fillRect(0, this.canvasHeight * (1 - (dummyLimitBreakerCounter / this.defaultLimitBreaker)), limitBreakerWidth, this.canvasHeight);
	theContext.fillRect(this.canvasWidth - limitBreakerWidth, this.canvasHeight * (1 - (dummyLimitBreakerCounter / this.defaultLimitBreaker)), limitBreakerWidth, this.canvasHeight);

	if (dummyLimitBreakerCounter >= this.defaultLimitBreaker) {
		theContext.fillRect(0, 0, this.canvasWidth, limitBreakerWidth);
		theContext.fillRect(0, this.canvasHeight - limitBreakerWidth, this.canvasWidth, this.canvasHeight);
	}

	// BossGround 
	if (this.bossBattle || this.isHookingSuperPivot()) {
		theContext.strokeStyle = "#000000";
		theContext.beginPath()
		theContext.moveTo(0, this.currentBossBattleGround + this.radius);
		theContext.lineTo(this.canvasWidth, this.currentBossBattleGround + this.radius);
		theContext.lineWidth = 2 * this.fp;
		theContext.stroke();
	}

	// Hp
	if (this.bossBattleReady || this.isHookingSuperPivot() || this.hp != this.maxHp) {
		let hpY = this.y - this.radius - 10 * this.fp;
		let hph = 6 * this.fp;
		let hpX = this.x - 10 * this.fp;
		let hpw = 6 * this.fp; 
		theContext.fillStyle = "#FF0000";
		for (var i = 0; i < this.hp; ++i) {
			theContext.fillRect(hpX + i * 7 * this.fp, hpY, hpw, hph);
		}
	}
}

MainBall.prototype.shouldDestroy = function(theContext) {
	return false;
}