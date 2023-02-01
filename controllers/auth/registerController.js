import joi from 'joi'
import CustomErrorHandler from '../../services/CustomErrorHandler'
import { RefreshToken, User } from '../../models'
import bcrypt from 'bcrypt'
import JwtService from '../../services/JwtService'
import { REFRESH_SECRET } from '../../config'
import refreshToken from '../../models/refreshToken'

const registerController={

   async regirster(req,resp,next){
      //validation Schema
      const registerSchema= joi.object({
        name: joi.string().min(3).max(30).required(),
        email: joi.string().email().required(),
        password: joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required(),
        rPassword: joi.ref('password'),  
    })

       console.log(req.body)
     const {error}= registerSchema.validate(req.body)
       
           if(error){
            return next(error);
           }

      try{
           const exist= await  User.exists({email: req.body.email})
           if(exist){
                return next(CustomErrorHandler.alreadyExist('This email is already Exist'))
           }
      } catch(err){
           return next(err);
      }

      // Hash Password
      const hashedPassword = await bcrypt.hash(req.body.password, 10);

      // Prepare the model
      const {name, email, password} = req.body;
      const user= new User({
          name,
          email,
          password: hashedPassword
      })


      let access_token;
      let refresh_token;
        try{

           const result = await user.save();
         
          console.log(result)
           //Token
      access_token=JwtService.sign({_id: result._id, role: result.role, name: result.name})
      refresh_token=JwtService.sign({_id: result._id, role: result.role, name: result.name},'1y',REFRESH_SECRET)
       
      //DatabaseWhitlist        
       await RefreshToken.create({token: refresh_token})
     } catch(err){
           return next(err);
        }




        resp.json({ access_token, refresh_token})
    }
}

export default registerController;










