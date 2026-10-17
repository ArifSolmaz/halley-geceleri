/* Film is the primary experience. The former reading prototype is archived. */
require('./build_cinema_docs.cjs');
require('node:fs').copyFileSync(require('node:path').join(__dirname,'../film.html'),require('node:path').join(__dirname,'../index.html'));
