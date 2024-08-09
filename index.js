const express = require('express');
const app = express();
const path = require('path');

const podryadRoutes = require('./routes/podryad.routes');
const terminalRoutes = require('./routes/terminal.routes');
const zakupRoutes = require('./routes/zakup.routes');
const svodRoutes = require('./routes/svod.rotes');
const ArchivRoutes = require('./routes/archiv.routes');
const RemontRout = require('./routes/remont.routes');
const KPpartn = require('./routes/kppart.routes');
const Kpc = require('./routes/kpclients.routes');
const Perevoz = require('./routes/perevoz.routes');
const Prodazhi = require('./routes/prodazhi.routes');
const Parser = require('./routes/parser.routes');

const cors = require('cors');
app.use(cors());
app.use(express.json());

app.use(podryadRoutes);
app.use(terminalRoutes);
app.use(zakupRoutes);
app.use(svodRoutes);
app.use(ArchivRoutes);
app.use(RemontRout);
app.use(KPpartn);
app.use(Kpc);
app.use(Perevoz);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(Prodazhi);
app.use(Parser);

app.listen(8080, () => {
    console.log('Server is running on port 8080');
});
