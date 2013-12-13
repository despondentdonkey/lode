var LODE = {
    loadTextFile: function(fileName, callback) {
        var xmlhttp = new XMLHttpRequest();

        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
                if (callback) {
                    callback(xmlhttp.responseText);
                }
            }
        }

        xmlhttp.open("GET", fileName, true);
        xmlhttp.send();
    }
};

LODE.TextFile = function(path) {
    this.path = path;
};

//Loads Image and Audio assets that have been added.
LODE.createLoader = function() {
    'use strict';
    var assets = [];
    var loaded = 0;

    return {
        loadImage: function(src) {
            var newImage = new Image();
            newImage.src = src;
            assets.push(newImage);
            return newImage;
        },

        loadAudio: function(src) {
            var newAudio = new Audio();
            newAudio.src = src;
            assets.push(newAudio);
            return newAudio;
        },

        //Loads file via ajax. Returns a LODE.TextFile instance. LODE.TextFile.data will be available after loading is complete.
        loadFile: function(path) {
            var file = new LODE.TextFile(path);
            assets.push(file);
            return file;
        },

        //Call this when the document has been loaded. Specify a callback function to continue after the assets have been loaded.
        load: function(callback) {
            var loadComplete = function(cb) {
                loaded++;
                if (loaded >= assets.length) {
                    cb();
                }
            };

            for (var i=0; i<assets.length; i++) {
                var asset = assets[i];
                if (asset instanceof Image) {
                    asset.addEventListener('load', function() {
                        loadComplete(callback);
                    });
                } else if (asset instanceof Audio) {
                    asset.addEventListener('canplay', function() {
                        loadComplete(callback);
                    });
                } else if (asset instanceof LODE.TextFile) {
                    LODE.loadTextFile(asset.path, function(data) {
                        asset.data = data;
                        loadComplete(callback);
                    });
                }
            }
        }
    };
};


