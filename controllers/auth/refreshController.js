import joi from 'joi';
import { REFRESH_SECRET } from '../../config';
import { RefreshToken } from '../../models';
import CustomErrorHandler from '../../services/CustomErrorHandler';
import JwtService from '../../services/JwtService';
import { User } from '../../models';

const refreshController={
 

       async refresh(req,resp,next){
                // validation
                const refreshSchema= joi.object({
                   refresh_token: joi.string().required()
                });
    
                const {error} = refreshSchema.validate(req.body);
    
                if(error){
                    return next(error);
                }

                //database
           
              let refreshtoken;
                try{
                    refreshtoken = await RefreshToken.findOne({token: req.body.refresh_token});
                    if(!refreshtoken){
                        return next(CustomErrorHandler.unAuthorized('Invalid Refresh token'));
                    } 
                    
                    let userId; 
                    try{
                        const {_id } = await JwtService.verify(refreshtoken.token, REFRESH_SECRET);
                        userId = _id;

                    } catch(err){
                        
                        return next(CustomErrorHandler.unAuthorized('Invalid Refresh token'));
                        
                    }
                    
                    const user= User.findOne({_id: userId})
                    if(!user){
                        
                        return next(CustomErrorHandler.unAuthorized('No user found'));
                    }
                  //tokens
                  const  access_token=JwtService.sign({_id: user._id, role: user.role, name: user.name})
         
                  const refresh_token=JwtService.sign({_id: user._id, role: user.role, name: user.name},'1y',REFRESH_SECRET)
                   
                   //DatabaseWhitlist        
                   await RefreshToken.create({token: refresh_token})
                   
                   resp.json({access_token, refresh_token});
                          

           } catch(err){
                 return next(new Error('Something went wrong' + err.message))
           }

       }


}

export default refreshController;











