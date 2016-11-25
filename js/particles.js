/**
 * Created by fanbin1 on 2016/9/19.
 */
"use strict";
var canvas = {},
    image = {},
    requestId = 0,
    startTime = 0;

function Particles(options) {
    var instance = this;
    var transitionType = options.ease || "easeInOutExpo";
    if (typeof window[transitionType] !== "function") {
        console.log("The function is not existed, it will use easeInOutExpo instead");
        transitionType = "easeInOutExpo"
    }
    this.init = (function() {
        if (!options.canvasId || !document.getElementById(options.canvasId)) {
            console.log("please use the correct canvas id");
            return
        }
        if (!options.imgUrl) {
            console.log("please use the correct img url");
            return
        }
        canvas.self = document.getElementById(options.canvasId);
        if (canvas.self.getContext) {
            canvas.w = canvas.self.width;
            canvas.h = canvas.self.height;
            canvas.ctx = canvas.self.getContext("2d");
            var sourceImage = new Image();
            image.isLoaded = false;
            sourceImage.onload = function() {
                image.self = sourceImage;
                image.w = sourceImage.width;
                image.h = sourceImage.height;
                image.x = options.imgX || parseInt(canvas.w / 2 - image.w / 2);
                image.y = options.imgY || 0;
                canvas.ctx.drawImage(image.self, image.x, image.y, image.w, image.h);
                image.imgData = canvas.ctx.getImageData(image.x, image.y, image.w, image.h);
                canvas.ctx.clearRect(0, 0, canvas.w, canvas.h);
                Particles.prototype._calculate({
                    // color: options.fillStyle || "rgba(26,145,211,1)",
                    pOffset: options.particleOffset || 2,
                    startX: options.startX || (image.x + image.w / 2),
                    startY: options.startY || 0,
                    duration: options.duration || 2000,
                    interval: options.interval || 10,
                    ease: transitionType,
                    ratioX: options.ratioX || 1,
                    ratioY: options.ratioY || 1,
                    cols: options.cols || 440,
                    rows: options.rows || 100
                });
                image.isLoaded = true;
                startTime = new Date().getTime()
            };
            sourceImage.crossOrigin = "anonymous";
            sourceImage.src = options.imgUrl;
        }
    })();
    this.draw = function() {
        if (image.isLoaded) {
            Particles.prototype._draw();
        } else {
            setTimeout(instance.draw);
        }
    };
    this.animate = function() {
        if (image.isLoaded) {
            Particles.prototype._animate(options.delay)
        } else {
            setTimeout(instance.animate);
        }
    }
}
Particles.prototype = {
    array: [],
    _calculate: function(a) {
        var imgArray = image.imgData.data;
        var cols = a.cols,
            rows = a.rows;
        var n = parseInt(image.w / cols),
            c = parseInt(image.h / rows);
        var index = 0;
        var particle = {};
        for (var i = 0; i < cols; i++) {
            for (var b = 0; b < rows; b++) {
                index = (b * c * image.w + i * n) * 4;
                if (imgArray[index + 3] > 100) {
                    particle = {
                        x0: a.startX,
                        y0: a.startY,
                        x1: image.x + i * n + (Math.random() - 0.5) * 10 * a.pOffset,
                        y1: image.y + b * c + (Math.random() - 0.5) * 10 * a.pOffset,
                        fillStyle: a.color,
                        delay: b / 20,
                        currTime: 0,
                        count: 0,
                        duration: parseInt(a.duration / 16.66) + 1,
                        interval: parseInt(Math.random() * 10 * a.interval),
                        ease: a.ease,
                        ratioX: a.ratioX,
                        ratioY: a.ratioY
                    };
                    if(imgArray[index] > 200 && imgArray[index+1] > 200  && imgArray[index+2] > 200) {
                        particle.fillStyle = '#0c1328';
                    } else if(imgArray[index] > 200  && imgArray[index+1] < 50  && imgArray[index+2] < 50) {
                        particle.fillStyle = '#e95d5f';
                    } else if(imgArray[index] > 200  && imgArray[index+1] > 200){
                        particle.fillStyle = '#fffe00';
                    } else if(imgArray[index] < 50 && imgArray[index+1] < 50  && imgArray[index+2] < 50){
                        particle.fillStyle = '#ffeeff';
                    }else if(imgArray[index+2] > 200 && imgArray[index] < 50 && imgArray[index+1] <50){
                        particle.fillStyle = '#0405ff';
                    }else if(imgArray[index] < 50  && imgArray[index+1] > 200){
                        particle.fillStyle = '#03ff00';
                    }else{
                        particle.fillStyle = '#0c1328';
                    }
                    this.array.push(particle)
                }
            }
        }
    },
    _draw: function() {
        canvas.ctx.clearRect(0, 0, canvas.w, canvas.h);
        var b = this.array.length;
        var a = null;
        for (var c = 0; c < b; c++) {
            a = this.array[c];
            canvas.ctx.fillStyle = a.fillStyle;
            canvas.ctx.fillRect(a.x1, a.y1, 1, 1)
        }
    },
    _render: function() {
        canvas.ctx.clearRect(0, 0, canvas.w, canvas.h);
        var l = Particles.prototype.array;
        var f = l.length;
        var h = null;
        var d, a;
        var k = 0,
            b = 0,
            c = 0,
            j = 1,
            g = 1;
        for (var e = 0; e < f; e++) {
            h = l[e];
            if (h.count++ > h.delay) {
                canvas.ctx.fillStyle = h.fillStyle;
                k = h.currTime;
                b = h.duration;
                c = h.interval;
                h.ratioX !== 1 ? j = h.ratioX + Math.random() * 2 : 1;
                h.ratioY !== 1 ? g = h.ratioY + Math.random() * 2 : 1;
                if (l[f - 1].duration + l[f - 1].interval < l[f - 1].currTime / 2) {
                    cancelAnimationFrame(requestId);
                    Particles.prototype._draw();
                    return;
                } else {
                    if (k < b + c) {
                        if (k >= c) {
                            d = window[h.ease]((k - c) * j, h.x0, (h.x1 - h.x0) * j, b);
                            a = window[h.ease]((k - c) * g, h.y0, (h.y1 - h.y0) * g, b);
                            canvas.ctx.fillRect(d, a, 1, 1)
                        }
                    } else {
                        canvas.ctx.fillRect(h.x1, h.y1, 1, 1)
                    }
                }
                h.currTime += Math.random() + 0.5
            }
        }
        requestId = requestAnimationFrame(Particles.prototype._render);
    },
    _animate: function(a) {
        if (startTime + a < new Date().getTime()) {
            requestId = requestAnimationFrame(Particles.prototype._render);
        } else {
            setTimeout(function() {
                Particles.prototype._animate(a);
            })
        }
    }
};

