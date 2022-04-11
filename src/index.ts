export { read, readFile } from "./codecs";
export { write_str as to_text } from "./codecs/TXT";
export * from "./types";

const {readFile} = require('./codecs')
readFile('test.docx')
