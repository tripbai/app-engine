const TimeStampModule = require('./dist/kernel/helpers/timestamp')
const PseudoRandomModule = require('./dist/kernel/helpers/pseudorandom')
const SessionDBModule= require('./dist/kernel/services/database/sessiondb/sessiondb')
// const mysql = require("mysql")
const RepoModule = require('./dist/kernel/orm/tests/users/test-user.repository')


const userId1 = PseudoRandomModule.Pseudorandom.alphanum32()
const TestUserRepo1 = new RepoModule.TestUserRepository(userId1)
const DbClient1 = new SessionDBModule.SessionDBClient()
TestUserRepo1.setDatabaseProvider(DbClient1)

const userId2 = PseudoRandomModule.Pseudorandom.alphanum32()
const TestUserRepo2 = new RepoModule.TestUserRepository(userId2)
const DbClient2 = new SessionDBModule.SessionDBClient()
TestUserRepo2.setDatabaseProvider(DbClient2)


const users1db = {}
users1db[userId1] = {
  entity_id: userId1, 
  created_at: TimeStampModule.TimeStamp.now(), 
  updated_at: TimeStampModule.TimeStamp.now(),
  age: 23,
  archived_at: null,
  is_verified: true,
  metadata: `{"citizenship":"Filipino"}`,
  first_name: 'Ken'
}
DbClient1.import({users: users1db})

const users2db = {}
users2db[userId2] = {
  entity_id: userId2, 
  created_at: TimeStampModule.TimeStamp.now(), 
  updated_at: TimeStampModule.TimeStamp.now(),
  age: 35,
  archived_at: null,
  is_verified: false,
  metadata: `{"citizenship":"American"}`,
  first_name: 'Vance'
}
DbClient2.import({users: users2db})



TestUserRepo1.get().then(TestUser1 => {
  console.log(TestUser1)
})
TestUserRepo2.get().then(TestUser2 => {
  console.log(TestUser2)
})
// const createdAt = TimeStamp.TimeStamp.now()
// const connection = mysql.createConnection({
//   host: '192.168.254.131',
//   user: 'remote_user',
//   password: 'helloworld143',
//   database: 'tbaitest',
// })

// connection.connect((error) => {
//   if (error) {
//     console.log(error)
//     return
//   }
//   console.log('successfully connected!')
//   // connection.query(
//   //   'INSERT INTO users SET ?',
//   //   {
//   //     name: 'John',
//   //     verified_since: null,
//   //     role: 'user',
//   //     created_at: createdAt,
//   //     updated_at: createdAt
//   //   },
//   //   (error, results, fields) => {
//   //     console.log({error})
//   //     console.log({results})
//   //     console.log({fields})
//   //   }
//   // )
//   connection.query(
//     'SELECT * FROM users where id = 1',
//     (error, results, fields) => {
//       console.log({error})
//       console.log(results[0].created_at)
//       console.log(typeof results[0].created_at)
//       console.log(results[0].updated_at)
//       console.log(typeof results[0].updated_at)
//       console.log({fields})
//     }
//   )
//   connection.end()
// })

// connection.on('error', error => {
//   console.log(error)
// })