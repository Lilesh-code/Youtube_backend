
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
const changeCurrentpassword = asyncHandler(async (req, res) => {
    const { oldpassword, newpassword, confirmpassword } = req.body;

    if (newpassword !== confirmpassword) {
        throw new APIERROR(
            400,
            "Confirm password is wrong, please enter again"
        );
    }

    const user1 = await user.findById(req.user1?._id);

    if (!user1) {
        throw new APIERROR(404, "User not found");
    }

    const ispasswordCurrect =
        await user1.ispasswordcorrect(oldpassword);

    if (!ispasswordCurrect) {
        throw new APIERROR(400, "Invalid old password");
    }

    user1.password = newpassword;

    await user1.save({
        validateBeforeSave: false
    });

    return res
        .status(200)
        .json(
            new APIRESPONSE(
                200,
                {},
                "Password changed successfully"
            )
        );
});


const getcurrentuser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(
            new APIRESPONSE(
                200,
                req.user1,
                "Current user fetched successfully"
            )
        );
});


const updateAccountdetail = asyncHandler(async (req, res) => {
    const { fullname, email } = req.body;

    if (!fullname || !email) {
        throw new APIERROR(400, "All fields are required");
    }

    const user1 = await user.findByIdAndUpdate(
        req.user1._id,
        {
            $set: {
                fullname,
                email
            }
        },
        {
            new: true
        }
    ).select("-password");

    return res
        .status(200)
        .json(
            new APIRESPONSE(
                200,
                user1,
                "Account details updated successfully"
            )
        );
});


const updateuseravatar = asyncHandler(async (req, res) => {
    const avatarlocalpath = req.file?.path;

    if (!avatarlocalpath) {
        throw new APIERROR(400, "Avatar file is missing");
    }

    const avatar = await uploadoncloudinary(avatarlocalpath);

    if (!avatar?.url) {
        throw new APIERROR(400, "Error while uploading avatar");
    }

    const user1 = await user.findByIdAndUpdate(
        req.user1?._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        {
            new: true
        }
    ).select("-password");

    return res
        .status(200)
        .json(
            new APIRESPONSE(
                200,
                user1,
                "Avatar updated successfully"
            )
        );
});


const updateusercoverimage = asyncHandler(async (req, res) => {
    const coverImagelocalpath = req.file?.path;

    if (!coverImagelocalpath) {
        throw new APIERROR(400, "Cover image file is missing");
    }

    const coverImage = await uploadoncloudinary(coverImagelocalpath);

    if (!coverImage?.url) {
        throw new APIERROR(
            400,
            "Error while uploading cover image"
        );
    }

    const user1 = await user.findByIdAndUpdate(
        req.user1?._id,
        {
            $set: {
                coverImage: coverImage.url
            }
        },
        {
            new: true
        }
    ).select("-password");

    return res
        .status(200)
        .json(
            new APIRESPONSE(
                200,
                user1,
                "Cover image updated successfully"
            )
        );
});
        

export {
    registerUser,
    loggedinUser,
    logOutUser,
    refreshAccessToken,
    changeCurrentpassword,
    getcurrentuser,
    updateAccountdetail,
    updateuseravatar,
    updateusercoverimage

};