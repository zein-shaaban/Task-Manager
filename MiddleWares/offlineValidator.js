const Joi = require("joi");
class OfflineValidator {
  validate(body) {
    const schema = Joi.object({
      deleteArray: Joi.array().items(Joi.number()).required(),
      updateArray: Joi.array().items(
        Joi.object({
          taskId: Joi.number().required(),
          content: Joi.string().max(50),
          last_updated: Joi.number().required(),
          important: Joi.boolean(),
          completed: Joi.boolean(),
        })
      ),
      addArray: Joi.array()
        .items(
          Joi.object({
            taskId: Joi.number().required(),
            content: Joi.string().max(50),
            date: Joi.number(),
            important: Joi.boolean(),
            completed: Joi.boolean(),
          })
        )
        .required(),
    });
    return schema.validate(body);
  }
}

module.exports = new OfflineValidator();
