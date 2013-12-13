lode
====

A JavaScript asset loader.

Example:

    var loader = LODE.createLoader();

    var img = loader.loadImage('myImg.png');
    var audio = loader.loadAudio('myAudio.mp3');
    var textFile = loader.loadFile('myTextFile.whateverext');

    loader.load(function() {
        console.log('Loading complete!');
        console.dir(img);
        console.dir(audio);

        var canvas = document.getElementById('canvas'); //Assuming you have '<canvas id="canvas"></canvas>' in your HTML.
        var gc = canvas.getContext('2d');
        gc.drawImage(img, 0, 0);

        audio.play();

        console.log(textFile.data);
    });
