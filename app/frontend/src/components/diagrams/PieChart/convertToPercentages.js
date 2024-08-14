export function convertToPercentages(numbers) {
    // Step 1: Convert to percentages
    const percentages = numbers.map(num => Math.round(num * 100));
    
    // Calculate the total of the rounded percentages
    const total = percentages.reduce((sum, value) => sum + value, 0);

    // Step 3: Adjust to ensure the total is exactly 100
    let adjustment = 100 - total;
    
    // Distribute the adjustment across the percentages
    const adjustedPercentages = percentages.slice(); // Copy the array
    let index = 0;
    
    // If the adjustment is positive, add to the first few items
    while (adjustment > 0) {
        adjustedPercentages[index]++;
        index = (index + 1) % adjustedPercentages.length;
        adjustment--;
    }
    
    // If the adjustment is negative, subtract from the first few items
    while (adjustment < 0) {
        adjustedPercentages[index]--;
        index = (index + 1) % adjustedPercentages.length;
        adjustment++;
    }

    return adjustedPercentages;
}
