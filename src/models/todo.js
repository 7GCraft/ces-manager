const db = require('../config/db');

const findAll = async () => {
    try {
        const result = await db('todos').select();
        return result;
    } catch (error) {
        throw error;
    }
}

const find = async (id) => {
    try {
        const result = await db('todos').select().where('id', id);
        return result;
    } catch (error) {
        throw error;
    }
}

const insert = async (data) => {
    try {
        const { title, description } = data;
        return await db('todos').insert({ title, description });
    } catch (error) {
        throw error;
    }
}

const update = async (data) => {
    try {
        const { id, title, description } = data;
        return await db('todos')
            .where('id', id)
            .update({ title, description });
    } catch (error) {
        throw error;
    }
}

const deleteData = async (id) => {
    try {
        return await db('todos')
            .where('id', id)
            .delete();
    } catch (error) {
        throw error;
    }
}

module.exports = {
    findAll,
    find,
    insert,
    update,
    deleteData
};