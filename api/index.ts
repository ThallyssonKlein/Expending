const express = require('express')

const app = express()
app.use(express.json())

const generateRoutes = require('./generate-routes');

generateRoutes(app)

app.get('/ping', (req: any, res: any) => {
    res.json({res: 'pong'})
})

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});
