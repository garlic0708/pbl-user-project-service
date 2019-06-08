import "../connection/mongo-connection"
import mongoose from 'mongoose'

const ProjectSchema = new mongoose.Schema({
    name: String,
    users: {
        type: [{username: {type: String, index: true}, role: String}],
        validate: {
            validator: users => users.some(user => user.role === 'admin')
        }
    },
});

const Project = mongoose.model('Project', ProjectSchema);

export async function createProject(name, username) {
    return new Project({
        name,
        users: [{username, role: 'admin',}],
    }).save()
}

export async function findById(projectId) {
    return Project.findById(projectId).exec();
}

export async function addUserToProject(projectId, username, role) {
    const project = await findById(projectId);
    project.users.push({username, role,});
    return project.save()
}

export async function removeUserFromProject(projectId, username) {
    const project = await findById(projectId);
    project.users.splice(project.users.findIndex(
        ({username: theUsername}) => theUsername === username), 1);
    return project.save()
}

export async function changeRole(projectId, username, role) {
    const project = await findById(projectId);
    project.users.find(user => user.username === username).role = role;
    return project.save()
}

export function findByUsernameQuery(username) {
    return Project.find()
        .elemMatch('users', {username})
}
