import {ipKeyGenerator , rateLimit} from "express-rate-limit";
import { getCountryCode } from "../utils/getCountryCode.js";
import MongoStore from "rate-limit-mongo";

export const limiter = rateLimit({
    windowMs : 15 * 60 * 1000,
    max : async function (req){
        const {countryCode} = await getCountryCode(req.headers["x-forwarded-for"])
        if(countryCode === "US") { return 15 }
        if(countryCode === "EG") { return 30 }
        if(countryCode === "IN") { return 10 }
        return 5
    },
    requestPropertyName : "rateLimit",
    handler : (req , res , next) => {
        res.status(429).json({message : "Too many requests"})
    },
    legacyHeaders : false,
    keyGenerator : (req) => {
        const ip = ipKeyGenerator(req.ip || req.headers["x-forwarded-for"])
        return `${ip} + ${req.path}`;
    },
    //=========================================================================
    //==========================================================================
    store : new MongoStore({
        uri : process.env.MONGO_URL,
        collectionName : "rateLimit",
        expireTimeMs: 15 * 60 * 1000
    })
})