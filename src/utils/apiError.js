class ApiError extends Error {             //using inheritance
    constructor(
        statusCode,
        message = "something went wrong",
        errors = [],
        stack = ""
    ) {
        //overwritting on error class

        super(message)                  //This line calls the constructor of the superclass
        this.statusCode = statusCode
        this.data = null                //The data property is typically used to attach additional contextual data to an error object
        this.message = message
        this.success = false
        this.errors = errors

        if (stack) {
            this.stack = stack
        } else {
            Error.captureStackTrace(this, this.constructor)
        }
    }
}

export { ApiError }