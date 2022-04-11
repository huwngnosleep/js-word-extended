"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parse_cfb = void 0;
var cfb_1 = require("cfb");
var jsdom_1 = require("jsdom");
var omml2mathml = require('omml2mathml');
/* ECMA 17.3.1.22 p CT_P */
function process_para(child, root, parsedData) {
    switch (child.nodeType) {
        case 1 /* ELEMENT_NODE */:
            var element = child;
            switch (element.tagName) {
                case "w:r":
                case "w:sdt":
                case "w:sdtContent":
                case "w:customXml":
                    element.childNodes.forEach(function (child) { return process_para(child, root, parsedData); });
                    break;
                case "w:t":
                    root.elts.push({ t: "s", v: child.textContent });
                    parsedData.parsedHTML += "".concat(child.textContent);
                    break;
                case "w:hyperlink": // TODO: store actual hyperlink?
                    element.childNodes.forEach(function (child) { return process_para(child, root, parsedData); });
                    break;
                case "w:br":
                    break;
                case "w:annotationRef":
                case "w:bookmarkEnd":
                case "w:bookmarkStart":
                case "w:commentRangeStart":
                case "w:commentRangeEnd":
                case "w:commentReference": //TODO: add reference support
                case "w:del":
                case "w:drawing":
                case "w:endnoteReference":
                case "w:fldChar":
                case "w:fldSimple":
                case "w:footnoteReference":
                case "w:ins":
                case "w:instrText":
                case "w:lastRenderedPageBreak":
                case "w:moveFrom":
                case "w:moveFromRangeStart":
                case "w:moveFromRangeEnd":
                case "w:moveTo":
                case "w:moveToRangeStart":
                case "w:moveToRangeEnd":
                case "w:noBreakHyphen":
                case "w:object":
                case "w:pict":
                case "w:pPr":
                case "w:proofErr":
                case "w:rPr":
                case "w:ruby":
                case "w:sdtEndPr":
                case "w:sdtPr":
                case "w:sectPr":
                case "w:smartTag":
                case "w:softHyphen":
                case "w:sym":
                case "w:tab": //TODO: Add tab support
                case "mc:AlternateContent":
                case "m:oMath":
                case "m:oMathPara":
                    var mathmlElement = omml2mathml(element);
                    if (mathmlElement) {
                        element = mathmlElement;
                        parsedData.parsedHTML += element.outerHTML;
                        // console.log(element.outerHTML)
                    }
                    break;
                case "w16se:sym":
                    break;
                default: throw "DOCX para unsupported ".concat(element.tagName, " element");
            }
            break;
    }
}
;
function process_tc(tcelt, parsedData) {
    var tableCell = { t: "c", p: [] };
    tcelt.childNodes.forEach(function (child) {
        var data = process_body_elt(child, false);
        if (data)
            tableCell.p.push(data);
        // console.log(tableCell.p[0]);
    });
    return tableCell;
}
function process_tr(trelt, parsedData) {
    var tableRow = { t: "r", c: [] };
    // console.log(trelt.outerHTML)
    trelt.childNodes.forEach(function (child) {
        if (child.nodeType != 1)
            return;
        var element = child;
        switch (element.tagName) {
            case "w:trPr":
            case "w:sdt":
            case "w:tblPrEx":
            case "w:commentRangeEnd":
                break;
            case "w:tc":
                tableRow.c.push(process_tc(element, parsedData));
                // console.log("cells: ", tableRow.c);
                parsedData.parsedHTML = "<tr>".concat(parsedData.parsedHTML, "</tr>");
                break;
            default: throw "DOCX tablerow unsupported ".concat(element.tagName, " element");
        }
    });
    return tableRow;
}
function mapHTMLTable(table) {
    var parsedHTML = '';
    var listRow = [];
    for (var _i = 0, _a = table.r; _i < _a.length; _i++) {
        var row = _a[_i];
        var listCol = [];
        for (var _b = 0, _c = row.c; _b < _c.length; _b++) {
            var col = _c[_b];
            var listPara = [];
            for (var _d = 0, _e = col.p; _d < _e.length; _d++) {
                var para = _e[_d];
                listPara.push("<p>".concat(para.localData.join(''), "</p>"));
            }
            listCol.push("<td>".concat(listPara.join(''), "</td>"));
        }
        listRow.push("<tr>".concat(listCol.join(''), "</tr>"));
    }
    parsedHTML = "<table>".concat(listRow.join(''), "</table>");
    return parsedHTML;
}
function process_table(tablelt, parsedData) {
    var table = { t: "t", r: [] };
    tablelt.childNodes.forEach(function (child) {
        if (child.nodeType != 1)
            return;
        var element = child;
        switch (element.tagName) {
            case "w:tblPr":
            case "w:tblGrid":
            case "w:bookmarkEnd":
                break;
            case "w:tr":
                table.r.push(process_tr(element, parsedData));
                // console.log("rows: ", table.r);
                break;
            default: throw "DOCX table unsuported ".concat(element.tagName, " element");
        }
    });
    return table;
}
function process_body_elt(child, root) {
    if (root === void 0) { root = false; }
    var para = { elts: [], localData: [] };
    var parsedData = { parsedHTML: "" };
    switch (child.nodeType) {
        case 1: /* ELEMENT_NODE */
            var element = child;
            switch (element.tagName) {
                case "w:p":
                    element.childNodes.forEach(function (child) { return process_para(child, para, parsedData); });
                    para.localData.push(parsedData.parsedHTML);
                    return para;
                case "w:tbl":
                    var table = process_table(element, parsedData);
                    para.elts.push(table);
                    para.localData.push(mapHTMLTable(table));
                    return para;
                // console.log("tables: ", para.elts);
                case "w:customXML":
                    if (root)
                        break;
                case "w:sectPr":
                case "w:bookmarkStart":
                case "w:bookmarkEnd":
                case "w:commentRangeEnd":
                case "w:moveFromRangeEnd":
                case "w:tcPr":
                case "w:sdt":
                case "w:altChunk": //TODO: implicit/explicit link handeling
                case "mc:AlternateContent":
                    break;
                default: throw "DOCX body unsupported ".concat(element.tagName, " element");
            }
            break;
    }
}
function parse_cfb(file) {
    // Get content of document.xml
    var buf = (0, cfb_1.find)(file, "/word/document.xml").content;
    // Parse with JSDOM
    var dom = new jsdom_1.JSDOM(buf.toString(), { contentType: "text/xml" });
    var docx = { p: [], html: '' };
    var rootelt = dom.window.document.children[0];
    var bodyelt = rootelt.querySelector("w\\:document > w\\:body");
    var htmlData = [];
    bodyelt.childNodes.forEach(function (child) {
        var res = process_body_elt(child, true);
        if (res) {
            docx.p.push(res);
            htmlData.push(res.localData);
        }
    });
    docx.html = htmlData.join('');
    return docx;
    // const paragraphs = dom.window.document.querySelectorAll("w\\:p");
    // const para = parse_para(paragraphs);
}
exports.parse_cfb = parse_cfb;
//# sourceMappingURL=index.js.map