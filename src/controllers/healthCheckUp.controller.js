import {ApiResponse} from "../utils/apiResponse.js"
import { ApiError } from "../utils/apiError.js"
import { asyncHandler } from "../utils/asyncHandler.js";

const healthcheck = asyncHandler(async (req, res) => {
    // Return a simple health check response
    return res
        .status(200)
        .json(new ApiResponse(200, null, "Service is healthy"));
});

export {
    healthcheck
};
