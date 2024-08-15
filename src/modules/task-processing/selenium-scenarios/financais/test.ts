// base64 str = 'UEsDBBQACAgIAFGxDVkAAAAAAAAAAAAAAAAZAAAAZHBpdmEtMjQwNlQtMzE1MzAwNzUyLnhtbI1U23LaMBB9Jl/B+L3Y4GBKRyhDEzKTmbZpCfmAjaUQdWytI8mG5usr+QK+MJ2+yeeyu9pdmdwc02RccKUFypU3nQTemMsYmZD7lfe8u//02RtrA5JBgpKvvD9cezf0irBMFDC2ZqlX3psx2RffPxwOEzCTPRaTzPg6fuMpaL9UeuccQeTRqxFRqA3aw4hAlitIuaw+R+TFfOVSP292aCChAfG7QK3ZwRF+oEotMp0vwyAohS200ZWmtuQcxRa23kij+B4UDeez5WxK/A54km15nGdcWSioJGeg0fSq7iGN6o6z3IiCJ2vJj6i3bf1lbuB8SPFFJOIDGNJFtIy63jY7sD7mxjaezheLsOuqiYGhbl94HS27hm5t91Cg2thFYVgRYRSFy+pWA65jesp//wStRYH9VBfpxtsadCtVf/yGp49uSDFyvWbvuVB2zfgtpt/E+0OalSsYzIj/Pzq3qn53VwnjmssCk0K09te4Qn/lwBQG0dqNtoeUkS5YiZAiFnUUkHjH4wRsUYB0FsyubfYOVsky5QIZzB1jlxIyYfIE7IyAvkKiuSv6H5oqij0KBramentACdAn/2W2dCYYg1s2W9ATZ5zaB9SHSp0UrzSczu0jXMxtw91niduuC2TtawXRjvhDuFIr+ECXozo0My6fy3Ydo71nU3Qf7mpvURoh3ZAH+hbV9Xy3HRAKBoYGL8d6GiHx6z8cqf6A9C9QSwcIvV46yx0CAABrBQAAUEsBAhQAFAAICAgAUbENWb1eOssdAgAAawUAABkAAAAAAAAAAAAAAAAAAAAAAGRwaXZhLTI0MDZULTMxNTMwMDc1Mi54bWxQSwUGAAAAAAEAAQBHAAAAZAIAAAAA';

const base64Str =
  'UEsDBBQACAgIAFGxDVkAAAAAAAAAAAAAAAAZAAAAZHBpdmEtMjQwNlQtMzE1MzAwNzUyLnhtbI1U23LaMBB9Jl/B+L3Y4GBKRyhDEzKTmbZpCfmAjaUQdWytI8mG5usr+QK+MJ2+yeeyu9pdmdwc02RccKUFypU3nQTemMsYmZD7lfe8u//02RtrA5JBgpKvvD9cezf0irBMFDC2ZqlX3psx2RffPxwOEzCTPRaTzPg6fuMpaL9UeuccQeTRqxFRqA3aw4hAlitIuaw+R+TFfOVSP292aCChAfG7QK3ZwRF+oEotMp0vwyAohS200ZWmtuQcxRa23kij+B4UDeez5WxK/A54km15nGdcWSioJGeg0fSq7iGN6o6z3IiCJ2vJj6i3bf1lbuB8SPFFJOIDGNJFtIy63jY7sD7mxjaezheLsOuqiYGhbl94HS27hm5t91Cg2thFYVgRYRSFy+pWA65jesp//wStRYH9VBfpxtsadCtVf/yGp49uSDFyvWbvuVB2zfgtpt/E+0OalSsYzIj/Pzq3qn53VwnjmssCk0K09te4Qn/lwBQG0dqNtoeUkS5YiZAiFnUUkHjH4wRsUYB0FsyubfYOVsky5QIZzB1jlxIyYfIE7IyAvkKiuSv6H5oqij0KBramentACdAn/2W2dCYYg1s2W9ATZ5zaB9SHSp0UrzSczu0jXMxtw91niduuC2TtawXRjvhDuFIr+ECXozo0My6fy3Ydo71nU3Qf7mpvURoh3ZAH+hbV9Xy3HRAKBoYGL8d6GiHx6z8cqf6A9C9QSwcIvV46yx0CAABrBQAAUEsBAhQAFAAICAgAUbENWb1eOssdAgAAawUAABkAAAAAAAAAAAAAAAAAAAAAAGRwaXZhLTI0MDZULTMxNTMwMDc1Mi54bWxQSwUGAAAAAAEAAQBHAAAAZAIAAAAA';
import jszip from 'jszip';
// convert it to readabavle string, original file is xml zipped!!
const main = async () => {
  const fileName = 'dpiva-2406T-315300752.xml';
  const loadedContent = await jszip.loadAsync(base64Str, { base64: true })

  const resultStr = await loadedContent.files[fileName].async('text');
  console.log(resultStr);
};

main();

// import * as fs from 'fs';
// import * as path from 'path';
// import JSZip from 'jszip';

// fs.mkdirSync(targetDirectory, { recursive: true });
// const zipFilePath = path.join(targetDirectory, `${fileName}.zip`);
// fs.writeFileSync(zipFilePath, Buffer.from(base64Content, 'base64'));

// const zipData = fs.readFileSync(zipFilePath);
// await JSZip.loadAsync(zipData)
//   .then((zip) => {
//     // Iterate through each file in the zip archive
//     Object.keys(zip.files).forEach(async (fileName) => {
//       const fileData = await zip.files[fileName].async('nodebuffer');
//       fs.writeFileSync(`${targetDirectory}/${fileName}`, fileData);
//       console.log(`File extracted: ${fileName}`);
//     });
//   })
//   .catch((error) => {
//     console.error('Error unzipping file:', error);
//   });
