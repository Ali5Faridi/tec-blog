// const express = require('express');
// const cors = require('cors');
// const mongoose = require('mongoose');
// const User = require('./models/User');
// const bcrypt = require('bcryptjs');
// const app = express();
// const jwt = require('jsonwebtoken');
// const dotenv = require('dotenv');
// const cookieParser  = require('body-parser');
// dotenv.config();


// const salt = bcrypt.genSaltSync(10);
// const secret = process.env.SECRET


// app.use(cors({Credentials: true,Origin:'http://localhost:3000'}));
// app.use(express.json());

// mongoose.connect(process.env.MONGO_URI)


// app.post('/register', async (req, res) => {
//     const { username, password } = req.body;
//     try{
//     const userDoc = await User.create({
//         username,
//         password: bcrypt.hashSync(password, salt),
//         });
//     res.json(userDoc);
//     }catch(e){
//         console.log(e);
//         res.status(400).json({e});
//     }
    
//     });
    

// //   login

// app.post('/login', async (req,res) => {
//     const {username,password} = req.body;
//     const userDoc = await User.findOne({username});
//     const passOk = bcrypt.compareSync(password, userDoc.password);
//     if (passOk) {
//       // logged in
//       jwt.sign({username,id:userDoc._id}, secret, {}, (err,token) => {
//         if (err) throw err;
//         res.cookie('token', token).json({
//           id:userDoc._id,
//           username,
//         });
//       });
//     } else {
//       res.status(400).json('wrong credentials');
//     }
//   });
  
//   app.get('/profile', (req,res) => {
//     const {token} = req.cookies;
//     jwt.verify(token, secret, {}, (err,info) => {
//       if (err) throw err;
//       res.json(info);
//     });
//   });
  
//   app.post('/logout', (req,res) => {
//     res.cookie('token', '').json('ok');
//   });

// app.listen(4000);


const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');  // اصلاح: استفاده از cookie-parser
dotenv.config();

const app = express();
const salt = bcrypt.genSaltSync(10);
const secret = process.env.SECRET;

app.use(cors({ credentials: true, origin: 'http://localhost:3000' }));
app.use(express.json());
app.use(cookieParser());  // استفاده از cookie-parser برای خواندن کوکی‌ها

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    const userDoc = await User.create({
      username,
      password: bcrypt.hashSync(password, salt),
    });
    res.json(userDoc);
  } catch (e) {
    console.log(e);
    res.status(400).json({ e });
  }
});

// login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const userDoc = await User.findOne({ username });

  if (!userDoc) {
    return res.status(400).json('User not found');
  }

  const passOk = bcrypt.compareSync(password, userDoc.password);
  if (passOk) {
    // logged in
    jwt.sign({ username, id: userDoc._id }, secret, {}, (err, token) => {
      if (err) throw err;
      res.cookie('token', token, { httpOnly: true }).json({
        id: userDoc._id,
        username,
      });
    });
  } else {
    res.status(400).json('Wrong credentials');
  }
});

app.get('/profile', (req, res) => {
  const { token } = req.cookies;
  if (!token) {
    return res.status(401).json('No token, authorization denied');
  }

  jwt.verify(token, secret, {}, (err, info) => {
    if (err) return res.status(401).json('Invalid token');
    res.json(info);
  });
});

app.post('/logout', (req, res) => {
  res.cookie('token', '', { expires: new Date(0) }).json('ok');
});

app.listen(4000, () => {
  console.log('Server is running on http://localhost:4000');
});
