import {gql} from 'apollo-server'
import {paginate} from "./connection/mongo-connection";
import {findByUsernameQuery, addUserToProject, changeRole, createProject} from "./dal/project";
import {getUser} from "./dal/user";

const typeDefs = gql`
    enum Role {
        INSTRUCTOR
        ADMIN
        MEMBER
    }
    
    type User {
        username: String!
    }
    
    type UserRole {
        user: User!
        role: Role!
    }
    
    type Project {
        id: ID!
        name: String!
        userRoles: [UserRole!]!
        role: Role!
    }
    
    type ProjectConnection {
        items: [Project!]!
        nextCursor: String
    }
    
    type Query {
        me: User!
        findProjectsByUsername(username: String, limit: Int, cursor: String): ProjectConnection!
    }
    
    type Mutation {
        createProject(name: String!): Project!
        addUserToProject(projectId: ID!, username: String!, role: Role!): Project!
        changeRole(projectId: ID!, username: String!, role: Role!): Project!
    }
`;

// noinspection JSUnusedGlobalSymbols
const resolvers = {
    Project: {
        userRoles: ({users}) => users,
        role: ({users}, args, {user}) => {
            return users.find(theUser => theUser.username === user.username).role.toUpperCase()
        }
    },
    UserRole: {
        user: async ({username}) => getUser(username),
        role: ({role}) => role.toUpperCase()
    },
    Query: {
        me: (root, args, {user}) => user,
        findProjectsByUsername: async (root, {username, limit, cursor}, {user}) => {
            username = username || user.username;
            return paginate(findByUsernameQuery(username), limit, cursor)
        }
    },
    Mutation: {
        createProject: async (root, {name}, {user: {username}}) => createProject(name, username),
        addUserToProject: async (root, {projectId, username, role}) =>
            addUserToProject(projectId, username, role.toLowerCase()),
        changeRole: async (root, {projectId, username, role}) =>
            changeRole(projectId, username, role.toLowerCase()),
    },
};

const context = async (ctx) => {
    const user = await getUser('testqq'); // todo
    console.log('user is', user);
    return {user}
};

export default {
    typeDefs,
    resolvers,
    context,
}
