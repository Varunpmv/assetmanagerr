const csv = require('csv-parser');
const { Readable } = require('stream');

const parseCSV = (buffer) => {
  return new Promise((resolve, reject) => {
    const results = [];
    const content = buffer.toString('utf8').replace(/^\uFEFF/, '');
    Readable.from(content)
      .pipe(csv({
        mapHeaders: ({ header }) => header.trim()
      }))
      .on('data', (data) => results.push(data))
      .on('end', () => {
        resolve(results);
      })
      .on('error', (err) => {
        reject(err);
      });
  });
};

module.exports = { parseCSV };
