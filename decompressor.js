
import  * as zlib  from 'node:zlib';
import { Buffer } from "buffer";
import fs from "fs";
const b64 = fs.readFileSync('bp.b64', 'utf-8');
(function() {
  // Decode the base64 string and decompress the data
  const compressedData = b64.substring(1);
  const compressedBuffer = Buffer.from(compressedData, 'base64');
  const decompressedBuffer = zlib.inflateSync(compressedBuffer, { level: 9 });
  const decompressedData = decompressedBuffer.toString('utf-8');
  // save the decompressed data to a file
  fs.writeFileSync('decompressedData.json', decompressedData);
})();