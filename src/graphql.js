import {gql} from 'apollo-server'
import {paginate} from "pbl-lib";
import {
    findByUsernameQuery, addUserToProject, removeUserFromProject,
    changeRole, createProject, findById
} from "./dal/project";
import {getUser} from "./dal/user";
import {addApp, removeApp, getWorkspace} from "./dal/workspace";

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

        workspace: [String!]!
    }

    type ProjectConnection {
        items: [Project!]!
        nextCursor: String
    }

    type Query {
        me: User!
        getUserByUsername(username: String!): User!
        getProjectById(id: ID!): Project!
        findProjectsByUsername(username: String, limit: Int, cursor: String): ProjectConnection!
    }

    type Mutation {
        createProject(name: String!): Project!
        addUserToProject(projectId: ID!, username: String!, role: Role!): Project!
        removeUserFromProject(projectId: ID!, username: String!): Project!
        changeRole(projectId: ID!, username: String!, role: Role!): Project!

        addToWorkspace(projectId: ID!, appId: String!): String!
        removeFromWorkspace(projectId: ID!, appId: String!): String
    }
`;

// noinspection JSUnusedGlobalSymbols
const resolvers = {
    Project: {
        userRoles: ({users}) => users,
        role: ({users}, args, {user}) => {
            return users.find(theUser => theUser.username === user.username).role.toUpperCase()
        },
        workspace: async ({id}, args, {user: {username}}) => getWorkspace(id, username)
    },
    UserRole: {
        user: async ({username}) => getUser(username),
        role: ({role}) => role.toUpperCase()
    },
    Query: {
        me: (root, args, {user}) => user,
        getUserByUsername: (root, {username}) => getUser(username),
        getProjectById: (root, {id}) => findById(id),
        findProjectsByUsername: async (root, {username, limit, cursor}, {user}) => {
            username = username || user.username;
            return paginate(findByUsernameQuery(username), limit, cursor)
        }
    },
    Mutation: {
        createProject: async (root, {name}, {user: {username}}) => createProject(name, username),
        addUserToProject: async (root, {projectId, username, role}) =>
            addUserToProject(projectId, username, role.toLowerCase()),
        removeUserFromProject: async (root, {projectId, username}) =>
            removeUserFromProject(projectId, username),
        changeRole: async (root, {projectId, username, role}) =>
            changeRole(projectId, username, role.toLowerCase()),

        addToWorkspace: async (root, {projectId, appId}, {user: {username}}) => {
            await addApp(appId, projectId, username);
            return appId
        },
        removeFromWorkspace: async (root, {projectId, appId}, {user: {username}}) => {
            const result = await removeApp(appId, projectId, username);
            return result ? appId : null
        },
    },
};

const context = async ({req: {headers: {username}}}) => {
    let user;
    if (username)
        user = await getUser(username);
    console.log('user is  ', user);
    return {user, username,}
};

export default {
    typeDefs,
    resolvers,
    context,
}
