const TimeStamp = require('./dist/services/timestamp/timestamp')
const mysql = require("mysql")

const createdAt = TimeStamp.TimeStamp.now()
const connection = mysql.createConnection({
  host: '192.168.254.131',
  user: 'remote_user',
  password: 'helloworld143',
  database: 'tbaitest',
})

connection.connect((error) => {
  if (error) {
    console.log(error)
    return
  }
  console.log('successfully connected!')
  // connection.query(
  //   'INSERT INTO users SET ?',
  //   {
  //     name: 'John',
  //     verified_since: null,
  //     role: 'user',
  //     created_at: createdAt,
  //     updated_at: createdAt
  //   },
  //   (error, results, fields) => {
  //     console.log({error})
  //     console.log({results})
  //     console.log({fields})
  //   }
  // )
  connection.query(
    'SELECT * FROM users where id = 1',
    (error, results, fields) => {
      console.log({error})
      console.log(results[0].created_at)
      console.log(typeof results[0].created_at)
      console.log(results[0].updated_at)
      console.log(typeof results[0].updated_at)
      console.log({fields})
    }
  )
  connection.end()
})

connection.on('error', error => {
  console.log(error)
})