import * as movieService from "../services/movie.service.js";
import * as movieTypeService from "../services/movie_type.service.js";
import * as showTimeService from "../services/show_times.service.js"
import * as showTimeSeatService from "../services/show_time_seats.service.js"
import * as seatService from "../services/seat.service.js";
import * as comboService from "../services/combos.service.js";
import * as menuItemService from "../services/menu_items.service.js";
import * as eventService from "../services/event.service.js";
import * as eventTypeService from "../services/event_type.service.js";
import * as ticketPriceService from "../services/ticket_price.service.js"
import * as formatService from "../services/format.service.js"
import { paymentMethods } from "../utils/paymentMethods.js";

export const aiGetNowShowingMovies = async (query = {}) => {
    return await movieService.findNowShowing(query)
}

export const aiGetComingSoonMovies = async (query = {}) => {
    return await movieService.findComingSoon(query)
}

export const aiGetMovieById = async (id) => {
    return await movieService.findById(id)
}

export const aiGetMovieTypes = async () => {
    return await movieTypeService.findAll()
}

//
export const aiGetShowTimes = async (query = {}) => {
    return await showTimeService.findAndPaginate(query)
}

//
export const aiGetShowTimeSeatsByShowTimeId = async (showTimeId) => {
    return showTimeSeatService.findByShowTimeId(showTimeId)
}

export const aiGetTicketPrices = async (query = {}) => {
    return await ticketPriceService.findAndPaginate(query)
}

export const aiGetFormats = async () => {
    return await formatService.findAll()
}

export const aiGetSeatTypes = async () => {
    return await seatService.findAll()
}

export const aiGetCombos = async (query = {}) => {
    return await comboService.findAndPaginate(query)
}

export const aiGetComboDetails = async (id) => {
    return await comboService.findById(id)
}

export const aiGetMenuItems = async (query = {}) => {
    return await menuItemService.findAndPaginate(query)
}

export const aiGetMenuItemDetails = async (id) => {
    return await menuItemService.findById(id)
}

export const aiGetEvents = async (query = {}) => {
    return await eventService.findAndPaginate(query)
}

export const aiGetEventDetails = async (id) => {
    return await eventService.findById(id)
}

export const aiGetEventTypes = async () => {
    return await eventTypeService.findAll()
}

export const aiGetPaymentMethods = () => {
    return paymentMethods;
}