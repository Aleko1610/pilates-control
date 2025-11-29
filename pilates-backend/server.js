const express = require('express');
const cors = require('cors');
const crearTablas = require('./models/crearTablas');

const alumnosRoutes = require('./routes/alumnos');
const planesRoutes = require('./routes/planes');
const suscripcionesRoutes = require('./routes/suscripciones');
const clasesRoutes = require('./routes/clases');
const reservasRoutes = require('./routes/reservas');

const app = express();
app.use(cors());
app.use(express.json());

crearTablas();

app.use('/alumnos', alumnosRoutes);
app.use('/planes', planesRoutes);
app.use('/suscripciones', suscripcionesRoutes);
app.use('/clases', clasesRoutes);
app.use('/reservas', reservasRoutes);

const PORT = 3001;
app.listen(PORT, () => console.log(`Servidor funcionando en puerto ${PORT}`));
