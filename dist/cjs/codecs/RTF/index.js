"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.read = exports.parse_str = void 0;
/*
    Skips all the control words/groups other than
    insrsid and par
*/
function should_skip(text) {
    if (text.includes("\\") || text.includes("\\*\\")) {
        // TODO: DETECT \\caps
        if (!text.includes("insrsid")) {
            if (text != "\\par") {
                return true;
            }
        }
    }
    return false;
}
function parse_str(data) {
    // let pairs = [];
    // let seen_par = false;
    // let blacklist = [ "\\fonttbl", "\\rtlch", "\\fcs1", "\\af0", "\\ltrch", "\\fcs0", "\\insrsid", "\\lsdlockedexcept", "\\*\\panose", "\\fbiminor"];
    // let current_par = "";
    // let counter = [];
    // let offsets = [];
    // let para_text = [];
    // let par_start = -1;
    // let last_open_brace = Infinity
    // let skiplength = Infinity; // keep track of skip length
    var doc = { p: [] };
    var current_paragraph = { elts: [] };
    doc.p.push(current_paragraph);
    var will_contain_text = false;
    /*
        TEST SAMPLES
    */
    var rtf = data;
    // let rtf = "{\\rtf1\\ansi\\deff0{\\fonttbl{\\f0\\froman Tms Rmn;}}"
    // let rtf = "{\\par The word \'93}{\\cs15\\b\\ul\\cf6 style}{\'94 is red and underlined. I used a style I called UNDERLINE.\\par }"
    // let rtf = "{\\rtlch\\fcs1 \\af31507 \\ltrch\\fcs0 \\insrsid6445377 Hello}{\\rtlch\\fcs1 \\af31507 \\ltrch\\fcs0 \\insrsid5199918 \\par }{\\rtlch\\fcs1 \\af31507 \\ltrch\\fcs0 \\insrsid6445377 There\\par }"
    // let rtf = "{\\rtlch\\fcs1 \\af0 \\ltrch\\fcs0 \\insrsid6445377 Hello}{\\rtlch\\fcs1 \\af0 \\ltrch\\fcs0 \\insrsid3943939 \\par }{\\rtlch\\fcs1 \\af0 \\ltrch\\fcs0 \\insrsid5116832 aaa}{\\rtlch\\fcs1 \\af0 \\ltrch\\fcs0 \\insrsid6445377 \\par }"
    // let rtf = "{\\rtlch\\fcs1 \\af0 \\ltrch\\fcs0 \\insrsid6445377 Hello}{\\rtlch\\fcs1 \\af0 \\ltrch\\fcs0 \\insrsid11279206  ba}{\\rtlch\\fcs1 \\af0 \\ltrch\\fcs0 \\insrsid3943939 \\par }{\\rtlch\\fcs1 \\af0 \\ltrch\\fcs0 \\insrsid5116832 aaa}"
    // let rtf = "{\\rtlch\\fcs1 \\af0 \\ltrch\\fcs0 \\insrsid6445377 Hello}{\\rtlch\\fcs1 \\af0 \\ltrch\\fcs0 \\insrsid11279206  ba}{\\rtlch\\fcs1 \\af0 \\ltrch\\fcs0 \\insrsid14709222  bok}{\\rtlch\\fcs1 \\af0 \\ltrch\\fcs0 \\insrsid3943939 \\par }{\\rtlch\\fcs1 \\af0 \\ltrch\\fcs0 \\insrsid5116832 aaa}{\\rtlch\\fcs1 \\af0 \\ltrch\\fcs0 \insrsid6445377 \\par }"
    // let rtf = "{\\rtlch\\fcs1 \\af31507 \\ltrch\\fcs0 \\loch\\af43\\insrsid16543523 \\hich\\af31506\\dbch\\af31505\\loch\\f43 TEST}{\\rtlch\\fcs1 \\af31507 \\ltrch\\fcs0 \\insrsid9255049 \\par }"
    // let rtf = "{\\fhimajor\\f31534\\fbidi \\fswiss\\fcharset178\\fprq2 Calibri Light (Arabic);}"
    // let rtf = "{\\rtlch\\fcs1 \\af0 \\ltrch\\fcs0 \\insrsid6769711 CHAPTER 1 \\par }\\pard \\ltrpar\\s28\\ql \\li0\\ri0\\widctlpar\\wrapdefault\\aspalpha\\aspnum\\faauto\\adjustright\\rin0\\lin0\\itap0\\pararsid9385249 {\\rtlch\\fcs1 \\af0 \\ltrch\\fcs0 \\insrsid6769711 Certain infectious and parasitic diseases }{\\rtlch\\fcs1 \\af0 \\ltrch\\fcs0 \\insrsid2574294 \\par }"
    var extract_text = rtf.replace(/({|\\[A-Za-z\d]+|}|[A-Za-z\d\.]+\s)/g, function ($$, $1, idx) {
        // Removes all control words except \\par and \\insrsid
        if (!should_skip($$)) {
            if ($$ == "{") {
                return "{";
            }
            else if ($$ == "}") {
                will_contain_text = false;
                return "}";
            }
            else if ($$.includes("insrsid")) {
                will_contain_text = true;
                return "";
            }
            else if ($$ == "\\par") {
                current_paragraph = { elts: [] };
                doc.p.push(current_paragraph);
                return "";
            }
            else {
                if (will_contain_text) {
                    current_paragraph.elts.push({ t: "s", v: $$ });
                    return $$;
                }
                return "";
            }
        }
        return "";
    });
    return doc;
}
exports.parse_str = parse_str;
function read(data) {
    return parse_str(data.toString());
}
exports.read = read;
/*
    if ($$ == "{") {
        counter.push(0);
        offsets.push(idx);
        last_open_brace = idx;

        return "{";
    } else if ($$ == "}") {
        counter.pop();
        offsets.pop();
        last_open_brace = -1;

        // if (seen_par) {
        //   console.log(pairs)
        // }

        if (counter.length < skiplength) {
            skiplength = Infinity; // reset if we exited
            if (par_start > -1) {
                var par_snippet = rtf.slice(par_start + "\\par".length, idx);
                par_start = -1;
                current_par += par_snippet;
            }
        }

        return "}";
    } else if (blacklist.indexOf($$) == -1) {
        var text = $$.replace(/\\\w+ ?/g, ""); // .match(/\b\w+\b/g)
        if (text !== null || text !== undefined) {
            para_text.push(text); // text[0]
        }
    } else if (blacklist.indexOf($$) > -1) {
        console.log($$)
        //skiplength = counter.length;
        return "";
    } else if (counter.length > skiplength) {
        return ""; // skip
    } else {
        if (counter[counter.length - 1]++ == 0) { // counter (stack) is empty
            if (blacklist.indexOf($$) > -1 || $$.match(/\\f[A-Za-z0-9]+/g)) { // if word found in blacklist
                console.log($$)
                skiplength = counter.length;
                return ""; // skip   - found in blacklist arr
            } else if ($$ == "\\par") { // Control word found
                // +1 for the length of `{`
                current_par += rtf.slice(offsets[offsets.length - 1] + 1, idx)

                // if (par_start > -1) {
                //    console.log(rtf.slice(offsets.peak(), idx)) // The text between \par tags
                // }

                // if (!seen_par) {
                //    seen_par = true;
                // }

                par_start = idx; // mark where \\par begins
                skiplength = counter.length; // skip
                //pairs.push($$)

                para_text.push(current_par)
                current_par = ""
            }
        } else if ($$ == "\\par") {
            current_par += rtf.slice(offsets[offsets.length - 1] + 1, idx);
            para_text.push(current_par)
            current_par = ""
        }
    }
    return $$;

 */ 
//# sourceMappingURL=index.js.map