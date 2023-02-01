import joi from 'joi';
import { User, RefreshToken } from '../../models';
import CustomErrorHandler from '../../services/CustomErrorHandler';
import bcrypt from 'bcrypt'
import JwtService from '../../services/JwtService';
import { REFRESH_SECRET } from '../../config';

const loginController= {
 
        async login(req,resp,next){
            //validation
            const loginSchema= joi.object({
                email: joi.string().email().required(),
                password: joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required()
            });

            const {error} = loginSchema.validate(req.body);

            if(error){
                return next(error);
            }

            try{
                const user= await User.findOne({email: req.body.email});
                if(!user){
                    return next(CustomErrorHandler.wrongCredential());
                }
              //compare the password
           const match= await bcrypt.compare(req.body.password, user.password)    
           
           if(!match){
            return next(CustomErrorHandler.wrongCredential());
           }

           //Tokenk 
         const  access_token=JwtService.sign({_id: user._id, role: user.role, name: user.name})
         
        const refresh_token=JwtService.sign({_id: user._id, role: user.role, name: user.name},'1y',REFRESH_SECRET)
         
         //DatabaseWhitelist        
         await RefreshToken.create({token: refresh_token})
         
         resp.json({access_token, refresh_token});

            } catch (err){
                  return next(err);
            }

        },

      async logout(req,resp,next){
           //validation
           const refreshSchema= joi.object({
            refresh_token: joi.string().required()
         });

         const {error} = refreshSchema.validate(req.body);

         if(error){
             return next(error);
         }

        try{
             await RefreshToken.deleteOne({token: req.body.refresh_token})

        } catch(err){

           return next(new Error('Something went wrong in the database'));
        }
      
        resp.json({status: 1})
    
    }


}


export default loginController;









