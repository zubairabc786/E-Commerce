import dotevn from 'dotenv'

dotevn.config();


export const {
    APP_PORT,
   DEBUB_MODE,
   DB_URL,
   JWT_SECRET,
   REFRESH_SECRET,
   APP_URL
    
} = process.env


