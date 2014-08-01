lode
====

Manages the loading of images, audio, and other files.

Example:

    var loader = LODE.createLoader(); //Can also be used as an AMD module.

    var img = loader.loadImage('myImg.png');
    var audio = loader.loadAudio('myAudio.mp3');
    var textFile = loader.loadFile('myTextFile.whateverext');

    loader.load(function() {
        console.log('Loading complete!');
        console.dir(img);
        console.dir(audio);
        console.log(textFile.data);

        var canvas = document.createElement('canvas');
        var gc = canvas.getContext('2d');
        gc.drawImage(img, 0, 0);
        document.body.appendChild(canvas);

        audio.play();
    });
