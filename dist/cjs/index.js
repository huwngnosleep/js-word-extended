"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.to_text = exports.readFile = exports.read = void 0;
var codecs_1 = require("./codecs");
Object.defineProperty(exports, "read", { enumerable: true, get: function () { return codecs_1.read; } });
Object.defineProperty(exports, "readFile", { enumerable: true, get: function () { return codecs_1.readFile; } });
var TXT_1 = require("./codecs/TXT");
Object.defineProperty(exports, "to_text", { enumerable: true, get: function () { return TXT_1.write_str; } });
__exportStar(require("./types"), exports);
//# sourceMappingURL=index.js.map