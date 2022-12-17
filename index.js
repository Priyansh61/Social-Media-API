const express=require('express');
var cors = require('cors');
const connection=require('./connect');
const app=express();
const http = require('http');


const apiRoute=require('./routes/api');


app.use(cors());
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use('/api',apiRoute);
const server = http.createServer(app);
server.listen(3000, () => console.log('Server running on port 3000 on railway'));



module.exports=app;