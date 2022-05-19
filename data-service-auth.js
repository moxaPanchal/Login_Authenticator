const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

var userSchema = new mongoose.Schema({
  userName: {
    type: String,
    unique: true,
  },
  password: String,
  email: String,
  loginHistory: [
    {
      dateTime: Date,
      userAgent: String,
    },
  ],
});

let User;
module.exports.initialize = (connectionString) => {
  return new Promise(function (resolve, reject) {
    let db = mongoose.createConnection(
      connectionString
    );

    db.on("error", (err) => {
      reject(err);
    });
    db.once("open", () => {
      User = db.model("users", userSchema);
      resolve();
    });
  });
};

module.exports.registerUser = (userData) => {
  return new Promise((resolve, reject) => {
    if (userData.password !== userData.password2) {
      reject("Passwords do not match");
    } else {
      bcrypt
        .genSalt(10)
        .then((salt) => bcrypt.hash(userData.password, salt))
        .then((hash) => {
          userData.password = hash;

          let newUser = User(userData);
          newUser
            .save()
            .then(() => {
              resolve();
            })
            .catch((err) => {
              if (err.code == 11000) {
                reject("User Name already taken");
              } else if (err.code != 11000) {
                reject(`There was an error creating the user: ${err}`);
              }
            });
        })
        .catch((err) => {
          console.log(err);
        });
    }
  });
};

module.exports.checkUser = (userData) => {
  return new Promise((resolve, reject) => {
    User.find({ userName: userData.userName })
      .then((users) => {
        bcrypt
          .compare(userData.password, users[0].password)
          .then((result) => {
            if (result == true) {
              users[0].loginHistory.push({
                dateTime: new Date().toString(),
                userAgent: userData.userAgent,
              });
              User.updateMany(
                { userName: users[0].userName },
                { $set: { loginHistory: users[0].loginHistory } }
              )
                .exec()
                .then(() => {
                  resolve(users[0]);
                })
                .catch((err) => {
                  reject(`There was an error verifying the user: ${err}`);
                });
            } else {
              reject(`Incorrect Password for user: ${userData.userName}`);
            }
          })
          .catch((err) => {
            reject(`Incorrect Password for user: ${userData.userName}`);
          });
      })
      .catch((err) => {
        reject(`Unable to find user: ${userData.userName}`);
      });
  });
};
