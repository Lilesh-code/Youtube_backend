// const asyncHandler = (requestHandler)=>{
//     (req,res,next)=>{
//         Promise.resolve(requestHandler(req,res,next)).catch(err=>next(err));
//     }
// }

// export default asyncHandler;




//make a wraper function which will take a function as an argument and return a new function which will handle the error and send the response to the client
const asyncHandler = (fn)=>async(req,res,next)=>{
    try{
        await fn(req,res,next);
    } catch (error) {
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
}


