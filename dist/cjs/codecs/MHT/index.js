"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parse_cfb = void 0;
var HTML_1 = require("../HTML");
function parse_cfb(file) {
    var firstHtmlIdx = file.FullPaths.findIndex(function (path) { return /\.html?$/.test(path); });
    var entry = file.FileIndex[firstHtmlIdx];
    if (!entry || !entry.content)
        throw "MHT missing an HTML entry";
    return (0, HTML_1.read)(Buffer.from(entry.content));
}
exports.parse_cfb = parse_cfb;
//# sourceMappingURL=index.js.map