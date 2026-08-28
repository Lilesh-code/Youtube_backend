
// Verify whether the user is authenticated or not

import asyncHandler from "../utils/asynchandler.js";
import { APIERROR } from "../utils/apierror.js";
import jwt from "jsonwebtoken";
import { user } from "../models/user.models.js";

export const verifyJwt = asyncHandler(async (req, _, next) => {
    try {
        const token =
            req.cookies?.accessToken ||
            req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            throw new APIERROR(401, "Unauthorized request");
        }

        const decodedToken = jwt.verify(
            token,
            process.env.ACCESS_TOKEN_SECRET
        );

        const user1 = await user
            .findById(decodedToken?._id)
            .select("-password -refreshToken");

        if (!user1) {
            throw new APIERROR(401, "Invalid access token");
        }

        req.user1 = user1;

        next();

    } catch (error) {
        throw new APIERROR(
            401,
            error?.message || "Invalid access token"
        );
    }
});
