const express = require('express');
const app = express();
const port = 3002;
app.use(express.json());

//connect to mongodb
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://danial:779hRsy0RVMRRRlP@gulag0.ij0pzbn.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

client.connect().then(res => {
  console.log(res);
});

//admin configuration
app.post('/login/admin', (req, res) => {
  console.log(req.body);
  login(req.body.username, req.body.password)
    .then(result => {
      if (result.message === 'Correct password') {
        const token = generateToken({ username: req.body.username });
        res.send({ message: 'Successful login', token });
      } else {
        res.send('Login unsuccessful');
      }
    })
    .catch(error => {
      console.error(error);
      res.status(500).send("Internal Server Error");
    });
});

async function login(reqUsername, reqPassword) {
  let matchUser = await client.db('cybercafe').collection('admin').findOne({ username: { $eq: reqUsername } });

  if (!matchUser)
    return { message: "User not found!" };

  if (matchUser.password === reqPassword)
    return { message: "Correct password", user: matchUser };
  else
    return { message: "Invalid password" };
}

//customer configuration
app.get('/view/customer/admin', verifyToken, async (req, res) => {
  try {
    const result = await client
      .db('cybercafe')
      .collection('customer')
      .find()
      .toArray();

    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

app.post('/create/customer/admin', verifyToken, async (req, res) => {
  let result = createcustomer(
    req.body.customername,
    req.body.idproof
  ); 
  res.send(result);
});

app.delete('/delete/customer/:idproof', verifyToken, async (req, res) => {
  const idproof = req.params.idproof;

  try {
    const deletecustomerResult = await client
      .db('cybercafe')
      .collection('customer')
      .deleteOne({ idproof: idproof});

    if (deletecustomerResult.deletedCount === 0) {
      return res.status(404).send('customer not found or unauthorized');
    }

    res.send('customer deleted successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});
app.put('/update/customer/:idproof', verifyToken, async (req, res) => {
  const idproof = req.params.idproof;
  const { cabinno, entrytime, payment, timespend} = req.body;
  

  try {
    const updatecustomerResult = await client
      .db('cybercafe').collection('customer').updateOne({idproof},
        { $set: { cabinno, entrytime, payment, timespend} }
      );

    if (updatecustomerResult.modifiedCount === 0) {
      return res.status(404).send('customer not found or unauthorized');
    }

    res.send('customer updated successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});


function createcustomer(reqcustomername, reqidproof, reqentrytime = 0, reqcabin = 0, reqpayment = 0, reqtimespend = 0) {
client.db('cybercafe').collection('customer').insertOne({
    "customername": reqcustomername,
    "idproof": reqidproof,
    "cabinno": reqcabin,
    "entrytime": reqentrytime,
    "payment": reqpayment,
    "timespend": reqtimespend
  });
  return "customer created";
}
//computer configuration
function createcomputer(reqcomputername, reqcabinno, reqLanportno, reqsystemworking, reqAvailable) {
  client.db('configure').collection('computer').insertOne({

      "computername": reqcomputername,
      "cabinno": reqcabinno,
      "lanportno": reqLanportno,
      "systemworking": reqsystemworking,
      "available": reqAvailable
    });
    return "computer added";
  }
  app.post('/create/computer/admin', verifyToken, async (req, res) => {
    let result = createcomputer(
      req.body.computername,
      req.body.cabinno,
      req.body.lanportno,
      req.body.systemworking,
      req.body.available
    ); 
    res.send(result);
  });

  app.get('/view/computer/admin', verifyToken, async (req, res) => {
    try {
      const result = await client
      .db('configure').collection('computer').find().toArray();
  
      res.send(result);
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  });

  app.delete('/delete/computer/:computername', verifyToken, async (req, res) => {
    const computername = req.params.computername;
  
    try {
      const deletecomputerResult = await client
        .db('configure')
        .collection('computer')
        .deleteOne({ computername:computername});
  
      if (deletecomputerResult.deletedCount === 0) {
        return res.status(404).send('computer not found or unauthorized');
      }
  
      res.send('computer deleted successfully');
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  });
  app.put('/update/computer/:computername', verifyToken, async (req, res) => {
    const computername = req.params.computername;
    const { lanportno,systemworking,available} = req.body;
  
    try {
      const updatecomputerResult = await client
        .db('configure')
        .collection('computer')
        .updateOne({computername},
          { $set: { lanportno, systemworking, available}});
  
      if (updatecomputerResult.modifiedCount === 0) {
        return res.status(404).send('computer not found or unauthorized');
      }
  
      res.send('computer updated successfully');
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  });
//token function
const jwt = require('jsonwebtoken');

function generateToken(userData) {
  const token = jwt.sign(
    userData,
    'password',
    {expiresIn: 600}
  );

  console.log(token);
  return token;
}

function verifyToken(req, res, next) {
  let header = req.headers.authorization;
  if (!header) {
    res.status(401).send('Unauthorized');
    return;
  }

  let token = header.split(' ')[1];

  jwt.verify(token, 'password', function (err, decoded) {
    if (err) {
      res.status(401).send('Unauthorized');
      return;
    }
    req.admin = decoded;
    next();
  });
}

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

app.post('/create/customer/admin', verifyToken, async (req, res) => {
  let result = createcustomer(
    req.body.customername,
    req.body.idproof
  ); 
  res.send(result);
});

app.post('/add/sensor',async(req,res)=>{
  let result = addsensor(
    req.body.sensor,
    req.body.date,
    req.body.time,
    req.body.value,
    req.body.id,
    req.body.name
  );
  res.send(result) 
});

function addsensor(reqsensor, reqdate, reqtime, reqvalue, reqname, reqidproof) {
  client.db().collection().insertMany({
      "sensor": reqsensor,
      "date": reqdate,
      "time": reqtime,
      "value": reqvalue,
      "name": reqname,
      "id": reqidproof

    });
    return "sensor added";
  }

app.patch('/update/value/:id',async(req,res)=>{
  const search = req.params.id;
  const value = req.body.value;
  await client.db().collection().updateOne({id: search},{$set:value});
}) 
