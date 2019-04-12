import "../connection/mongo-connection"
import mongoose from 'mongoose'

const ProjectSchema = new mongoose.Schema({
    name: String,
    users: {
        type: [{username: String, role: String}],
        index: true,
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

export async function addUserToProject(projectId, username, role) {
    const project = await Project.findById(projectId).exec();
    project.users.push({username, role,});
    return project.save()
}

export async function changeRole(projectId, username, role) {
    const project = await Project.findById(projectId).exec();
    project.users.find(user => user.username === username).role = role;
    return project.save()
}

export function findByUsernameQuery(username) {
    return Project.find()
        .elemMatch('users', {username})
}
