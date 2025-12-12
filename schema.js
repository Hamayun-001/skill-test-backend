import gql from "graphql-tag";
import { employees, users } from "./data.js";
import { generateToken } from "./auth.js";

export const typeDefs = gql`
  enum Role {
    ADMIN
    EMPLOYEE
  }

  type Attendance {
    id: Int!
    date: String!
    status: String!
  }

  type Employee {
    id: Int!
    name: String!
    age: Int!
    class: String
    subjects: [String!]!
    attendance: [Attendance!]!
  }

  type PaginatedEmployees {
    data: [Employee!]!
    total: Int!
    page: Int!
    limit: Int!
  }

  type Query {
    employees(
      page: Int
      limit: Int
      sortBy: String
      sortOrder: String
      name: String
    ): PaginatedEmployees!

    employee(id: Int!): Employee

    me: User
  }

  type User {
    id: Int!
    username: String!
    role: Role!
  }

  type Mutation {
    login(username: String!, password: String!): String!

    addEmployee(
      name: String!
      age: Int!
      class: String
      subjects: [String!]!
    ): Employee!

    updateEmployee(
      id: Int!
      name: String
      age: Int
      class: String
      subjects: [String!]
    ): Employee!
  }
`;

export const resolvers = {
  Query: {
    employees: (_, args) => {
      let filtered = employees;

      if (args.name) {
        filtered = filtered.filter((e) =>
          e.name.toLowerCase().includes(args.name.toLowerCase())
        );
      }

      // Sorting
      if (args.sortBy) {
        filtered = filtered.sort((a, b) => {
          const valA = a[args.sortBy];
          const valB = b[args.sortBy];
          return args.sortOrder === "DESC"
            ? valA < valB
              ? 1
              : -1
            : valA > valB
            ? 1
            : -1;
        });
      }

      const page = args.page || 1;
      const limit = args.limit || 5;
      const start = (page - 1) * limit;

      return {
        data: filtered.slice(start, start + limit),
        total: filtered.length,
        page,
        limit,
      };
    },

    employee: (_, { id }) => employees.find((e) => e.id == id),

    me: (_, __, { user }) => user,
  },

  Mutation: {
    login: (_, { username, password }) => {
      const user = users.find(
        (u) => u.username === username && u.password === password
      );

      if (!user) throw new Error("Invalid credentials");

      return generateToken(user);
    },

    addEmployee: (_, args, { user }) => {
      if (user.role !== "ADMIN")
        throw new Error("Only admin can add employees");

      const newEmp = {
        id: employees.length + 1,
        attendance: [],
        ...args,
      };

      employees.push(newEmp);
      return newEmp;
    },

    updateEmployee: (_, args, { user }) => {
      if (user.role !== "ADMIN")
        throw new Error("Only admin can update employees");

      const emp = employees.find((e) => e.id === args.id);
      if (!emp) throw new Error("Employee not found");

      Object.assign(emp, args);
      return emp;
    },
  },
};
