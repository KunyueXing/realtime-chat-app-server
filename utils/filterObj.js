/*
  Filter the obj with only allowedFields remained, and store those key-value pair in a new object and return
 */
const filterObj = (obj, ...allowedFields) => {
  const newObj = {}
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) {
      newObj[el] = obj[el]
    }
  })

  return newObj
}

module.exports = filterObj
