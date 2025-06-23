const express = require('express');
const cors = require('cors');
const multer = require('multer');
app = express();
const upload = multer();

app.use(cors({origin:"*"}));

app.use(express.urlencoded({ extended: true }));


app.post("/login", upload.none(),(req,res)=>{
  console.log(req.body);
  res.status(200).json({msg :"ok"});
})

app.get("/",(req,res)=>{
  res.send("ok");
})

app.listen(3000,()=>{
  console.log("ok @ 3000");
})