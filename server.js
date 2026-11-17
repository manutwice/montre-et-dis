// Sert montre-et-dis.html sur http://localhost:4777 (le navigateur retient alors micro et dossier).
const http = require('http'), fs = require('fs'), path = require('path');
http.createServer((req, res) => {
  fs.readFile(path.join(__dirname, 'montre-et-dis.html'), (err, data) => {
    res.writeHead(err ? 404 : 200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(err ? 'montre-et-dis.html introuvable' : data);
  });
}).listen(4777, '127.0.0.1', () => console.log('Montre et dis : http://localhost:4777  (Ctrl+C pour arreter)'));
