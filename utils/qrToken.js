import jwt from "jsonwebtoken";


export const generateQrToken = (ticketId, expiresIn) => {
    return jwt.sign(ticketId, process.env.JWT_SECRET, { expiresIn: expiresIn });
}