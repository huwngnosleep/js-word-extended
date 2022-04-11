"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readFile = exports.read = exports.read_str = exports.parse_zip = exports.parse_cfb = void 0;
var cfb_1 = require("cfb");
var password_1 = require("./DOCX/password");
var DOCX_1 = require("./DOCX");
var DOC_1 = require("./DOC");
var MHT_1 = require("./MHT");
var ODT_1 = require("./ODT");
var TXT_1 = require("./TXT");
var HTML_1 = require("./HTML");
var RTF_1 = require("./RTF");
var XML_1 = require("./XML");
var fs_1 = require("fs");
function parse_cfb(file) {
    /* MS-OFFCRYPTO 2.1.1 */
    if ((0, cfb_1.find)(file, "/\x06DataSpaces/Version") && (0, cfb_1.find)(file, "/\x06DataSpaces/DataSpaceMap"))
        (0, password_1.parse_cfb)(file);
    if ((0, cfb_1.find)(file, "/WordDocument"))
        return (0, DOC_1.parse_cfb)(file);
    if ((0, cfb_1.find)(file, "/CONTENTS"))
        throw "Unsupported Works WPS file";
    if ((0, cfb_1.find)(file, "/MM") || (0, cfb_1.find)(file, "/MN0"))
        throw "Unsupported Works WPS file";
    throw "Unsupported CFB file";
}
exports.parse_cfb = parse_cfb;
function parse_zip(file) {
    if ((0, cfb_1.find)(file, "/[Content_Types].xml"))
        return (0, DOCX_1.parse_cfb)(file);
    if ((0, cfb_1.find)(file, "/META-INF/manifest.xml"))
        return (0, ODT_1.parse_cfb)(file);
    throw "Unsupported ZIP file";
}
exports.parse_zip = parse_zip;
/** read JS string */
function read_str(data) {
    var header = data.slice(0, 17);
    /* MIME text is technically 7-bit so type: "binary" is acceptable */
    if (header == "MIME-Version: 1.0")
        return (0, MHT_1.parse_cfb)((0, cfb_1.read)(data, { type: "binary" }));
    if (header.slice(0, 5) == "<?xml")
        return (0, XML_1.parse_str)(data);
    if (header.slice(0, 5) == "<html")
        return (0, HTML_1.parse_str)(data);
    /* TODO: more formats here */
    if (header.split("").map(function (c) { return c.charCodeAt(0); }).every(function (cc) { return cc == 9 || cc == 10 || cc == 13 || cc >= 0x20; }))
        return (0, TXT_1.parse_str)(data.toString());
    if (!header.length)
        return { p: [] };
    throw "Unsupported string";
}
exports.read_str = read_str;
// TODO: replace this with a proper structure
function read(data) {
    var header = data.slice(0, 17).toString("binary");
    if (header.slice(0, 3) == "\xef\xbb\xbf")
        return read_str(data.slice(3).toString());
    if (header.slice(0, 2) == "\xff\xfe")
        return read_str(data.slice(2).toString("utf16le"));
    /* One convenient use of buf.swap16() is to perform a fast in-place conversion between UTF-16 little-endian and UTF-16 big-endian */
    if (header.slice(0, 2) == "\xfe\xff")
        return read_str(data.slice(2).swap16().toString("utf16le"));
    if (header == "MIME-Version: 1.0")
        return (0, MHT_1.parse_cfb)((0, cfb_1.read)(data, { type: "buffer" }));
    if (header.slice(0, 6) == "{\\rtf1")
        return (0, RTF_1.read)(data);
    if (header.slice(0, 5) == "<?xml")
        return (0, XML_1.read)(data);
    if (header.slice(0, 5) == "<html")
        return (0, HTML_1.read)(data);
    if (header.slice(0, 4) == "\xD0\xCF\x11\xE0")
        return parse_cfb((0, cfb_1.read)(data, { type: "buffer" }));
    if (header.slice(0, 4) == "PK\x03\x04")
        return parse_zip((0, cfb_1.read)(data, { type: "buffer" }));
    // TODO: better plaintext check
    if (header.split("").map(function (c) { return c.charCodeAt(0); }).every(function (cc) { return cc == 9 || cc == 10 || cc == 13 || cc >= 0x20 && cc <= 0x7F; }))
        return (0, TXT_1.parse_str)(data.toString());
    throw "Unsupported file";
}
exports.read = read;
function readFile(path) {
    return read((0, fs_1.readFileSync)(path));
}
exports.readFile = readFile;
//# sourceMappingURL=index.js.map