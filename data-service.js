const Sequelize = require("sequelize");
var sequelize = new Sequelize(
  "dbcvuop1cac3c4",
  "scikcsmujqcyhw",
  "bd60a2fde4582b05308146552bbf89b7e557f30ef5835eac90b4a07aa20f1b57",
  {
    host: "ec2-52-3-2-245.compute-1.amazonaws.com",
    dialect: "postgres",
    port: 5432,
    dialectOptions: {
      ssl: { rejectUnauthorized: false },
    },

    query: { raw: true },
  }
);

sequelize
  .authenticate()
  .then(function () {
    console.log("Connection has been established successfully.");
  })
  .catch(function (err) {
    console.log("Unable to connect to the database:", err);
  });

var Employee = sequelize.define(
  "Employee",
  {
    employeeNum: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    firstName: Sequelize.STRING,
    lastName: Sequelize.STRING,
    email: Sequelize.STRING,
    SSN: Sequelize.STRING,
    addressStreet: Sequelize.STRING,
    addressCity: Sequelize.STRING,
    addressState: Sequelize.STRING,
    addressPostal: Sequelize.STRING,
    maritalStatus: Sequelize.STRING,
    isManager: Sequelize.BOOLEAN,
    employeeManagerNum: Sequelize.INTEGER,
    status: Sequelize.STRING,
    hireDate: Sequelize.STRING,
    department: Sequelize.INTEGER,
  },

  {
    createdAt: false,
    updatedAt: false,
  }
);

var Department = sequelize.define(
  "Department",
  {
    departmentId: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    departmentName: Sequelize.STRING,
  },

  {
    createdAt: false,
    updatedAt: false,
  }
);

Department.hasMany(Employee, { foreignKey: "department" });

module.exports.addEmployee = function (employeeData) {
  employeeData.isManager = employeeData.isManager ? true : false;

  for (let i in employeeData) {
    if (employeeData[i] == "") {
      employeeData[i] = null;
    }
  }

  return new Promise((resolve, reject) => {
    Employee.create(employeeData)
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        reject("unable to create employee");
      });
  });
};

module.exports.initialize = function () {
  return new Promise(function (resolve, reject) {
    sequelize
      .sync()
      .then(function () {
        console.log("Connection established successfully.");
        resolve();
      })
      .catch(function (err) {
        reject("unable to sync the database");
      });
  });
};

module.exports.getEmployeesByStatus = function (status) {
  return new Promise((resolve, reject) => {
    Employee.findAll({
      where: {
        status: status,
      },
    })
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        reject("no results returned");
      });
  });
};

module.exports.getEmployeesByDepartment = function (department) {
  return new Promise((resolve, reject) => {
    Employee.findAll({
      where: {
        department: department,
      },
    })
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        reject("no results returned");
      });
  });
};

module.exports.getEmployeesByManager = function (manager) {
  return new Promise((resolve, reject) => {
    Employee.findAll({
      where: {
        employeeManagerNum: manager,
      },
    })
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        reject("no results returned");
      });
  });
};

module.exports.getEmployeeByNum = function (num) {
  return new Promise((resolve, reject) => {
    Employee.findAll({
      where: {
        employeeNum: num,
      },
    })
      .then((data) => {
        resolve(data[0]);
      })
      .catch((err) => {
        reject("no results returned");
      });
  });
};

module.exports.getAllEmployees = function () {
  return new Promise((resolve, reject) => {
    Employee.findAll()
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        reject("no results returned");
      });
  });
};

module.exports.getDepartments = function () {
  return new Promise((resolve, reject) => {
    Department.findAll()
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        reject("no results returned");
      });
  });
};

module.exports.updateEmployee = function (employeeData) {
  employeeData.isManager = employeeData.isManager ? true : false;

  for (let i in employeeData) {
    if (employeeData[i] == "") {
      employeeData[i] = null;
    }
  }

  return new Promise((resolve, reject) => {
    Employee.update(
      {
        firstName: employeeData.firstName,
        lastName: employeeData.lastName,
        email: employeeData.email,
        SSN: employeeData.SSN,
        addressStreet: employeeData.addressStreet,
        addresCity: employeeData.addresCity,
        addressState: employeeData.addressState,
        addressPostal: employeeData.addressPostal,
        maritalStatus: employeeData.maritalStatus,
        isManager: employeeData.isManager,
        employeeManagerNum: employeeData.employeeManagerNum,
        status: employeeData.status,
        department: employeeData.department,
        hireDate: employeeData.hireDate,
      },
      {
        where: {
          employeeNum: employeeData.employeeNum,
        },
      }
    )
      .then(() => {
        resolve();
      })
      .catch((err) => {
        reject("unable to update employee");
      });
  });
};

module.exports.addDepartment = function (departmentData) {
  for (let i in departmentData) {
    if (departmentData[i] == "") {
      departmentData[i] = null;
    }
  }

  return new Promise((resolve, reject) => {
    Department.create({
      departmentName: departmentData.departmentName,
    })
      .then(() => {
        resolve();
      })
      .catch((err) => {
        reject("unable to create department");
      });
  });
};

module.exports.updateDepartment = function (departmentData) {
  for (let i in departmentData) {
    if (departmentData[i] == "") {
      departmentData[i] = null;
    }
  }

  return new Promise((resolve, reject) => {
    Department.update(
      {
        departmentName: departmentData.departmentName,
      },
      {
        where: {
          departmentId: departmentData.departmentId,
        },
      }
    )
      .then(() => {
        resolve();
      })
      .catch((err) => {
        reject("unable to update department");
      });
  });
};

module.exports.getDepartmentById = function (id) {
  return new Promise((resolve, reject) => {
    Department.findAll({
      where: {
        departmentId: id,
      },
    })
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        reject("no results returned");
      });
  });
};

module.exports.deleteDepartmentById = (id) => {
  return new Promise((resolve, reject) => {
    Department.destroy({
      where: {
        departmentId: id,
      },
    })
      .then(() => {
        resolve();
      })
      .catch((err) => {
        reject("Unable to delete department");
      });
  });
};

module.exports.deleteEmployeeByNum = (empNum) => {
  return new Promise((resolve, reject) => {
    Employee.destroy({
      where: {
        employeeNum: empNum,
      },
    })
      .then(() => {
        resolve();
      })
      .catch((err) => {
        reject("Unable to delete employee");
      });
  });
};
