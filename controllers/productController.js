import { Product } from "../models";
import  multer from 'multer';
import path from 'path';
import CustomErrorHandler from "../services/CustomErrorHandler";
import fs from 'fs'
import joi from 'joi'
import productSchema from "../validators/productValidator";

const storage= multer.diskStorage({
    destination: (req,file,cb)=> cb(null,'uploads'),
    filename: (req,file,cb)=> {
           const uniqueName=`${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
        cb(null,uniqueName)
    }
})

const handleMultipartData= multer({storage, limits: {fileSize: 1000000 * 5}}).single('image') //5mb file size


const productController={
    async store(req,resp,next){
        //Multipart Form Data
      handleMultipartData(req,resp, async (err)=> {
         if(err){
            return next(CustomErrorHandler.serverError(err.message));
        }
        
        const filePath= req.file.path;
         console.log(req.file);
         //validation
       
        
        const {error} = productSchema.validate(req.body);
        if(error){
            // delete the upload file image
            fs.unlink(`${appRoot}/${filePath}`, (err)=>{
                if(err){

                    return next(CustomErrorHandler.serverError(err.message));
                }
             });

             return next(error)
         }

         const {name, price, size}= req.body;

        let document;
      
         try{

              document = await Product.create({
                name,
                price,
                size,
                image: filePath
              });

         } catch(err){

           return next(err);
         }

           resp.status(201).json(document);
      });

    },

    //Update Data .......................................................................................
    update(req,resp,next){
      handleMultipartData(req,resp, async (err)=> {
        if(err){
           return next(CustomErrorHandler.serverError(err.message));
       }
       
       //  console.log(req.file);
        let filePath;
       if(req.file){

          filePath= req.file.path;

       }
       
       
        //validation
        const productSchema= joi.object({
           name: joi.string().required(),
           price: joi.number().required(),
           size: joi.string().required()


       });
       
       const {error} = productSchema.validate(req.body);
       if(error){
           // delete the upload file image
          if(req.file){

            fs.unlink(`${appRoot}/${filePath}`, (err)=>{
              if(err){

                  return next(CustomErrorHandler.serverError(err.message));
              }
           });
          }

            return next(error)
        }

        const {name, price, size}= req.body;

       let document;
     
        try{

             document = await Product.findOneAndUpdate({_id:req.params.id},{
               name,
               price,
               size,
               ...(req.file && { image: filePath})
             }, { new: true });
             console.log(document)

        } catch(err){

          return next(err);
        }

          resp.status(201).json(document);
     });

    },

    //delete the product..............................................................
    async destroy(req,resp,next){
 
      const document= await Product.findOneAndRemove({_id: req.params.id});
      if(!document){

        return next(new Error('Nothing to delete'))
      }
      //image delete
      const imagePath= document._doc.image;
      // console.log(imagePath);
      fs.unlink(`${appRoot}/${imagePath}`, (err)=>{
       
        if(err){
          return next(CustomErrorHandler.serverError());
        }
        
       return resp.json(document);      
      });

    },

    // Get all products 
    async index(req,resp,next){
      let documents;
      // Pagination mongoose-pagination for more than thousand products
      try{
            
            documents = await Product.find().select('-updatedAt -__v');

      } catch(err){

       return next(CustomErrorHandler.serverError()); 

      }
       
       return resp.json(documents)  

   },

   // Show one Product

   async show(req, resp, next){
         
    let document;

    try{

      document= await Product.findOne({_id: req.params.id}).select('-updatedAt -__v')

    } catch(err){

    return next(customElements.serverError());

    }

    return resp.json(document);

   },

   async getProducts(req, res, next) {
    let documents;
    try {
        documents = await Product.find({
            _id: { $in: req.body.ids },
        }).select('-updatedAt -__v');
    } catch (err) {
        return next(CustomErrorHandler.serverError());
    }
    return res.json(documents);
},
};



export default productController;









