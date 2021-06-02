const express = require('express');
//we just need to require the file, there is no export in passport.js
require('./services/passport');

const app = express();

//we don't need to use extra var (const authRoutes = require('./routes/authRoutes'), and then here authRoutes(app))
require('./routes/authRoutes')(app);

const PORT = process.env.PORT || 5000;
app.listen(PORT);
