// const http = require('http'),
//   url = require('url'),
//   fs = require('fs');

// http
//   .createServer((request, response) => {
//     let addr = request.url,
//       q = new URL(addr, 'http://' + request.headers.host),
//       filePath = '';

//     fs.appendFile(
//       __dirname + '/../log1.txt',
//       'URL: ' + addr + '\nTimestamp: ' + new Date() + '\n\n',
//       (err) => {
//         if (err) {
//           console.log(err);
//         } else {
//           console.log('Added to log.');
//         }
//       }
//     );

//     if (q.pathname.includes('documentation')) {
//       filePath = __dirname + '/../documentation.html';
//     } else {
//       filePath = __dirname + '/../index.html';
//     }

//     fs.readFile(filePath, (err, data) => {
//       if (err) {
//         throw err;
//       }

//       response.writeHead(200, { 'Content-Type': 'text/html' });
//       response.write(data);
//       response.end('Hello Node!\n');
//     });
//   })
//   .listen(8080);
// console.log('My test server is running on Port 8080.');
const http = require('http');
const url = require('url');
const fs = require('fs');

http
  .createServer((request, response) => {
    let addr = request.url;
    let q = new URL(addr, 'http://' + request.headers.host);
    let filePath = '';

    fs.appendFile(
      __dirname + '/../log1.txt',
      'URL: ' + addr + '\nTimestamp: ' + new Date() + '\n\n',
      (err) => {
        if (err) console.log(err);
      }
    );

    if (q.pathname.includes('documentation')) {
      filePath = __dirname + '/../documentation.html';
    } else {
      filePath = __dirname + '/../index.html';
    }

    fs.readFile(filePath, (err, data) => {
      if (err) {
        response.writeHead(404, { 'Content-Type': 'text/plain' });
        return response.end('File not found');
      }

      response.writeHead(200, { 'Content-Type': 'text/html' });
      response.end(data);
    });
  })
  .listen(8080, () => {
    console.log('My test server is running on Port 8080');
  });
