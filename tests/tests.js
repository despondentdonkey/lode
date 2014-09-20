test("LODE defined", function(assert) {
    ok(LODE);
});

module('load', {
    setup: function() {
        this.loader = LODE.createLoader();
    }
});

asyncTest("image", function(assert) {
    var img = this.loader.loadImage('res/test.png');
    ok(img, 'created');

    this.loader.load(function() {
        ok(img instanceof Image, 'is an image');
        start();
    });
});

asyncTest("audio", function(assert) {
    var audio = this.loader.loadAudio('res/test.mp3');
    ok(audio, 'created');

    this.loader.load(function() {
        ok(audio instanceof Audio, 'is audio');
        start();
    });
});

asyncTest("audio buffer", function(assert) {
    var bufferFile = this.loader.loadFile('res/test.mp3', 'arraybuffer');
    ok(bufferFile, 'created');

    this.loader.load(function() {
        ok(bufferFile.data instanceof ArrayBuffer, 'is an array buffer');

        window.AudioContext = window.AudioContext||window.webkitAudioContext;
        var audioCtx = new AudioContext();
        audioCtx.decodeAudioData(bufferFile.data, function(buffer) {
            var src = audioCtx.createBufferSource();
            src.buffer = buffer;
            ok(src instanceof AudioBufferSourceNode, 'audio buffer source node created');
            start();
        });
    });
});

asyncTest("text file", function(assert) {
    var file = this.loader.loadFile('res/test.txt');
    ok(file, 'created');

    this.loader.load(function() {
        var fileContents = 'This is some text.\n';
        ok(file.data, 'file has data');
        ok(file.data === fileContents, 'file has correct data');
        start();
    });
});

asyncTest("ratio correct", function(assert) {
    var totalLoad = 7;
    var currentIndex = 0;

    for (var i=0; i<totalLoad; ++i) {
        this.loader.loadImage('res/test.png');
    }

    this.loader.load({
        onLoadComplete: function() {
            ok(currentIndex === totalLoad, 'all files loaded');
            start();
        },
        onFileLoad: function(ratio) {
            currentIndex++;
            var calculatedRatio = currentIndex / totalLoad;
            ok(calculatedRatio === ratio, 'ratio for file ' + currentIndex + ' correct; ' + ratio);
        },
    });
});

asyncTest("image error", function(assert) {
    this.loader.loadImage('res/shouldnotexist.png');
    this.loader.load({
         onFileError: function() {
            ok(true, 'error received');
            start();
        }
    });
});

asyncTest("audio error", function(assert) {
    this.loader.loadAudio('res/shouldnotexist.mp3');
    this.loader.load({
        onFileError: function() {
            ok(true, 'error received');
            start();
        }
    });
});

asyncTest("file error", function(assert) {
    this.loader.loadFile('res/shouldnotexist.txt');
    this.loader.load({
        onFileError: function() {
            ok(true, 'error received');
            start();
        }
    });
});

// Continues to load even if a file has an error.
asyncTest("continued after error", function(assert) {
    this.loader.loadImage('res/test.png');
    this.loader.loadImage('res/shouldnotexist.png');
    this.loader.loadAudio('res/test.mp3');

    this.loader.load(function() {
        ok(true);
        start();
    });
});
