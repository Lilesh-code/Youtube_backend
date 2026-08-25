import { Router } from "express";
import { registerUser } from "../controllers/user.controllers.js";
import{upload} from "../middlewares/multer.middleware.js"
const router = Router();

router.route("/Register").post(
    //middleware inject
    upload.fields([
        {
        name:"avatar",
        maxCount:1
        },
        {
         name:"coverImage",
         maxCount:3
        }


        
    ])
    ,registerUser)
//router.route("/login").post(login)
export  default router;