// 缓动函数
var linear = function(e, a, g, f) {
        return g * e / f + a
    },
    easeInOutQuad = function(e, a, g, f) {
        e /= f / 2;
        if (e < 1) {
            return g / 2 * e * e + a
        }
        e--;
        return -g / 2 * (e * (e - 2) - 1) + a
    },
    easeOutQuad = function(e, a, g, f) {
        e /= f;
        return -g * e * (e - 2) + a
    },
    easeOutQuad = function(e, a, g, f) {
        e /= f;
        return -g * e * (e - 2) + a
    },
    easeInCubic = function(e, a, g, f) {
        e /= f;
        return g * e * e * e + a
    },
    easeOutCubic = function(e, a, g, f) {
        e /= f;
        e--;
        return g * (e * e * e + 1) + a
    },
    easeInOutCubic = function(e, a, g, f) {
        e /= f / 2;
        if (e < 1) {
            return g / 2 * e * e * e + a
        }
        e -= 2;
        return g / 2 * (e * e * e + 2) + a
    },
    easeInQuart = function(e, a, g, f) {
        e /= f;
        return g * e * e * e * e + a
    },
    easeOutQuart = function(e, a, g, f) {
        e /= f;
        e--;
        return -g * (e * e * e * e - 1) + a
    },
    easeInOutQuart = function(e, a, g, f) {
        e /= f / 2;
        if (e < 1) {
            return g / 2 * e * e * e * e + a
        }
        e -= 2;
        return -g / 2 * (e * e * e * e - 2) + a
    },
    easeInQuint = function(e, a, g, f) {
        e /= f;
        return g * e * e * e * e * e + a
    },
    easeOutQuint = function(e, a, g, f) {
        e /= f;
        e--;
        return g * (e * e * e * e * e + 1) + a
    },
    easeInOutQuint = function(e, a, g, f) {
        e /= f / 2;
        if (e < 1) {
            return g / 2 * e * e * e * e * e + a
        }
        e -= 2;
        return g / 2 * (e * e * e * e * e + 2) + a
    },
    easeInSine = function(e, a, g, f) {
        return -g * Math.cos(e / f * (Math.PI / 2)) + g + a
    },
    easeOutSine = function(e, a, g, f) {
        return g * Math.sin(e / f * (Math.PI / 2)) + a
    },
    easeInOutSine = function(e, a, g, f) {
        return -g / 2 * (Math.cos(Math.PI * e / f) - 1) + a
    },
    easeInExpo = function(e, a, g, f) {
        return g * Math.pow(2, 10 * (e / f - 1)) + a
    },
    easeOutExpo = function(e, a, g, f) {
        return g * (-Math.pow(2, -10 * e / f) + 1) + a
    },
    easeInOutExpo = function(e, a, g, f) {
        return g * (-Math.pow(2, -10 * e / f) + 1) + a
    },
    easeInCirc = function(e, a, g, f) {
        e /= f;
        return -g * (Math.sqrt(1 - e * e) - 1) + a
    },
    easeOutCirc = function(e, a, g, f) {
        e /= f;
        e--;
        return g * Math.sqrt(1 - e * e) + a
    },
    easeInOutCirc = function(e, a, g, f) {
        e /= f / 2;
        if (e < 1) {
            return -g / 2 * (Math.sqrt(1 - e * e) - 1) + a
        }
        e -= 2;
        return g / 2 * (Math.sqrt(1 - e * e) + 1) + a
    },
    easeInOutElastic = function(g, e, k, j, f, i) {
        if (g == 0) {
            return e
        }
        if ((g /= j / 2) == 2) {
            return e + k
        }
        if (!i) {
            i = j * (0.3 * 1.5)
        }
        if (!f || f < Math.abs(k)) {
            f = k;
            var h = i / 4
        } else {
            var h = i / (2 * Math.PI) * Math.asin(k / f)
        }
        if (g < 1) {
            return -0.5 * (f * Math.pow(2, 10 * (g -= 1)) * Math.sin((g * j - h) * (2 * Math.PI) / i)) + e
        }
        return f * Math.pow(2, -10 * (g -= 1)) * Math.sin((g * j - h) * (2 * Math.PI) / i) * 0.5 + k + e
    },
    easeInElastic = function(g, e, k, j, f, i) {
        if (g == 0) {
            return e
        }
        if ((g /= j) == 1) {
            return e + k
        }
        if (!i) {
            i = j * 0.3
        }
        if (!f || f < Math.abs(k)) {
            f = k;
            var h = i / 4
        } else {
            var h = i / (2 * Math.PI) * Math.asin(k / f)
        }
        return -(f * Math.pow(2, 10 * (g -= 1)) * Math.sin((g * j - h) * (2 * Math.PI) / i)) + e
    },
    easeOutElastic = function(g, e, k, j, f, i) {
        if (g == 0) {
            return e
        }
        if ((g /= j) == 1) {
            return e + k
        }
        if (!i) {
            i = j * 0.3
        }
        if (!f || f < Math.abs(k)) {
            f = k;
            var h = i / 4
        } else {
            var h = i / (2 * Math.PI) * Math.asin(k / f)
        }
        return (f * Math.pow(2, -10 * g) * Math.sin((g * j - h) * (2 * Math.PI) / i) + k + e)
    },
    easeInOutBack = function(e, a, h, g, f) {
        if (f == undefined) {
            f = 1.70158
        }
        if ((e /= g / 2) < 1) {
            return h / 2 * (e * e * (((f *= (1.525)) + 1) * e - f)) + a
        }
        return h / 2 * ((e -= 2) * e * (((f *= (1.525)) + 1) * e + f) + 2) + a
    },
    easeInBack = function(e, a, h, g, f) {
        if (f == undefined) {
            f = 1.70158
        }
        return h * (e /= g) * e * ((f + 1) * e - f) + a
    },
    easeOutBack = function(e, a, h, g, f) {
        if (f == undefined) {
            f = 1.70158
        }
        return h * ((e = e / g - 1) * e * ((f + 1) * e + f) + 1) + a
    };