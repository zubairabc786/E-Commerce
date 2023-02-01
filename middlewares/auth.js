import CustomErrorHandler from "../services/CustomErrorHandler";
import JwtService from "../services/JwtService";
const auth= async (req,resp,next)=>{
    let authHeader = req.headers.authorization;

    // console.log('authHeader=',authHeader);

    if(!authHeader){
        return next(CustomErrorHandler.unAuthorized());
    }
    
    const token = authHeader.split(' ')[1];    
    // console.log("token=",token)
    
    try{

        const {_id, role}=  JwtService.verify(token);
        const user = {
            _id,
            role
        }
        req.user=user;
        next();

    } catch(err){
        
        return next(CustomErrorHandler.unAuthorized());
    }
}

export default auth;