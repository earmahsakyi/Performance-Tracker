const express = require('express');
const connectDB = require('./config/db');


const app = express(); 

//Connect database 
connectDB();
  
app.use(express.json({ extended: false}))   

app.get('/', (req, res) => res.json({msg: 'Welcome to Local Service API...'}))

 
//Define Routes 
app.use('/api/auth',require('./routes/auth'));
app.use('/api/student',require('./routes/student'));
app.use('/api/course',require('./routes/course'));


       
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));    