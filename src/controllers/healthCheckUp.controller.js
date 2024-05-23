import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
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
