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

    // 缓动函数类型
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

        // 获取画布及图片矩阵
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
                    pOffset: options.particleOffset || 2,
                    startX: options.startX || (image.x + image.w / 2),
                    startY: options.startY || 0,
                    duration: options.duration || 2000,
                    interval: options.interval || 10,
                    ease: transitionType,
                    cols: options.cols || 440,
                    rows: options.rows || 100
                });
                image.isLoaded = true;
                startTime = new Date().getTime();
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
    _calculate: function(userOptions) {
        var imgArray = image.imgData.data;
        var cols = userOptions.cols,
            rows = userOptions.rows;
        // 粒子化后每个单元的高和宽
        var s_width = parseInt(image.w / cols),
            s_height = parseInt(image.h / rows);
        var index = 0;

        // 创建单个粒子
        var particle = {};
        for (var i = 0; i < cols; i++) {
            for (var j = 0; j < rows; j++) {
                index = (j * s_height * image.w + i * s_width) * 4;
                if (imgArray[index + 3] > 100) {
                    particle = {
                        start_x: userOptions.startX,
                        start_y: userOptions.startY,
                        end_x: image.x + i * s_width + (Math.random() - 0.5) * 10 * userOptions.pOffset,// 增加粒子偏移量 松散程度
                        end_y: image.y + j * s_height + (Math.random() - 0.5) * 10 * userOptions.pOffset,// 增加粒子偏移量 松散程度
                        fillStyle: userOptions.color,
                        delay: j / 20,   //单个粒子delay
                        currTime: 0,    // 计时动画执行的时间
                        count: 0,       // 计时delay
                        duration: parseInt(userOptions.duration / 10) + 1, // 加快粒子运动
                        interval: parseInt(Math.random() * 10 * userOptions.interval), // 随机生成粒子运动间隔
                        ease: userOptions.ease
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
                    this.array.push(particle);
                }
            }
        }
    },

    // 绘制最终位置 静态图
    _draw: function() {
        canvas.ctx.clearRect(0, 0, canvas.w, canvas.h);
        var length = this.array.length;
        var particle = null;
        for (var i = 0; i < length; i++) {
            particle = this.array[i];
            canvas.ctx.fillStyle = particle.fillStyle;
            canvas.ctx.fillRect(particle.end_x, particle.end_y, 1, 1)
        }
    },

    // 循环调用绘制 动态路径
    _render: function() {
        canvas.ctx.clearRect(0, 0, canvas.w, canvas.h);
        var particlesArray = Particles.prototype.array;
        var length = particlesArray.length;
        var cur_particle = null;
        var x, y;
        var currTime = 0,
            duration = 0,
            interval = 0
        for (var i = 0; i < length; i++) {
            cur_particle = particlesArray[i];
            if (cur_particle.count++ > cur_particle.delay) {
                canvas.ctx.fillStyle = cur_particle.fillStyle;
                currTime = cur_particle.currTime;
                duration = cur_particle.duration;
                interval = cur_particle.interval;
                // 最后一个粒子动画执行结束停止动画
                if (particlesArray[length - 1].duration + particlesArray[length - 1].interval < particlesArray[length - 1].currTime/2) {
                    cancelAnimationFrame(requestId);
                    Particles.prototype._draw();
                    return;
                } else {
                    if (currTime < duration + interval) {
                        if (currTime >= interval) {
                            // 计算此刻运动粒子的坐标
                            x = window[cur_particle.ease]((currTime - interval), cur_particle.start_x, (cur_particle.end_x - cur_particle.start_x), duration);
                            y = window[cur_particle.ease]((currTime - interval), cur_particle.start_y, (cur_particle.end_y - cur_particle.start_y), duration);
                            canvas.ctx.fillRect(x, y, 1, 1);
                        }
                    } else {
                        canvas.ctx.fillRect(cur_particle.end_x, cur_particle.end_y, 1, 1);
                    }
                }
                // 时间变化的更平滑 动画效果更平滑
                cur_particle.currTime += Math.random() + 0.5;
            }
        }
        // 循环调用render方法 每次重新绘制所有节点新位置
        requestId = requestAnimationFrame(Particles.prototype._render);
    },

    _animate: function(delay) {
        if (startTime + delay < new Date().getTime()) {
            requestId = requestAnimationFrame(Particles.prototype._render);
        } else {
            setTimeout(function() {
                Particles.prototype._animate(delay);
            })
        }
    }
};

// 缓动函数 参考http://gsgd.co.uk/sandbox/jquery/easing/jquery.easing.1.3.js 效果见：http://easings.net/zh-cn#
/*
* css动画的缓动函数 http://www.tuicool.com/articles/FZj2i2y
* */
var easeInOutExpo = function(e, a, g, f) {
        return g * (-Math.pow(2, -10 * e / f) + 1) + a
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
    easeOutBack = function(e, a, h, g, f) {
        if (f == undefined) {
            f = 1.70158
        }
        return h * ((e = e / g - 1) * e * ((f + 1) * e + f) + 1) + a
    };