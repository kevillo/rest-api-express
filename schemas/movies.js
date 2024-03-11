const z = require('zod')
const schema = z.object({
  title: z.string({
    invalid_type_error: 'title must be a string'
  }),

  genre: z.array(z.string()).nonempty(),
  year: z.number().int().min(1888).max(2024),
  director: z.string(),
  duration: z.number().int().positive(),
  rate: z.number().min(0).max(10).optional(),
  poster: z.string().url({
    message: 'poster must be a valid url'
  })
})

function validateMovie (data) {
  return schema.safeParse(data)
}
function validatePartial (object) {
  return schema.partial().safeParse(object)
}

module.exports = {
  validateMovie,
  validatePartial
}
