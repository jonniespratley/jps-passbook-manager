/* Object constructor
 var spinner = new BigSpinner();
 spinner.init("area", "red", "rgba(0,0,0,0.5)");
 spinner.animate();

 .bigSpinner {
 background-image: -webkit-canvas(spinner);
 }
 .useSpinner {
 background-position: center 70%;
 background-repeat: no-repeat;
 width: 100%;
 min-height: 100%;
 padding-top: 20%;
 -webkit-box-sizing: border-box;
 text-align: center;
 font-size: 100px;
 }

 The BigSpinner class definition goes here

 var spinner = new BigSpinner();
 spinner.init("spinner", "gray");
 spinner.animate();
 * */
var BigSpinner = new Function();
BigSpinner.prototype.init = function(id, color, shadow) {
	/* Initialize the canvas and save the context */
	this.context = document.getCSSCanvasContext("2d", id, 37, 37);
	/* Line style for the spinner */
	this.context.lineWidth = 3;
	this.context.lineCap = "round";
	this.context.strokeStyle = color;
	/* Define a shadow for the spinner */
	if (shadow) {
		this.context.shadowOffsetX = 1;
		this.context.shadowOffsetY = 1;
		this.context.shadowBlur = 1;
		this.context.shadowColor = shadow;
	}
	/* Animation variables */
	this.step = 0;
	this.timer = null;
}
BigSpinner.prototype.draw = function() {
	/* Clear the canvas at every frame */
	this.context.clearRect(0, 0, 37, 37);
	/* Prepare canvas state and draw spinner lines */
	this.context.save();
	this.context.translate(18, 18);
	this.context.rotate(this.step * Math.PI / 180);
	for (var i = 0; i < 12; i++) {
		this.context.rotate(30 * Math.PI / 180);
		this.drawLine(i);
	}
	this.context.restore();
	/* Increment the animation */
	this.step += 30;
	if (this.step == 360) {
		this.step = 0;
	}
}
BigSpinner.prototype.drawLine = function(i) {
	/* Draw one line with varying transparency depending on the iteration */
	this.context.beginPath();
	this.context.globalAlpha = i / 12;
	this.context.moveTo(0, 8 + 1);
	this.context.lineTo(0, 16 - 1);
	this.context.stroke();
}
BigSpinner.prototype.stop = function() {
	if (this.timer) {
		this.context.clearRect(0, 0, 37, 37);
		window.clearInterval(this.timer);
		this.timer = null;
	}
}
BigSpinner.prototype.animate = function() {
	/* Already running? exit... */
	if (this.timer) {
		return;
	}
	/* The execution context (this) will be the window object with setInterval()
	 Save the correct context in "that" variable and run the timer */
	var that = this;
	this.timer = window.setInterval(function() {
		that.draw();
	}, 100);
}
window.BigSpinner = BigSpinner;