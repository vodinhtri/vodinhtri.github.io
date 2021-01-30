/*
 * Author: Alex Gibson
 * https://github.com/alexgibson/shake.js
 * License: MIT license
 */

(function(global, factory) {
    if (typeof define === 'function' && define.amd) {
        define(function() {
            return factory(global, global.document);
        });
    } else if (typeof module !== 'undefined' && module.exports) {
        module.exports = factory(global, global.document);
    } else {
        global.Shake = factory(global, global.document);
    }
} (typeof window !== 'undefined' ? window : this, function (window, document) {

    'use strict';

    function Shake(options) {
        //feature detect
        this.hasDeviceMotion = ('ondevicemotion' in window) || ('deviceorientation' in window);

        this.options = {
            threshold: 15, //default velocity threshold for shake to register
            timeout: 1000 //default interval between events
        };

        if (typeof options === 'object') {
            for (var i in options) {
                if (options.hasOwnProperty(i)) {
                    this.options[i] = options[i];
                }
            }
        }

        //use date to prevent multiple shakes firing
        this.lastTime = new Date();

        //accelerometer values
        this.lastX = null;
        this.lastY = null;
        this.lastZ = null;

        //create custom event
        if (typeof document.CustomEvent === 'function') {
            this.event = new document.CustomEvent('shake', {
                bubbles: true,
                cancelable: true
            });
        } else if (typeof document.createEvent === 'function') {
            this.event = document.createEvent('Event');
            this.event.initEvent('shake', true, true);
        } else {
            return false;
        }
    }

    //reset timer values
    Shake.prototype.reset = function () {
        this.lastTime = new Date();
        this.lastX = null;
        this.lastY = null;
        this.lastZ = null;
    };

    //start listening for devicemotion
    Shake.prototype.start = function () {
        this.reset();
        //if (this.hasDeviceMotion) {
            if (window.DeviceOrientationEvent) {
                window.addEventListener('deviceorientation', this, false);
            } else if (window.DeviceMotionEvent) {
                window.addEventListener('devicemotion', this, false);
            } else {
                window.addEventListener('MozOrientation', this, false);
            }
        //}
    };

    //stop listening for devicemotion
    Shake.prototype.stop = function () {
        /*if (this.hasDeviceMotion) {
            window.removeEventListener('devicemotion', this, false);
        }*/
        
        if (window.DeviceOrientationEvent) {
            window.removeEventListener('deviceorientation', this, false);
        } else if (window.DeviceMotionEvent) {
            window.removeEventListener('devicemotion', this, false);
        } else {
            window.removeEventListener('MozOrientation', this, false);
        }
        this.reset();
    };
    
    //calculates if shake did occur on browser
    Shake.prototype.deviceorientation = function (e) {
        var current = e;
        var currentTime;
        var timeDifference;
        var deltaX = 0;
        var deltaY = 0;
        var deltaZ = 0;

        if ((this.lastX === null) && (this.lastY === null) && (this.lastZ === null)) {
            this.lastX = 2*current.gamma;
            this.lastY = 2*current.beta;
            this.lastZ = 2*current.alpha;
            return;
        }

        deltaX = Math.abs(this.lastX - 2*current.gamma);
        deltaY = Math.abs(this.lastY - 2*current.beta);
        deltaZ = Math.abs(this.lastZ - 2*current.alpha);

        if (((deltaX > this.options.threshold) && (deltaY > this.options.threshold)) || ((deltaX > this.options.threshold) && (deltaZ > this.options.threshold)) || ((deltaY > this.options.threshold) && (deltaZ > this.options.threshold))) {
            //calculate time in milliseconds since last shake registered
            currentTime = new Date();
            timeDifference = currentTime.getTime() - this.lastTime.getTime();

            if (timeDifference > this.options.timeout) {
                window.dispatchEvent(this.event);
                this.lastTime = new Date();
            }
        }

        this.lastX = 2*current.gamma;
        this.lastY = 2*current.beta;
        this.lastZ = 2*current.alpha;

    };       

    //calculates if shake did occur on devices
    Shake.prototype.devicemotion = function (e) {
        var current = e.accelerationIncludingGravity;
        var currentTime;
        var timeDifference;
        var deltaX = 0;
        var deltaY = 0;
        var deltaZ = 0;
        
        var MULTI_VAL = 1;

        if ((this.lastX === null) && (this.lastY === null) && (this.lastZ === null)) {
            this.lastX = MULTI_VAL*current.z;
            this.lastY = MULTI_VAL*current.y;
            this.lastZ = MULTI_VAL*current.x;
            return;
        }

        deltaX = Math.abs(this.lastX - MULTI_VAL*current.z);
        deltaY = Math.abs(this.lastY - MULTI_VAL*current.y);
        deltaZ = Math.abs(this.lastZ - MULTI_VAL*current.x);

        if (((deltaX > this.options.threshold) && (deltaY > this.options.threshold)) || ((deltaX > this.options.threshold) && (deltaZ > this.options.threshold)) || ((deltaY > this.options.threshold) && (deltaZ > this.options.threshold))) {
            //calculate time in milliseconds since last shake registered
            currentTime = new Date();
            timeDifference = currentTime.getTime() - this.lastTime.getTime();

            if (timeDifference > this.options.timeout) {
                window.dispatchEvent(this.event);
                this.lastTime = new Date();
            }
        }

        this.lastX = MULTI_VAL*current.z;
        this.lastY = MULTI_VAL*current.y;
        this.lastZ = MULTI_VAL*current.x;

    };

    //event handler
    Shake.prototype.handleEvent = function (e) {
        if (typeof (this[e.type]) === 'function') {
            return this[e.type](e);
        }
    };

    return Shake;
}));