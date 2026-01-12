import Joi from "joi";

export const addVehicleSchema = Joi.object({
    name: Joi.string().min(1).max(100).required(),
    description: Joi.string().max(500).optional(),
    imageUrl: Joi.string().uri().optional(),
    isAvailable: Joi.boolean().optional(),
    maxWeight: Joi.alternatives().try(Joi.number(), Joi.string()).required(),
    pricePerKm: Joi.number().min(0).required(),
    isActive: Joi.boolean().optional(),
})
