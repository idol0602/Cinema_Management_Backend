import * as service from "../services/user.service.js";
import { success } from "../utils/response.js";

export const create = async (req, res, next) => {
    try {
        const { data, error } = await service.create(req.body);
        if (error) throw error;
        return success(res, data, "Create user successfully");
    } catch (e) {
        next(e);
    }
}

export const getAll = async (req, res, next) => {
    try {
        const { data, error } = await service.findAll();
        if (error) throw error;
        return success(res, data, "Get users successfully");
    } catch (e) {
        next(e);
    }
}

export const getById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { data, error } = await service.findById(id);
        if (error) throw error;
        return success(res, data, "Get user successfully");
    } catch (e) {
        next(e);
    }
}

export const update = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { data, error } = await service.update(id, req.body);
        if (error) throw error;
        return success(res, data, "Update user successfully");
    } catch (e) {
        next(e);
    }
}

export const remove = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { data, error } = await service.remove(id);
        if (error) throw error;
        return success(res, data, "Remove user successfully");
    } catch (e) {
        next(e);
    }
}
