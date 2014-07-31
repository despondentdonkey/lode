// Copyright (c) 2013 Parker Miller
// LODE may be freely distributed under the MIT license.

(function(root, createLode) {
    if (typeof define === 'function' && define.amd) {
        define(createLode);
    } else {
        root.LODE = createLode();
    }
}(this, function() {

    function File(path, type) {
        this.path = path;
        this.type = type;
    }

    function createAjaxRequest(fileName, type, callback) {
        var request = new XMLHttpRequest();
        request.open("GET", fileName, true);
        request.responseType = type;

        if (callback) {
            request.onload = function() {
                callback(request.response);
            };
        }

        request.onerror = function() {
            console.error("Error loading file '" + fileName  + "'.");
        };

        request.onabort = function() {
            console.error("Loading file '" + fileName + "' has been aborted.");
        };

        return request;
    }

    //Loads Image and Audio assets that have been added.
    function createLoader() {
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

            //Loads a file via ajax. Defaults to loading text.
            loadFile: function(path, type) {
                if (!type) {
                    type = 'text';
                }
                var file = new File(path, type);
                assets.push(file);
                return file;
            },

            //Call this when the document has been loaded. Specify a callback function to continue after the assets have been loaded.
            load: function(callback) {
                var onLoad = this.onLoad;

                var loadComplete = function(cb) {
                    loaded++;

                    //Meant to be overidden. Gives you the ratio of files loaded.
                    if (onLoad) {
                        onLoad(loaded / assets.length);
                    }

                    if (loaded >= assets.length) {
                        cb();
                    }
                };

                if (assets.length <= 0) {
                    loadComplete(callback);
                }

                for (var i=0; i<assets.length; i++) {
                    var asset = assets[i];
                    if (asset instanceof Image) {
                        asset.addEventListener('load', function() {
                            loadComplete(callback);
                        });
                    } else if (asset instanceof Audio) {
                        asset.addEventListener('loadeddata', function() {
                            loadComplete(callback);
                        });
                    } else if (asset instanceof File) {
                        (function(asset) { //Requires an anonymous function since asset is used in another callback.
                            var request = createAjaxRequest(asset.path, asset.type, function(data) {
                                asset.data = data;
                                loadComplete(callback);
                            });
                            request.send();
                        })(asset);
                    }
                }
            }
        };
    }

    return {
        VERSION: '0.1.0',
        File: File,
        createAjaxRequest: createAjaxRequest,
        createLoader: createLoader,
    };

}));
