(function (w) {
    w.css = function css(node, type, val) {
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
                        case "tanslateY":
                            text += `${item}(${node["transform"][item]}px)`;
                            break;
                        case "scale":
                            text += `${item}(${node["transform"][item]})`;
                            break;
                        case "rotate":
                            text += `${item}(${node["transform"][item]}deg)`;
                            break;
                    }
                }
            }
            node.style.transform = text;
            node.style.webkitTransform = text;
            console.log(node.style.transform);
            console.log(node.style.webkitTransform);
            console.log(text);
        } else if (arguments.length == 2) {
            val = node["transform"][type];
            if (typeof val === "undefined") {
                switch (type) {
                    case "translateX":
                    case "tanslateY":
                    case "scale":
                        val = "0";
                        break;
                    case "rotate":
                        val = "1";
                        break;
                }
            }
            return val;
        }
    };
})(window);
