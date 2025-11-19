import jwt from 'jsonwebtoken';

export const checkAuth = (req,res,next)=>{
    try{
        const token = req.headers.authorization.split(" ")[1];
        if(!token){
            return res.status(401).json({error: "Acces non autorisé"});
        }

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        req.userData = {
        userId: decodedToken.userId,
        email: decodedToken.email
        };
    
        next();
    } catch (error){
        return res.status(401).json({error: "Authentification échouée."})
    }

}