
import asyncHandler from "../utils/asynchandler.js";
import { APIERROR } from "../utils/apierror.js";
import { user } from "../models/user.models.js";
import { uploadoncloudinary } from "../utils/cloudinary.js";
import { APIRESPONSE } from "../utils/apiresponse.js";
import jwt  from "jsonwebtoken"


const generateaccessandrefreshtokens = async (userid) => {
    try {
        const user1 = await user.findById(userid);

        if (!user1) {
            throw new APIERROR(404, "User not found");
        }

        const refreshToken = user1.GenerateRefreshToken();
        const accessToken = user1.GenerateAccessToken();

        // Save refresh token in database
        user1.refreshToken = refreshToken;

        await user1.save({
            validateBeforeSave: false
        });

        return {
            accessToken,
            refreshToken
        };

    } catch (error) {
        throw new APIERROR(
            500,
            "Something went wrong while generating refresh and access tokens"
        );
    }
};



const registerUser = asyncHandler(async (req, res) => {

    // Get data from frontend
    const {
        fullname,
        email,
        username,
        password
    } = req.body;


   
    if (
        [fullname, email, username, password]
            .some((field) => field?.trim() === "")
    ) {
        throw new APIERROR(400, "All fields are required");
    }


    const existedUser = await user.findOne({
        $or: [
            { username },
            { email }
        ]
    });

    if (existedUser) {
        throw new APIERROR(
            409,
            "Username or email already exists"
        );
    }


    console.log("FILES:", req.files);
    console.log("BODY:", req.body);
    const avatarLocalpath =
        req.files?.avatar?.[0]?.path;

    const coverimageLocalpath =
        req.files?.coverimage?.[0]?.path;


    // Avatar is required
    if (!avatarLocalpath) {
        throw new APIERROR(
            400,
            "Avatar file is required"
        );
    }



    const avatar =
        await uploadoncloudinary(avatarLocalpath);


    if (!avatar) {
        throw new APIERROR(
            400,
            "Avatar upload failed"
        );
    }



    const coverImage = coverimageLocalpath
        ? await uploadoncloudinary(coverimageLocalpath)
        : null;


    const newUser = await user.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    });


    const createduser = await user
        .findById(newUser._id)
        .select("-password -refreshToken");


    if (!createduser) {
        throw new APIERROR(
            500,
            "Something went wrong while registering the user"
        );
    }



    return res
        .status(201)
        .json(
            new APIRESPONSE(
                201,
                createduser,
                "User registered successfully"
            )
        );
});



const loggedinUser = asyncHandler(async (req, res) => {

    // Get login data
    const {
        email,
        username,
        password
    } = req.body;


    if ((!username && !email) || !password) {
        throw new APIERROR(
            400,
            "Username/email and password are required"
        );
    }


    
    const user1 = await user.findOne({
        $or: [
            { username: username?.toLowerCase() },
            { email: email?.toLowerCase() }
        ]
    });


    if (!user1) {
        throw new APIERROR(
            404,
            "User does not exist"
        );
    }


    const ispasswordvalid =
        await user1.ispasswordcorrect(password);


    if (!ispasswordvalid) {
        throw new APIERROR(
            401,
            "Invalid user credentials"
        );
    }



    const {
        accessToken,
        refreshToken
    } = await generateaccessandrefreshtokens(
        user1._id
    );



    const loggedInuser = await user
        .findById(user1._id)
        .select("-password -refreshToken");


    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production"
    };



    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new APIRESPONSE(
                200,
                {
                    user: loggedInuser,
                    accessToken,
                    refreshToken
                },
                "User logged in successfully"
            )
        );
});



const logOutUser = asyncHandler(async (req, res) => {

    // Remove refresh token from database
    await user.findByIdAndUpdate(
        req.user1._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    );


    // Cookie options
    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production"
    };


    // Clear cookies
    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new APIRESPONSE(
                200,
                {},
                "User logged out successfully"
            )
        );
        });

const refreshAccessToken = asyncHandler(async (req, res) => {

    const incomingRefreshToken =
        req.cookies?.refreshToken || req.body?.refreshAccessToken;

    if (!incomingRefreshToken) {
        throw new APIERROR(401, "Unauthorized request");
    }

    try {

        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );

        const user1 = await user.findById(decodedToken?._id);

        if (!user1) {
            throw new APIERROR(
                401,
                "Invalid refresh token"
            );
        }

        if (incomingRefreshToken !== user1.refreshToken) {
            throw new APIERROR(
                401,
                "Refresh token expired or used"
            );
        }

        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production"
        };

        const {
            accessToken,
            refreshToken: newRefreshToken
        } = await generateaccessandrefreshtokens(user1._id);

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new APIRESPONSE(
                    200,
                    {
                        accessToken,
                        refreshToken: newRefreshToken
                    },
                    "Access token refreshed"
                )
            );

    } catch (error) {

        throw new APIERROR(
            401,
            error?.message || "Invalid refresh token"
        );
    }
});

export {
    registerUser,
    loggedinUser,
    logOutUser,
    refreshAccessToken
};