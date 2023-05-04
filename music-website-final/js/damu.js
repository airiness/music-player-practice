(function (w) {
    w.damu = {};

    // css transform
    w.damu.css = function (node, type, val) {
        if (typeof node === "object" && typeof node["transform"] === "undefined") {
            node["transform"] = {};
        }

        if (arguments.length >= 3) {
            var text = "";
            node["transform"][type] = val;

            for (item in node["transform"]) {
                if (node["transform"].hasOwnProperty(item)) {
                    switch (item) {
                        case "translateX":
                        case "translateY":
                        case "translateZ":
                            text += item + "(" + node["transform"][item] + "px)";
                            break;
                        case "scale":
                            text += item + "(" + node["transform"][item] + ")";
                            break;
                        case "rotate":
                            text += item + "(" + node["transform"][item] + "deg)";
                            break;
                    }
                }
            }
            node.style.transform = node.style.webkitTransform = text;
        } else if (arguments.length == 2) {
            //读取
            val = node["transform"][type];
            if (typeof val === "undefined") {
                switch (type) {
                    case "translateX":
                    case "translateY":
                    case "rotate":
                        val = 0;
                        break;
                    case "scale":
                        val = 1;
                        break;
                }
            }
            return val;
        }
    };

    // carousel
    w.damu.carousel = function (arr) {
        var carouselWrap = document.querySelector(".carousel-wrap");
        if (carouselWrap) {
            var pointslength = arr.length;

            var needCarousel = carouselWrap.getAttribute("needCarousel");
            needCarousel = needCarousel == null ? false : true;
            if (needCarousel) {
                arr = arr.concat(arr);
            }
            var ulNode = document.createElement("ul");
            damu.css(ulNode, "translateZ", 0);
            var styleNode = document.createElement("style");
            ulNode.classList.add("list");
            for (var i = 0; i < arr.length; i++) {
                ulNode.innerHTML += '<li><a href="javascript:;"><img src="' + arr[i] + '"/></a></li>';
            }
            styleNode.innerHTML =
                ".carousel-wrap > .list > li{width: " +
                (1 / arr.length) * 100 +
                "%;}.carousel-wrap > .list{width: " +
                arr.length +
                "00%}";
            carouselWrap.appendChild(ulNode);
            document.head.appendChild(styleNode);

            var imgNodes = document.querySelector(".carousel-wrap > .list > li > a >img");
            setTimeout(function () {
                carouselWrap.style.height = imgNodes.offsetHeight + "px";
            }, 100);

            var pointsWrap = document.querySelector(".carousel-wrap > .points-wrap");
            if (pointsWrap) {
                for (var i = 0; i < pointslength; i++) {
                    if (i == 0) {
                        pointsWrap.innerHTML += '<span class="active"></span>';
                    } else {
                        pointsWrap.innerHTML += "<span></span>";
                    }
                }
                var pointsSpan = document.querySelectorAll(".carousel-wrap > .points-wrap > span");
            }

            var index = 0;
            var startX = 0;
            var startY = 0;
            var elementX = 0;
            var elementY = 0;

            var isX = true;
            var isFirst = true;

            carouselWrap.addEventListener("touchstart", function (ev) {
                ev = ev || event;
                var TouchC = ev.changedTouches[0];
                ulNode.style.transition = "none";

                if (needCarousel) {
                    var index = damu.css(ulNode, "translateX") / document.documentElement.clientWidth;
                    if (-index === 0) {
                        index = -pointslength;
                    } else if (-index == arr.length - 1) {
                        index = -(pointslength - 1);
                    }
                    damu.css(ulNode, "translateX", index * document.documentElement.clientWidth);
                }

                startX = TouchC.clientX;
                startY = TouchC.clientY;
                elementX = damu.css(ulNode, "translateX");
                elementY = damu.css(ulNode, "translateY");

                clearInterval(timer);

                isX = true;
                isFirst = true;
            });
            carouselWrap.addEventListener("touchmove", function (ev) {
                if (!isX) {
                    return;
                }
                ev = ev || event;
                var TouchC = ev.changedTouches[0];
                var nowX = TouchC.clientX;
                var nowY = TouchC.clientY;
                var disX = nowX - startX;
                var disY = nowY - startY;

                if (isFirst) {
                    isFirst = false;
                    if (Math.abs(disY) > Math.abs(disX)) {
                        isX = false;
                        return;
                    }
                }

                damu.css(ulNode, "translateX", elementX + disX);
            });
            carouselWrap.addEventListener("touchend", function (ev) {
                ev = ev || event;
                index = damu.css(ulNode, "translateX") / document.documentElement.clientWidth;
                index = Math.round(index);

                if (index > 0) {
                    index = 0;
                } else if (index < 1 - arr.length) {
                    index = 1 - arr.length;
                }

                xiaoyuandian(index);

                ulNode.style.transition = ".5s transform";
                damu.css(ulNode, "translateX", index * document.documentElement.clientWidth);

                if (needAuto) {
                    auto();
                }
            });

            var timer = 0;
            var needAuto = carouselWrap.getAttribute("needAuto");
            needAuto = needAuto == null ? false : true;
            if (needAuto) {
                auto();
            }
            function auto() {
                clearInterval(timer);
                timer = setInterval(function () {
                    if (index == 1 - arr.length) {
                        ulNode.style.transition = "none";
                        index = 1 - arr.length / 2;
                        damu.css(ulNode, "translateX", index * document.documentElement.clientWidth);
                    }

                    setTimeout(function () {
                        index--;
                        ulNode.style.transition = "1s transform";
                        xiaoyuandian(index);
                        damu.css(ulNode, "translateX", index * document.documentElement.clientWidth);
                    }, 50);
                }, 2000);
            }

            function xiaoyuandian(index) {
                if (!pointsWrap) {
                    return;
                }
                for (var i = 0; i < pointsSpan.length; i++) {
                    pointsSpan[i].classList.remove("active");
                }
                pointsSpan[-index % pointslength].classList.add("active");
            }
        }
    };

    w.damu.dragNav = function () {
        var wrap = document.querySelector(".damu-nav-drag-wrapper");
        var item = document.querySelector(".damu-nav-drag-wrapper .list");

        var startX = 0;
        var elementX = 0;
        var minX = wrap.clientWidth - item.offsetWidth;
        var lastTime = 0;
        var lastPoint = 0;
        var timeDis = 1;
        var pointDis = 0;
        wrap.addEventListener("touchstart", function (ev) {
            ev = ev || event;
            var touchC = ev.changedTouches[0];

            startX = touchC.clientX;
            elementX = damu.css(item, "translateX");

            item.style.transition = "none";

            lastTime = new Date().getTime();
            lastPoint = touchC.clientX;

            pointDis = 0;
            item.handMove = false;
        });

        wrap.addEventListener("touchmove", function (ev) {
            ev = ev || event;
            var touchC = ev.changedTouches[0];
            var nowX = touchC.clientX;
            var disX = nowX - startX;
            var translateX = elementX + disX;

            var nowTime = new Date().getTime();
            var nowPoint = touchC.clientX;
            timeDis = nowTime - lastTime;
            pointDis = nowPoint - lastPoint;

            lastTime = nowTime;
            lastPoint = nowPoint;

            if (translateX > 0) {
                item.handMove = true;
                var scale =
                    document.documentElement.clientWidth / ((document.documentElement.clientWidth + translateX) * 1.5);
                translateX = damu.css(item, "translateX") + pointDis * scale;
            } else if (translateX < minX) {
                item.handMove = true;
                var over = minX - translateX;
                var scale =
                    document.documentElement.clientWidth / ((document.documentElement.clientWidth + over) * 1.5);
                translateX = damu.css(item, "translateX") + pointDis * scale;
            }
            damu.css(item, "translateX", translateX);
        });

        wrap.addEventListener("touchend", function (ev) {
            var translateX = damu.css(item, "translateX");
            if (!item.handMove) {
                var speed = pointDis / timeDis;
                speed = Math.abs(speed) < 0.5 ? 0 : speed;
                var targetX = translateX + speed * 200;
                var time = Math.abs(speed) * 0.2;
                time = time < 0.8 ? 0.8 : time;
                time = time > 2 ? 2 : time;
                var bsr = "";
                if (targetX > 0) {
                    targetX = 0;
                    bsr = "cubic-bezier(.26,1.51,.68,1.54)";
                } else if (targetX < minX) {
                    targetX = minX;
                    bsr = "cubic-bezier(.26,1.51,.68,1.54)";
                }
                item.style.transition = time + "s " + bsr + " transform";
                damu.css(item, "translateX", targetX);
            } else {
                item.style.transition = "1s transform";
                if (translateX > 0) {
                    translateX = 0;
                    damu.css(item, "translateX", translateX);
                } else if (translateX < minX) {
                    translateX = minX;
                    damu.css(item, "translateX", translateX);
                }
            }
        });
    };

    w.damu.vMove = function (wrap, callBack) {
        var item = wrap.children[0];
        damu.css(item, "translateZ", 0.1);

        var start = {};
        var element = {};
        var minY = wrap.clientHeight - item.offsetHeight;

        var lastTime = 0;
        var lastPoint = 0;
        var timeDis = 1;
        var pointDis = 0;

        var isY = true;
        var isFirst = true;

        var cleartime = 0;
        var Tween = {
            Linear: function (t, b, c, d) {
                return (c * t) / d + b;
            },
            back: function (t, b, c, d, s) {
                if (s == undefined) s = 1.70158;
                return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
            },
        };
        wrap.addEventListener("touchstart", function (ev) {
            ev = ev || event;
            var touchC = ev.changedTouches[0];

            minY = wrap.clientHeight - item.offsetHeight;

            start = { clientX: touchC.clientX, clientY: touchC.clientY };
            element.y = damu.css(item, "translateY");
            element.x = damu.css(item, "translateX");

            item.style.transition = "none";

            lastTime = new Date().getTime();
            lastPoint = touchC.clientY;

            pointDis = 0;
            item.handMove = false;

            isY = true;
            isFirst = true;

            clearInterval(cleartime);

            if (callBack && typeof callBack["start"] === "function") {
                callBack["start"].call(item);
            }
        });

        wrap.addEventListener("touchmove", function (ev) {
            if (!isY) {
                return;
            }

            ev = ev || event;
            var touchC = ev.changedTouches[0];

            var now = touchC;
            var dis = {};
            dis.y = now.clientY - start.clientY;
            dis.x = now.clientX - start.clientX;
            var translateY = element.y + dis.y;

            if (isFirst) {
                isFirst = false;
                if (Math.abs(dis.x) > Math.abs(dis.y)) {
                    isY = false;
                    return;
                }
            }

            var nowTime = new Date().getTime();
            var nowPoint = touchC.clientY;
            timeDis = nowTime - lastTime;
            pointDis = nowPoint - lastPoint;

            lastTime = nowTime;
            lastPoint = nowPoint;

            if (translateY > 0) {
                item.handMove = true;
                var scale =
                    document.documentElement.clientHeight /
                    ((document.documentElement.clientHeight + translateY) * 1.5);
                translateY = damu.css(item, "translateY") + pointDis * scale;
            } else if (translateY < minY) {
                item.handMove = true;
                var over = minY - translateY;
                var scale =
                    document.documentElement.clientHeight / ((document.documentElement.clientHeight + over) * 1.5);
                translateY = damu.css(item, "translateY") + pointDis * scale;
            }
            damu.css(item, "translateY", translateY);

            if (callBack && typeof callBack["move"] === "function") {
                callBack["move"].call(item);
            }
        });

        wrap.addEventListener("touchend", function (ev) {
            var translateY = damu.css(item, "translateY");
            if (!item.handMove) {
                var speed = pointDis / timeDis;
                speed = Math.abs(speed) < 0.5 ? 0 : speed;
                var targetY = translateY + speed * 200;
                var time = Math.abs(speed) * 0.2;
                time = time < 0.8 ? 0.8 : time;
                time = time > 2 ? 2 : time;

                var type = "Linear";
                if (targetY > 0) {
                    targetY = 0;
                    type = "back";
                } else if (targetY < minY) {
                    targetY = minY;
                    type = "back";
                }

                bsr(type, targetY, time);
            } else {
                item.style.transition = "1s transform";
                if (translateY > 0) {
                    translateY = 0;
                    damu.css(item, "translateY", translateY);
                } else if (translateY < minY) {
                    translateY = minY;
                    damu.css(item, "translateY", translateY);
                }

                if (callBack && typeof callBack["end"] === "function") {
                    callBack["end"].call(item);
                }
            }
        });

        function bsr(type, targetY, time) {
            clearInterval(cleartime);
            var t = 0;
            var b = damu.css(item, "translateY");
            var c = targetY - b;
            var d = (time * 1000) / (1000 / 60);
            cleartime = setInterval(function () {
                t++;

                if (callBack && typeof callBack["autoMove"] === "function") {
                    callBack["move"].call(item);
                }

                if (t > d) {
                    clearInterval(cleartime);

                    if (callBack && typeof callBack["end"] === "function") {
                        callBack["end"].call(item);
                    }
                }
                var point = Tween[type](t, b, c, d);
                damu.css(item, "translateY", point);
            }, 1000 / 60);
        }
    };
})(window);
