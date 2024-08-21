const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const jwt=require('jsonwebtoken')
const User=require('./models/User')
const cors=require('cors');
const bcrypt=require('bcryptjs')
const cookieParser=require('cookie-parser')
const ws=require('ws');
const Message=require('./models/Message')
dotenv.config();

mongoose.connect(process.env.MONGO_URL)
.then(() => console.log('MongoDB connected'))
.catch((err) => console.error('MongoDB connection error:', err));
const jwtSecret=process.env.JWT_SECRET_KEY;
const app = express();
const bcryptSalt=bcrypt.genSaltSync(10);
app.use(express.json())

app.use(cookieParser())

app.use(cors({
    credentials:true,
    origin:process.env.CLIENT_URL
}))
async function getUserDataFromRequest(req) {
    return new Promise((resolve, reject) => {
      const token = req.cookies?.token;
      if (token) {
        jwt.verify(token, jwtSecret, {}, (err, userData) => {
          if (err) throw err;
          resolve(userData);
        });
      } else {
        reject('no token');
      }
    });
  
  }

app.get('/test', (req, res) => {
  res.json('test ok');
});

app.get('/messages/:userId', async (req,res) => {
    const {userId} = req.params;
    const userData = await getUserDataFromRequest(req);
    const ourUserId = userData.userId;
    const messages = await Message.find({
      sender:{$in:[userId,ourUserId]},
      recipient:{$in:[userId,ourUserId]},
    }).sort({createdAt: 1});
    res.json(messages);
  });

app.get('/profile',(req,res)=>{
    const token=req.cookies?.token;
    if(token){
    jwt.verify(token,jwtSecret,{},(err,userData)=>{
        if(err) throw err;
        console.log(userData)
        res.status(200).json(userData)
    })
}
else {
    res.status(401).json('no token')
}

})

app.post('/register', async (req,res)=>{
    const {username,password}=req.body;
    const hashedPassword=bcrypt.hashSync(password,bcryptSalt);
    try{
   const createdUser= await User.create({username,
    password:hashedPassword});
jwt.sign({userId:createdUser._id,username},jwtSecret,{},(err,token)=>{
    if(err) throw err;
    res.cookie('token',token,{sameSite:'none',secure:true}).status(201).json({id:createdUser._id})
})
    }
    catch(err){
        if(err) throw err;
        res.status(500).json('error')
    }
})

app.post('/login',async (req,res)=>{
    console.log('//')
       const {username,password}=req.body
    const user=await User.findOne({username})
    if(user){
      const passOk=  bcrypt.compareSync(password,user.password)
    if(passOk){
        jwt.sign({userId:user._id,username},jwtSecret,{},(err,token)=>{
            res.cookie('token',token,{sameSite:'none',secure:true}).status(201).json({id:user._id})
        })
    }
    }
})

app.get('/people', async (req,res) => {
    const users = await User.find({}, {'_id':1,username:1});
    res.json(users);
  });  

app.post('/logout', (req,res) => {
    res.cookie('token', '', {sameSite:'none', secure:true}).json('ok');
  });
  

const server=app.listen(4040)
const wss=new ws.WebSocketServer({server})
wss.on('connection',(connection,req)=>{
  function notifyAboutOnlinePeople() {
    [...wss.clients].forEach(client => {
      client.send(JSON.stringify({
        online: [...wss.clients].map(c => ({userId:c.userId,username:c.username})),
      }));
    });
  }
  connection.isAlive = true;

  connection.timer = setInterval(() => {
    connection.ping();
    connection.deathTimer = setTimeout(() => {
      connection.isAlive = false;
      clearInterval(connection.timer);
      connection.terminate();
      notifyAboutOnlinePeople();
      console.log('dead');
    }, 1000);
  }, 5000);

  connection.on('pong', () => {
    clearTimeout(connection.deathTimer);
  });
const cookies=req.headers.cookie;
if(cookies){
    const tokenCookieString=cookies.split(';').find(str=>str.startsWith('token='))
if(tokenCookieString){
    const token=tokenCookieString.split('=')[1];
    if(token){
        jwt.verify(token,jwtSecret,{},(err,userData)=>{
            if(err) throw err;
            const {userId,username}=userData;
            connection.userId=userId;
            connection.username=username;
        })
    }
}
}
connection.on('message',async (message)=>{
    const messageData=JSON.parse(message.toString())
    console.log(messageData)
    const {recipient,text}=messageData;
    if(recipient && text){
     const messageDoc=await   Message.create({
            sender:connection.userId,
            recipient,text
        }
        );
        [...wss.clients].filter(c=>c.userId===recipient).forEach(c=>c.send(JSON.stringify({text,sender:connection.userId,_id:messageDoc._id,recipient})));

    }
});

notifyAboutOnlinePeople();

})


