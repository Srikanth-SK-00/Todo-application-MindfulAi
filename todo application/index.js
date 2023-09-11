var express = require("express");
const jwt = require("jsonwebtoken");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const app = express();
app.use(bodyParser.json());
const sqldb = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "srikanth",
  database: "ecoms",
});
sqldb.connect((err) => {
  if (err) {
    console.error(err);
  } else {
    console.log("Connection established");
  }
});
const secretKey = "MindfullAi";
const verifyToken = (req, res, next) => {
  const token = req.header("Authorization");
  if (!token) {
    return res.status(401).json({ error: "Authorization Token not provided." });
  }
  try {
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: "Invalid Authorization Token." });
  }
};

app.post("/login", async (req, res) => {
  const Email = req.body.email;
  const password = req.body.password;
  const query = "SELECT * FROM user WHERE email = ?";
  sqldb.query(query, [Email], (error, results) => {
    if (error) {
      console.error("Error executing the query:", error);
      return;
    }
    if (results.length === 1) {
      const user = results[0];
      if (user.password === password) {
        const token = jwt.sign(
          {
            Email
          },
          "srikrishnacollege",
          { expiresIn: "1h" }
        );
        accessToken = token;
        return res.status(200).json({
          token_type: "Bearer",
          access_token: accessToken,
          expires_in: Math.floor(Date.now() / 1000) + 3600,
          status: "login  sucess "
        })
      } else {
        res.send("Invalid  password.")
        console.log("Invalid  password.");
      }
    } else {
      res.send("Invalid username")
      console.log("Invalid username ");
    }
  });
}).listen(3000);
app.post("/signup", function (req, res) {

  const Email = req.body.email;
  const password = req.body.password;
  const query = "SELECT * FROM user WHERE email = ?";
  sqldb.query(query, [Email], (error, results) => {
    if (error) {
      console.error("Error executing the query:", error);
      return;
    }

    if (results[0] == null) {
      sqldb.query(
        "INSERT INTO user(email,password) VALUES ( ?, ?)",
        [
          Email, password
        ],
        async (err) => {
          if (err) throw err;
          console.log("user added successfully");
          res.send("user added successfully")
        })
    }
    else {
      res.send("email already used")
    }
  })

})
app.post("/addtask/:userid", function (req, res) {
  userid = req.params.userid;
  tasktitle = req.body.title;
  tasktype = req.body.type;
  console.log(tasktitle, tasktype)
  sqldb.query(
    "INSERT INTO task(userid,usertask,tasktype) VALUES (?, ?, ?)",
    [
      userid, tasktitle, tasktype
    ],
    async (err) => {
      if (err) throw err;
      console.log("task added successfully");
      res.send("task added successfully")
    })
});

app.get("/gettask/:userid", function (req, res) {
  userid = req.params.userid;
  const query = "SELECT * FROM task WHERE userid = ?";
  sqldb.query(query, [userid], (error, results) => {
    if (error) {
      console.error("Error executing the query:", error);
      return;
    }
    console.log(results)
    res.send(results)
  })
})

app.put("/edittask/:taskid", function (req, res) {
  id = req.params.taskid;
  tasktitle = req.body.title;
  tasktype = req.body.type;
  const updateQuery =
    "UPDATE task SET usertask = ?, tasktype = ? WHERE taskid = ?";
  const values = [
    tasktitle,
    tasktype,
    id
  ];
  sqldb.query(updateQuery, values, function (err) {

    if (err) throw err;
    res.send("success");

  })


})

app.delete("/deletetask/:taskid", function (req, res) {
  id = req.params.taskid;
  const c = `DELETE FROM task WHERE taskid=?`;
  sqldb.query(c, [id], function (err) {
    if (err) throw err;
    res.send("task deleted successfully")
  });
})

