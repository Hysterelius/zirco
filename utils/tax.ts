// Monthly tax calculation for ATO
const weeklyEarningsTaxScale: { [key: string]: { a: number; b: number } } = {
  "150": { a: 0.16, b: 0.16 },
  "371": { a: 0.2117, b: 7.755 },
  "515": { a: 0.189, b: -0.6702 },
  "932": { a: 0.3227, b: 68.2367 },
  "2246": { a: 0.32, b: 65.7202 },
  "3303": { a: 0.39, b: 222.951 },
  inf: { a: 0.47, b: 487.2587 },
};

function calculateMonthlyTax(
  monthlyEarnings: number,
  allowances: number
): number {
  let total = monthlyEarnings + allowances;

  // If the result is an amount ending in 33 cents, add one cent
  if (total % 1 === 0.33) {
    total += 0.01;
  }

  // Multiply by 3 and then divide by 13
  total = (total * 3) / 13;

  // Ignore any cents in the result
  total = Math.floor(total);

  // Add 99 cents
  total += 0.99;

  return total;
}

export function calculateTax(weeklyEarnings: number, allowances: number): number {
  const total = weeklyEarnings + allowances;
  const correctedTotal = calculateMonthlyTax(total, allowances);

  let scale = weeklyEarningsTaxScale["150"];
  for (const key in weeklyEarningsTaxScale) {
    if (key === "inf") {
      scale = weeklyEarningsTaxScale["inf"];
      break;
    } else if (correctedTotal < parseInt(key)) {
      scale = weeklyEarningsTaxScale[key];
      break;
    }
  }


  let tax = Math.round(scale.a * correctedTotal + scale.b);

  tax = Math.round((tax * 13) / 3);

  return tax;
}
