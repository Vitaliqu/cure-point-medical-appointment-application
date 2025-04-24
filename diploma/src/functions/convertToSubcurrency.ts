const convertToSubcurrency = (amount: number, factor = 100): number => Math.round(amount * factor);
export default convertToSubcurrency;
