import { DEBUB_MODE } from "../config";
import { ValidationError } from "joi";
import CustomErrorHandler from "../services/CustomErrorHandler";


const errorHandler=(err,req,resp,next)=>{
 
  let statusCode=500;

  let data= {
    message: 'Internal server error',
    ...(DEBUB_MODE=== 'true' && {originalError: err.message})
    
  }

 if(err instanceof ValidationError){
     statusCode=442;
     data={
      message: err.message
     }
 }

  if(err instanceof CustomErrorHandler){
    statusCode= err.status;
      data = {
        message: err.message
      }
  }   
 
 
 
 return resp.status(statusCode).json(data);

}

export default errorHandler;