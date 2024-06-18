const express = require("express");
const app = express();

app.use(express.static('website/pages'));

app.get("/", (req,res) => {
  res.sendFile(__dirname + '/website/pages/index.html');
});

const port = 3000;

app.listen(port, () => {
  console.log(`Express listening at http://0.0.0.0:${port}`);
});
