
var express = require("express");
var dataService = require("./data-service.js");
const dataServiceAuth = require("./data-service-auth.js");
const clientSessions = require("client-sessions");
var path = require("path");
var multer = require("multer");
const exphbs = require("express-handlebars");
const fs = require("fs");
var app = express();

var HTTP_PORT = process.env.PORT || 8080;

function onHttpStart() {
  console.log("Express http server listening on: " + HTTP_PORT);
}

app.use(express.static("public"));

app.engine(
  ".hbs",
  exphbs.engine({
    extname: ".hbs",
    defaultLayout: "main",
    helpers: {
      navLink: function (url, options) {
        return (
          "<li" +
          (url == app.locals.activeRoute ? ' class="active" ' : "") +
          '><a href="' +
          url +
          '">' +
          options.fn(this) +
          "</a></li>"
        );
      },

      equal: function (lvalue, rvalue, options) {
        if (arguments.length < 3)
          throw new Error("Handlebars Helper equal needs 2 parameters");
        if (lvalue != rvalue) {
          return options.inverse(this);
        } else {
          return options.fn(this);
        }
      },
    },
  })
);

app.set("view engine", ".hbs");

app.use(
  clientSessions({
    cookieName: "session",
    secret: "web-Assignment-6",
    duration: 2 * 60 * 1000,
    activeDuration: 1000 * 60,
  })
);

app.use(function (req, res, next) {
  res.locals.session = req.session;
  next();
});

function ensureLogin(req, res, next) {
  if (!req.session.user) {
    res.redirect("/login");
  } else {
    next();
  }
}

app.use(function (req, res, next) {
  let route = req.baseUrl + req.path;
  app.locals.activeRoute = route == "/" ? "/" : route.replace(/\/$/, "");
  next();
});

