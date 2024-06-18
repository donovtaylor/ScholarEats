const express = require("express");
const app = express();

//this is so images will load in our website
app.use(express.static('website/pages'));

//serve the about page
app.get("/", (req,res) => {
  res.sendFile(__dirname + '/website/pages/index.html');
});

const port = 3000;

app.listen(port, () => {
  console.log(`Express listening at http://0.0.0.0:${port}`);
});
