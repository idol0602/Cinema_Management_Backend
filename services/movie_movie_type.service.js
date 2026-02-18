import * as MovieMovieTypeRepo from "../repositories/movie_movie_type.repo.js";
import { v4 as uuidv4 } from "uuid";
export const create = async (payload) => {
    return await MovieMovieTypeRepo.create({
        id: uuidv4(),
        ...payload
    });
}

export const findAll = async () => {
    return await MovieMovieTypeRepo.findAll();
}

export const findById = async (id) => {
    return await MovieMovieTypeRepo.findById(id);
}

export const update = async (id, data) => {
    return await MovieMovieTypeRepo.update(id, data);
}

export const remove = async (id) => {
    return await MovieMovieTypeRepo.remove(id);
}

export const findAndPaginate = async (query) => {
    return await MovieMovieTypeRepo.findAndPaginate(query);
}