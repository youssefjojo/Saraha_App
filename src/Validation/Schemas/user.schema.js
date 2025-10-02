import Joi from "joi";

export const signUpSchema ={
    body: Joi.object({
      
        firstName: Joi.string().alphanum().min(3).max(18).messages({
            "string.min" : "First name must be at least 3 characters long",
            "string.max" : "First name must be at most 18 characters long",
            "string.alphanum" : "First name must contain only letters and numbers"
        }).required(),
      
        lastName: Joi.string().alphanum().min(3).max(18).messages({
            "string.min" : "First name must be at least 3 characters long",
            "string.max" : "First name must be at most 18 characters long",
            "string.alphanum" : "First name must contain only letters and numbers"
        }).required(),
      
      email: Joi.string().email().required(),
      
      password: Joi.string().pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/).messages({
        "string.pattern.base" : "Password must contain at least one lowercase letter, one uppercase letter, one digit, and one special character"}).required(),
      
        confirmPassword: Joi.string().required().valid(Joi.ref('password')).messages({
        "any.only" : "Passwords do not match"}),
      
        age: Joi.number().integer().positive().min(18).max(100).messages({
        "number.min" : "Age must be greater than 18" , 
        "number.max" : "Age must be less than 100"}).required(),
      
        gender: Joi.string().valid('male', 'female').messages({
        "any.only" : "Gender must be male or female"}).required(),
      
        phone: Joi.string().length(11).messages({
        "string.length" : "Phone number must be 11 characters long"}).required(),
    })
}
