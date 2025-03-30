export const calculateExpiryDate = (planDuration) => {
    // Convert planDuration to a string in case it's a number or something else
    const durationStr = planDuration.toString();

    // Now apply match to extract the numeric part
    const months = parseInt(durationStr.match(/\d+/)?.[0] || "1"); // Default to 1 if no number found
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + months);

    return expiryDate.toISOString().split("T")[0]; // Format: YYYY-MM-DD
};
