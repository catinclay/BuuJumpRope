var game = new Game();
var gameEngine = new GameEngine();
var imageManager = new ImageManager();
var soundManager = new SoundManager();
gameEngine.init(game, imageManager, soundManager, 60);

soundManager.registerSound({name:'failedSound', src:'sounds/failedSound.mp3'});
soundManager.registerSound({name:'whip-sound', src:'sounds/whip-sound.wav'});

var loadPromises = [
	imageManager.registerImage({name:'flightImage', src:'image/flightIcon.png'})
];

Promise.all(loadPromises).then(gameEngine.start());

