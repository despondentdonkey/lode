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

    function createAjaxRequest(fileName, type, onLoad, onError) {
        var request = new XMLHttpRequest();
        request.open("GET", fileName, true);
        request.responseType = type;

        if (onLoad) {
            request.onload = function() {
                if (request.status === 200) { // http status 200 = ok
                    onLoad(request.response);
                } else {
                    if (onError) {
                        onError(request);
                    } else {
                        console.error("Error loading file '" + fileName  + "'.");
                    }
                }
            };
        }

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
            stopIfErrors: false,

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
            load: function(callbacks) {
                var stopIfErrors = this.stopIfErrors;
                if (typeof callbacks === 'function') {
                    callbacks = {onLoadComplete: callbacks};
                }

                var loadComplete = function() {
                    loaded++;

                    // Called when a file has loaded. Gives you the ratio of files loaded.
                    if (callbacks.onFileLoad) {
                        callbacks.onFileLoad(loaded / assets.length);
                    }

                    if (loaded >= assets.length) {
                        if (callbacks.onLoadComplete) {
                            callbacks.onLoadComplete();
                        }
                    }
                };

                var loadError = function(asset) {
                    if (callbacks.onFileError) {
                        callbacks.onFileError(asset);
                    }

                    if (stopIfErrors) {
                        if (callbacks.onLoadFail) {
                            callbacks.onLoadFail();
                        }
                    } else {
                        // Continue loading the others even though this failed.
                        // TODO: Pass status (loaded/failed).
                        loadComplete(callbacks.onLoadComplete);
                    }
                };

                if (assets.length <= 0) {
                    loadComplete(callbacks.onLoadComplete);
                }

                for (var i=0; i<assets.length; i++) {
                    var asset = assets[i];
                    if (asset instanceof Image) {
                        asset.addEventListener('load', function() {
                            loadComplete(callbacks.onLoadComplete);
                        });

                        asset.addEventListener('error', function() {
                            loadError(asset);
                        });
                    } else if (asset instanceof Audio) {
                        asset.addEventListener('loadeddata', function() {
                            loadComplete(callbacks.onLoadComplete);
                        });

                        asset.addEventListener('error', function() {
                            loadError(asset);
                        });
                    } else if (asset instanceof File) {
                        (function(asset) { //Requires an anonymous function since asset is used in another onLoadComplete.
                            var request = createAjaxRequest(asset.path, asset.type, function(data) {
                                asset.data = data;
                                loadComplete(callbacks.onLoadComplete);
                            }, function onFileError() {
                                loadError(asset);
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
