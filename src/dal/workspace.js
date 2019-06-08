import Redis from 'ioredis'
import {config} from 'pbl-lib'

const redis = new Redis(6379, config.redisUrl);

function getKey(projectId, username) {
    return `project:${projectId}:user:${username}:workspace`
}

export async function addApp(appId, projectId, username) {
    return redis.sadd(getKey(projectId, username), appId)
}

export async function removeApp(appId, projectId, username) {
    return redis.srem(getKey(projectId, username), appId)
}

export async function getWorkspace(projectId, username) {
    return redis.smembers(getKey(projectId, username))
}
