import { read as readCFB, find, CFB$Container } from "cfb";
import { JSDOM } from "jsdom";
import { WJSDoc, WJSPara, WJSTable, WJSTableRow, WJSTableCell, ParsedData } from "../../types";
const omml2mathml = require('omml2mathml');
/* ECMA 17.3.1.22 p CT_P */
function process_para(child: Node, root: WJSPara, dataParsed: ParsedData) {
  switch (child.nodeType) {
    case 1 /* ELEMENT_NODE */:
      let element = (child as Element);
      switch (element.tagName) {
        case "w:r":
        case "w:sdt":
        case "w:sdtContent":
        case "w:customXml":
          element.childNodes.forEach((child) => process_para(child, root, dataParsed));
          break;
        case "w:t":
          root.elts.push({ t: "s", v: child.textContent }); 
          dataParsed.parsedHTML += element.outerHTML
          break;
        case "w:hyperlink": // TODO: store actual hyperlink?
          element.childNodes.forEach((child) => process_para(child, root, dataParsed));
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
          let mathmlElement = omml2mathml(element);
          // console.log(mathmlElement)

          if (mathmlElement) {
              // console.log("THIS IS MATHHH")
              element = mathmlElement
              dataParsed.parsedHTML += element.outerHTML
              // console.log(element.outerHTML)
          }
          break
        case "w16se:sym":
          break;
        default: throw `DOCX para unsupported ${element.tagName} element`
      }
      break;
  }
};

function process_tc(tcelt: Element, dataParsed: ParsedData): WJSTableCell {
  const tableCell: WJSTableCell = { t: "c", p: [] };
  const para: WJSPara = {elts: []};
  tcelt.childNodes.forEach(child => {
    const data = process_body_elt(child, false, dataParsed);
    if (data) tableCell.p.push(data);
    // console.log(tableCell.p[0]);
  })
  return tableCell;
}

function process_tr(trelt: Element, dataParsed: ParsedData): WJSTableRow {
  const tableRow: WJSTableRow = { t: "r", c: [] };
  trelt.childNodes.forEach(child => {
    if(child.nodeType != 1) return;
    const element = (child as Element);
    switch(element.tagName) {
      case "w:trPr": 
      case "w:sdt":
      case "w:tblPrEx": 
      case "w:commentRangeEnd": 
      break;
      case "w:tc" :
        tableRow.c.push(process_tc(element, dataParsed));
        // console.log("cells: ", tableRow.c);
        break;
      default: throw `DOCX tablerow unsupported ${element.tagName} element`
    }
  });
  return tableRow

}

function process_table(tablelt: Element, dataParsed: ParsedData): WJSTable {
  const table: WJSTable = { t: "t", r: [] };
  tablelt.childNodes.forEach(child => {
    if (child.nodeType != 1) return;
    const element = (child as Element);
    switch (element.tagName) {
      case "w:tblPr":
      case "w:tblGrid":
      case "w:bookmarkEnd":
        break;
      case "w:tr":
        table.r.push(process_tr(element, dataParsed));
        // console.log("rows: ", table.r);
        break;
      default: throw `DOCX table unsuported ${element.tagName} element`
    }
  });
  return table;
}

function process_body_elt(child: ChildNode, root: boolean = false, dataParsed: ParsedData): WJSPara | void {
  const para: WJSPara = { elts: [] };
  switch (child.nodeType) {
    case 1: /* ELEMENT_NODE */
      const element = (child as Element);
      switch (element.tagName) {
        case "w:p":
          element.childNodes.forEach((child) => process_para(child, para, dataParsed));
          return para;
        case "w:tbl":
          para.elts.push(process_table(element, dataParsed));
          return para;
        // console.log("tables: ", para.elts);
        case "w:customXML":
          if (root) break;
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
        default: throw `DOCX body unsupported ${element.tagName} element`
      }
      break;
  }
}

export function parse_cfb(file: CFB$Container): WJSDoc {
  // Get content of document.xml
  const buf = find(file, "/word/document.xml").content;

  // Parse with JSDOM
  const dom = new JSDOM((buf as Buffer).toString(), { contentType: "text/xml" });

  const docx: WJSDoc = { p: [] }

  const rootelt = dom.window.document.children[0];

  const bodyelt = rootelt.querySelector("w\\:document > w\\:body");
  const dataParsed = { parsedHTML: "" }
  bodyelt.childNodes.forEach(child => {
    const res = process_body_elt(child, true, dataParsed);
    if (res) docx.p.push(res);
  })
  console.log(dataParsed.parsedHTML)
  return docx;

  // const paragraphs = dom.window.document.querySelectorAll("w\\:p");

  // const para = parse_para(paragraphs);

}