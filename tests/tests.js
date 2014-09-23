// Finds a path relative to the tests dir from an absolute path.
var getRelPath = function(src) {
    // Get tests/ and everything that follows it.
    var regex = /tests\/\S+/;
    return regex.exec(src)[0].replace('tests/', '');
};

test('LODE defined', function(assert) {
    ok(LODE);
});

module('load', {
    setup: function() {
        this.loader = LODE.createLoader();
    }
});

asyncTest('image', function(assert) {
    var img = this.loader.loadImage('res/test.png');
    ok(img, 'created');

    this.loader.load(function() {
        ok(img instanceof Image, 'is an image');
        start();
    });
});

asyncTest('images map', function(assert) {
    var images = this.loader.loadImages('res/', {
        'test': 'test.png',
        'noexist': 'shouldnotexist.png',
    });

    this.loader.load({
        onLoadComplete: function(errors) {
            var testSrc = getRelPath(images.test.src);
            var noexistSrc = getRelPath(images.noexist.src);

            ok(true, 'load complete');
            ok(testSrc === 'res/test.png', "Sources for 'test' correct.");
            ok(noexistSrc === 'res/shouldnotexist.png', "Sources for 'noexist' correct.");
            ok(images.noexist === errors[0], 'shouldnotexist.png gave error.');
            start();
        },
        onLoadFail: function() {
            ok(false);
            start();
        }
    });
});

asyncTest('images array', function(assert) {
    var images = this.loader.loadImages('res/', ['test.png', 'shouldnotexist.png']);
    this.loader.load({
        onLoadComplete: function(errors) {
            var testSrc = getRelPath(images[0].src);
            var noexistSrc = getRelPath(images[1].src);

            ok(true, 'load complete');
            ok(testSrc === 'res/test.png', 'Sources for index 0 correct.');
            ok(noexistSrc === 'res/shouldnotexist.png', 'Sources for index 1 correct.');
            ok(images[1] === errors[0], 'shouldnotexist.png gave error.');
            start();
        },
        onLoadFail: function() {
            ok(false);
            start();
        }
    });
});

asyncTest('audio', function(assert) {
    var audio = this.loader.loadAudio('res/test.mp3');
    ok(audio, 'created');

    this.loader.load(function() {
        ok(audio instanceof Audio, 'is audio');
        start();
    });
});

asyncTest('audio map', function(assert) {
    var audio = this.loader.loadAudios('res/', {
        'test': 'test.mp3',
        'noexist': 'shouldnotexist.mp3',
    });

    this.loader.load({
        onLoadComplete: function(errors) {
            var testSrc = getRelPath(audio.test.src);
            var noexistSrc = getRelPath(audio.noexist.src);

            ok(true, 'load complete');
            ok(testSrc === 'res/test.mp3', "Sources for 'test' correct.");
            ok(noexistSrc === 'res/shouldnotexist.mp3', "Sources for 'noexist' correct.");
            ok(audio.noexist === errors[0], 'shouldnotexist.mp3 gave error.');
            start();
        },
        onLoadFail: function() {
            ok(false);
            start();
        }
    });
});

if (window.AudioContext !== undefined) {
    asyncTest('audio buffer', function(assert) {
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

    asyncTest('audio buffer map', function(assert) {
        var files = this.loader.loadFiles('res/', {
            'noexist': 'shouldnotexist.mp3',
            'test': 'test.mp3',
        }, 'arraybuffer');

        this.loader.load({
            onLoadComplete: function(errors) {
                ok(true, 'load complete');
                ok(files.test.data instanceof ArrayBuffer, "'test' is an array buffer");
                ok(files.noexist === errors[0], 'shouldnotexist.mp3 gave error.');

                window.AudioContext = window.AudioContext||window.webkitAudioContext;
                var audioCtx = new AudioContext();
                audioCtx.decodeAudioData(files.test.data, function(buffer) {
                    var src = audioCtx.createBufferSource();
                    src.buffer = buffer;
                    ok(src instanceof AudioBufferSourceNode, "audio buffer source node created from 'test'");
                    start();
                });
            },
            onLoadFail: function() {
                ok(false);
                start();
            }
        });
    });
} else {
    test('audio buffer', function() {
        ok(false, 'Web Audio is not supported on this browser.');
    });
}

asyncTest('text file', function(assert) {
    var file = this.loader.loadFile('res/test.txt');
    ok(file, 'created');

    this.loader.load(function() {
        var fileContents = 'This is some text.\n';
        ok(file.data, 'file has data');
        ok(file.data === fileContents, 'file has correct data');
        start();
    });
});

asyncTest('file map', function(assert) {
    var files = this.loader.loadFiles('res/', {
        'noexist': 'shouldnotexist.txt',
        'test': 'test.txt',
    });

    this.loader.load({
        onLoadComplete: function(errors) {
            ok(true, 'load complete');
            ok(files.test.data, 'test.txt has data.');
            ok(!files.noexist.data, 'shouldnotexist.txt has no data.');
            ok(files.noexist === errors[0], 'shouldnotexist.txt gave error.');
            start();
        },
        onLoadFail: function() {
            ok(false);
            start();
        }
    });
});

asyncTest('ratio correct', function(assert) {
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

asyncTest('image error', function(assert) {
    this.loader.loadImage('res/shouldnotexist.png');
    this.loader.load({
         onFileError: function() {
            ok(true, 'error received');
            start();
        }
    });
});

asyncTest('audio error', function(assert) {
    this.loader.loadAudio('res/shouldnotexist.mp3');
    this.loader.load({
        onFileError: function() {
            ok(true, 'error received');
            start();
        }
    });
});

asyncTest('file error', function(assert) {
    this.loader.loadFile('res/shouldnotexist.txt');
    this.loader.load({
        onFileError: function() {
            ok(true, 'error received');
            start();
        }
    });
});

// Continues to load even if a file has an error.
asyncTest('continued after error', function(assert) {
    this.loader.loadImage('res/test.png');
    this.loader.loadImage('res/shouldnotexist.png');
    this.loader.loadAudio('res/test.mp3');
    this.loader.loadAudio('res/shouldnotexist.mp3');
    this.loader.loadFile('res/shouldnotexist.txt');

    this.loader.load({
        onLoadComplete: function(errors) {
            ok(true, 'completed loading');
            ok(errors.length === 3, 'contains 3 errors');
            start();
        },
        onLoadFail: function() {
            ok(false);
            start();
        }
    });
});

// Stop loading if a file has an error.
asyncTest('stopped after error', function(assert) {
    this.loader.loadImage('res/test.png');
    this.loader.loadImage('res/shouldnotexist.png');
    this.loader.loadAudio('res/test.mp3');
    this.loader.stopIfErrors = true;

    this.loader.load({
        onLoadComplete: function() {
            ok(false);
            start();
        },
        onLoadFail: function() {
            ok(true);
            start();
        }
    });
});
