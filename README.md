This is an extended version of npm package "[word]('https://www.npmjs.com/package/word')" to convert OMML to MathML in docx files.

## Usage
```
const word = require("word-math")

const data = word.readFile("file/path/here.docx")

console.log(data.html)
```