const storage = multer.diskStorage({
  destination: "./public/images/uploaded",
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

app.post("/images/add", ensureLogin, upload.single("imageFile"), (req, res) => {
  res.redirect("/images");
});

app.get("/images", ensureLogin, function (req, res) {
  fs.readdir(
    path.join(__dirname, "./public/images/uploaded"),
    function (err, items) {
      var arr = {
        images: [],
      };
      var i;

      for (i = 0; i < items.length; i++) {
        arr.images.push(items[i]);
      }

      res.render("images", arr);
    }
  );
});

app.use(express.urlencoded({ extended: true }));

app.post("/employees/add", ensureLogin, (req, res) => {
  dataService
    .addEmployee(req.body)
    .then(() => {
      res.redirect("/employees");
    })
    .catch((er) => {
      res.status(500).send("Unable to Update Employee");
    });
});

app.get("/", function (req, res) {
  res.render("home");
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.get("/employees/add", ensureLogin, function (req, res) {
  dataService
    .getDepartments()
    .then(function (information) {
      res.render("addEmployee", { departments: information });
    })
    .catch(function () {
      res.render("addEmployee", { departments: [] });
    });
});

app.get("/images/add", ensureLogin, function (req, res) {
  res.render("addImage");
});

app.get("/employees", ensureLogin, function (req, res) {
  if (req.query.status) {
    dataService
      .getEmployeesByStatus(req.query.status)

      .then((information) => {
        if (information.length > 0) {
          res.render("employees", { employees: information });
        } else {
          res.render("employees", { message: "no results" });
        }
      })
      .catch((er) => {
        res.render({ message: "no results" });
      });
  } else if (req.query.department) {
    dataService
      .getEmployeesByDepartment(req.query.department)

      .then((information) => {
        if (information.length > 0) {
          res.render("employees", { employees: information });
        } else {
          res.render("employees", { message: "no results" });
        }
      })
      .catch((er) => {
        res.render({ message: "no results" });
      });
  } else if (req.query.manager) {
    dataService
      .getEmployeesByManager(req.query.manager)

      .then((information) => {
        if (information.length > 0) {
          res.render("employees", { employees: information });
        } else {
          res.render("employees", { message: "no results" });
        }
      })
      .catch((er) => {
        res.render({ message: "no results" });
      });
  } else {
    dataService
      .getAllEmployees()

      .then((information) => {
        console.log("get all employees from JSON file.");
        if (information.length > 0) {
          res.render("employees", { employees: information });
        } else {
          res.render("employees", { message: "no results" });
        }
      })
      .catch((er) => {
        console.log(er);
        res.render({ message: "no results" });
      });
  }
});

app.post("/employee/update", ensureLogin, (req, res) => {
  dataService
    .updateEmployee(req.body)
    .then(() => {
      res.redirect("/employees");
    })
    .catch((er) => {
      console.log(er);
    });
});

app.get("/employee/:empNum", ensureLogin, (req, res) => {
  let viewData = {};

  dataService
    .getEmployeeByNum(req.params.empNum)
    .then((data) => {
      if (data) {
        viewData.employee = data;
      } else {
        viewData.employee = null;
      }
    })
    .catch(() => {
      viewData.employee = null;
    })
    .then(dataService.getDepartments)
    .then((data) => {
      viewData.departments = data;

      for (let i = 0; i < viewData.departments.length; i++) {
        if (
          viewData.departments[i].departmentId == viewData.employee.department
        ) {
          viewData.departments[i].selected = true;
        }
      }
    })
    .catch(() => {
      viewData.departments = [];
    })
    .then(() => {
      if (viewData.employee == null) {
        res.status(404).send("Employee Not Found");
      } else {
        res.render("employee", { viewData: viewData });
      }
    });
});

app.get("/employees/delete/:empNum", ensureLogin, (req, res) => {
  dataService
    .deleteEmployeeByNum(req.params.empNum)
    .then((information) => {
      res.redirect("/employees");
    })
    .catch((er) => {
      res.status(500).send("Unable to Remove Employee / Employee not found");
    });
});

app.get("/departments", ensureLogin, function (req, res) {
  dataService
    .getDepartments()

    .then((information) => {
      console.log("get all departments from JSON file.");

      if (information.length > 0) {
        res.render("departments", { departments: information });
      } else {
        res.render("departments", { message: "no results" });
      }
    })
    .catch((er) => {
      console.log(er);
      res.render({ message: "no results" });
    });
});

app.get("/departments/add", ensureLogin, (req, res) => {
  res.render("addDepartment");
});

app.post("/departments/add", ensureLogin, (req, res) => {
  dataService
    .addDepartment(req.body)
    .then(() => {
      res.redirect("/departments");
    })
    .catch((er) => {
      console.log(er);
    });
});

app.get("/department/:departmentId", ensureLogin, (req, res) => {
  dataService
    .getDepartmentById(req.params.departmentId)
    .then((information) => {
      if (information.length > 0) {
        res.render("department", { department: information });
      } else {
        res.status(404).send("Department Not Found");
      }
    })
    .catch((er) => {
      res.status(404).send("Department Not Found");
    });
});

app.get("/departments/delete/:departmentId", ensureLogin, (req, res) => {
  dataService
    .deleteDepartmentById(req.params.departmentId)
    .then(() => {
      res.redirect("/departments");
    })
    .catch((er) => {
      res
        .status(500)
        .send("Unable to Remove Department / Department not found");
    });
});

app.post("/department/update", ensureLogin, (req, res) => {
  dataService
    .updateDepartment(req.body)
    .then(() => {
      res.redirect("/departments");
    })
    .catch((er) => {
      res.status(500).send("Unable to Update Department");
    });
});

app.get("/login", function (req, res) {
  res.render("login");
});

app.get("/register", function (req, res) {
  res.render("register");
});

app.post("/register", function (req, res) {
  dataServiceAuth
    .registerUser(req.body)
    .then(() => res.render("register", { successMessage: "User created" }))
    .catch((err) =>
      res.render("register", { errorMessage: err, userName: req.body.userName })
    );
});

app.post("/login", function (req, res) {
  req.body.userAgent = req.get("User-Agent");

  dataServiceAuth
    .checkUser(req.body)
    .then((user) => {
      req.session.user = {
        userName: user.userName,
        email: user.email,
        loginHistory: user.loginHistory,
      };

      res.redirect("/employees");
    })
    .catch((err) => {
      res.render("login", { errorMessage: err, userName: req.body.userName });
    });
});

app.get("/logout", function (req, res) {
  req.session.reset();
  res.redirect("/");
});

app.get("/userHistory", ensureLogin, function (req, res) {
  res.render("userHistory");
});

app.use(function (req, res) {
  res.status(404).sendFile(path.join(__dirname, "/views/error.html"));
});

dataService
  .initialize()
  .then(dataServiceAuth.initialize)
  .then(function () {
    app.listen(HTTP_PORT, function () {
      console.log("app listening on: " + HTTP_PORT);
    });
  })
  .catch(function (err) {
    console.log("unable to start server: " + err);
  });
