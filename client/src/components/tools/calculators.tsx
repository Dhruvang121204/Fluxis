import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  BarChart,
  Percent,
  Banknote,
  CreditCard,
} from "lucide-react";

// Tax Calculator Component
export function TaxCalculator({ currencySymbol }: { currencySymbol: string }) {
  const [income, setIncome] = useState<number>(500000);
  const [regime, setRegime] = useState<string>("new");
  const [ageGroup, setAgeGroup] = useState<string>("general");
  const [taxDetails, setTaxDetails] = useState({
    taxableIncome: 500000,
    taxAmount: 12500,
    effectiveRate: 2.5
  });

  const formatIndianNumber = (num: number): string => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const calculateTax = () => {
    let taxAmount = 0;
    let taxableIncome = income;

    // Simplified Indian tax calculation for demo purposes
    if (regime === "new") {
      // New Tax Regime (2023-2024)
      if (taxableIncome <= 300000) {
        taxAmount = 0;
      } else if (taxableIncome <= 600000) {
        taxAmount = (taxableIncome - 300000) * 0.05;
      } else if (taxableIncome <= 900000) {
        taxAmount = 15000 + (taxableIncome - 600000) * 0.1;
      } else if (taxableIncome <= 1200000) {
        taxAmount = 45000 + (taxableIncome - 900000) * 0.15;
      } else if (taxableIncome <= 1500000) {
        taxAmount = 90000 + (taxableIncome - 1200000) * 0.2;
      } else {
        taxAmount = 150000 + (taxableIncome - 1500000) * 0.3;
      }
    } else {
      // Old Tax Regime
      let exemptionLimit = 250000;
      if (ageGroup === "senior") exemptionLimit = 300000;
      if (ageGroup === "very-senior") exemptionLimit = 500000;

      if (taxableIncome <= exemptionLimit) {
        taxAmount = 0;
      } else if (taxableIncome <= 500000) {
        taxAmount = (taxableIncome - exemptionLimit) * 0.05;
      } else if (taxableIncome <= 1000000) {
        taxAmount = (500000 - exemptionLimit) * 0.05 + (taxableIncome - 500000) * 0.2;
      } else {
        taxAmount = (500000 - exemptionLimit) * 0.05 + 500000 * 0.2 + (taxableIncome - 1000000) * 0.3;
      }
    }

    // Apply 4% health and education cess
    taxAmount = taxAmount * 1.04;

    setTaxDetails({
      taxableIncome: income,
      taxAmount: Math.round(taxAmount),
      effectiveRate: income > 0 ? parseFloat(((taxAmount / income) * 100).toFixed(1)) : 0
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Annual Income ({currencySymbol})</Label>
        <Input 
          type="number" 
          placeholder="Enter your annual income"
          value={income}
          onChange={(e) => setIncome(Number(e.target.value))}
        />
      </div>
      
      <div className="space-y-2">
        <Label>Tax Regime</Label>
        <select 
          className="w-full rounded-md border border-input p-2"
          value={regime}
          onChange={(e) => setRegime(e.target.value)}
        >
          <option value="new">New Tax Regime</option>
          <option value="old">Old Tax Regime</option>
        </select>
      </div>
      
      <div className="space-y-2">
        <Label>Age Group</Label>
        <select 
          className="w-full rounded-md border border-input p-2"
          value={ageGroup}
          onChange={(e) => setAgeGroup(e.target.value)}
        >
          <option value="general">Below 60 years</option>
          <option value="senior">60 to 80 years</option>
          <option value="very-senior">Above 80 years</option>
        </select>
      </div>
      
      <div className="bg-muted p-4 rounded-md">
        <div className="flex justify-between mb-2">
          <span>Taxable Income:</span>
          <span className="font-semibold">{currencySymbol}{formatIndianNumber(taxDetails.taxableIncome)}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span>Tax Amount:</span>
          <span className="font-semibold">{currencySymbol}{formatIndianNumber(taxDetails.taxAmount)}</span>
        </div>
        <div className="flex justify-between">
          <span>Effective Tax Rate:</span>
          <span className="font-semibold">{taxDetails.effectiveRate}%</span>
        </div>
      </div>
      
      <Button className="w-full" onClick={calculateTax}>Calculate Tax</Button>
    </div>
  );
}

// Credit Card Payoff Calculator
export function CreditCardCalculator({ currencySymbol }: { currencySymbol: string }) {
  const [balance, setBalance] = useState<number>(50000);
  const [interestRate, setInterestRate] = useState<number>(36);
  const [monthlyPayment, setMonthlyPayment] = useState<number>(5000);
  const [payoffResults, setPayoffResults] = useState({
    months: 13,
    totalInterest: 15429,
    totalPaid: 65429
  });

  const formatIndianNumber = (num: number): string => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const calculatePayoff = () => {
    // Input validation
    if (balance <= 0 || interestRate <= 0 || monthlyPayment <= 0) {
      return;
    }

    if (monthlyPayment <= (balance * (interestRate / 100) / 12)) {
      // Monthly payment is too low to cover interest
      return;
    }

    let remainingBalance = balance;
    let monthsToPayoff = 0;
    let totalInterestPaid = 0;

    // Calculate months to payoff and total interest
    while (remainingBalance > 0) {
      // Calculate monthly interest
      let monthlyInterest = remainingBalance * (interestRate / 100 / 12);
      totalInterestPaid += monthlyInterest;

      // Apply payment to balance
      remainingBalance = remainingBalance + monthlyInterest - monthlyPayment;
      monthsToPayoff++;

      // Handle final payment if it's less than the monthly payment
      if (remainingBalance < 0) {
        // Adjust the total interest for the final partial payment
        totalInterestPaid += remainingBalance;
        remainingBalance = 0;
      }

      // Safety check to prevent infinite loops
      if (monthsToPayoff > 1000) {
        break;
      }
    }

    setPayoffResults({
      months: monthsToPayoff,
      totalInterest: Math.round(totalInterestPaid),
      totalPaid: Math.round(balance + totalInterestPaid)
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Current Balance ({currencySymbol})</Label>
        <Input 
          type="number" 
          placeholder="Enter your current balance"
          value={balance}
          onChange={(e) => setBalance(Number(e.target.value))}
        />
      </div>
      
      <div className="space-y-2">
        <Label>Annual Interest Rate (%)</Label>
        <Input 
          type="number" 
          placeholder="Enter annual interest rate"
          value={interestRate}
          onChange={(e) => setInterestRate(Number(e.target.value))}
        />
      </div>
      
      <div className="space-y-2">
        <Label>Monthly Payment ({currencySymbol})</Label>
        <Input 
          type="number" 
          placeholder="Enter monthly payment"
          value={monthlyPayment}
          onChange={(e) => setMonthlyPayment(Number(e.target.value))}
        />
      </div>
      
      <div className="bg-muted p-4 rounded-md">
        <div className="flex justify-between mb-2">
          <span>Payoff Time:</span>
          <span className="font-semibold">{payoffResults.months} months</span>
        </div>
        <div className="flex justify-between mb-2">
          <span>Total Interest Paid:</span>
          <span className="font-semibold">{currencySymbol}{formatIndianNumber(payoffResults.totalInterest)}</span>
        </div>
        <div className="flex justify-between">
          <span>Total Amount Paid:</span>
          <span className="font-semibold">{currencySymbol}{formatIndianNumber(payoffResults.totalPaid)}</span>
        </div>
      </div>
      
      <Button className="w-full" onClick={calculatePayoff}>Calculate Payoff</Button>
    </div>
  );
}

// Investment Calculator Component
export function InvestmentCalculator({ currencySymbol }: { currencySymbol: string }) {
  const [initialInvestment, setInitialInvestment] = useState<number>(100000);
  const [monthlyContribution, setMonthlyContribution] = useState<number>(5000);
  const [annualReturnRate, setAnnualReturnRate] = useState<number>(12);
  const [investmentPeriod, setInvestmentPeriod] = useState<number>(10);
  const [investmentResults, setInvestmentResults] = useState({
    futureValue: 1765622,
    totalInvested: 700000,
    interestEarned: 1065622
  });

  const formatIndianNumber = (num: number): string => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const calculateReturns = () => {
    const monthlyRate = annualReturnRate / 100 / 12;
    const totalMonths = investmentPeriod * 12;
    
    // Calculate future value of initial investment
    const initialFutureValue = initialInvestment * Math.pow(1 + monthlyRate, totalMonths);
    
    // Calculate future value of monthly contributions
    let contributionsFutureValue = 0;
    if (monthlyRate > 0) {
      contributionsFutureValue = monthlyContribution * ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate);
    } else {
      contributionsFutureValue = monthlyContribution * totalMonths;
    }
    
    const totalFutureValue = initialFutureValue + contributionsFutureValue;
    const totalInvested = initialInvestment + (monthlyContribution * totalMonths);
    const interestEarned = totalFutureValue - totalInvested;
    
    setInvestmentResults({
      futureValue: Math.round(totalFutureValue),
      totalInvested: Math.round(totalInvested),
      interestEarned: Math.round(interestEarned)
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Initial Investment ({currencySymbol})</Label>
        <Input 
          type="number" 
          placeholder="Enter initial investment"
          value={initialInvestment}
          onChange={(e) => setInitialInvestment(Number(e.target.value))}
        />
      </div>
      
      <div className="space-y-2">
        <Label>Monthly Contribution ({currencySymbol})</Label>
        <Input 
          type="number" 
          placeholder="Enter monthly contribution"
          value={monthlyContribution}
          onChange={(e) => setMonthlyContribution(Number(e.target.value))}
        />
      </div>
      
      <div className="space-y-2">
        <Label>Annual Return Rate (%)</Label>
        <Input 
          type="number" 
          placeholder="Enter expected annual return"
          value={annualReturnRate}
          onChange={(e) => setAnnualReturnRate(Number(e.target.value))}
        />
      </div>
      
      <div className="space-y-2">
        <Label>Investment Period (years)</Label>
        <Input 
          type="number" 
          placeholder="Enter investment period"
          value={investmentPeriod}
          onChange={(e) => setInvestmentPeriod(Number(e.target.value))}
        />
      </div>
      
      <div className="bg-muted p-4 rounded-md">
        <div className="flex justify-between mb-2">
          <span>Future Value:</span>
          <span className="font-semibold">{currencySymbol}{formatIndianNumber(investmentResults.futureValue)}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span>Total Invested:</span>
          <span className="font-semibold">{currencySymbol}{formatIndianNumber(investmentResults.totalInvested)}</span>
        </div>
        <div className="flex justify-between">
          <span>Interest Earned:</span>
          <span className="font-semibold">{currencySymbol}{formatIndianNumber(investmentResults.interestEarned)}</span>
        </div>
      </div>
      
      <Button className="w-full" onClick={calculateReturns}>Calculate Returns</Button>
    </div>
  );
}

// Retirement Calculator Component
export function RetirementCalculator({ currencySymbol }: { currencySymbol: string }) {
  const [currentAge, setCurrentAge] = useState<number>(30);
  const [retirementAge, setRetirementAge] = useState<number>(60);
  const [monthlyExpenses, setMonthlyExpenses] = useState<number>(50000);
  const [inflationRate, setInflationRate] = useState<number>(6);
  const [returnRate, setReturnRate] = useState<number>(12);
  const [retirementResults, setRetirementResults] = useState({
    requiredCorpus: 43627498,
    monthlyInvestment: 14587,
    inflatedMonthlyExpense: 287289
  });

  const formatIndianNumber = (num: number): string => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const calculateRetirement = () => {
    // Calculate retirement corpus required
    const yearsToRetirement = retirementAge - currentAge;
    const monthsToRetirement = yearsToRetirement * 12;
    
    // Calculate future monthly expenses at retirement age (due to inflation)
    const inflatedMonthlyExpense = monthlyExpenses * Math.pow(1 + (inflationRate / 100), yearsToRetirement);
    
    // Using the 4% rule (25 times annual expenses for retirement corpus)
    // Adjusted for Indian context with higher inflation
    const requiredCorpus = inflatedMonthlyExpense * 12 * 25;
    
    // Calculate required monthly investment to reach corpus
    const monthlyRate = returnRate / 100 / 12;
    const monthlyInvestment = requiredCorpus / (((Math.pow(1 + monthlyRate, monthsToRetirement) - 1) / monthlyRate) * (1 + monthlyRate));
    
    setRetirementResults({
      requiredCorpus: Math.round(requiredCorpus),
      monthlyInvestment: Math.round(monthlyInvestment),
      inflatedMonthlyExpense: Math.round(inflatedMonthlyExpense)
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Current Age</Label>
        <Input 
          type="number" 
          placeholder="Enter your current age"
          value={currentAge}
          onChange={(e) => setCurrentAge(Number(e.target.value))}
        />
      </div>
      
      <div className="space-y-2">
        <Label>Retirement Age</Label>
        <Input 
          type="number" 
          placeholder="Enter your retirement age"
          value={retirementAge}
          onChange={(e) => setRetirementAge(Number(e.target.value))}
        />
      </div>
      
      <div className="space-y-2">
        <Label>Monthly Expenses ({currencySymbol})</Label>
        <Input 
          type="number" 
          placeholder="Enter current monthly expenses"
          value={monthlyExpenses}
          onChange={(e) => setMonthlyExpenses(Number(e.target.value))}
        />
      </div>
      
      <div className="space-y-2">
        <Label>Inflation Rate (%)</Label>
        <Input 
          type="number" 
          placeholder="Enter expected inflation rate"
          value={inflationRate}
          onChange={(e) => setInflationRate(Number(e.target.value))}
        />
      </div>
      
      <div className="space-y-2">
        <Label>Expected Return Rate (%)</Label>
        <Input 
          type="number" 
          placeholder="Enter expected return rate"
          value={returnRate}
          onChange={(e) => setReturnRate(Number(e.target.value))}
        />
      </div>
      
      <div className="bg-muted p-4 rounded-md">
        <div className="flex justify-between mb-2">
          <span>Retirement Corpus Needed:</span>
          <span className="font-semibold">{currencySymbol}{formatIndianNumber(retirementResults.requiredCorpus)}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span>Monthly Investment Required:</span>
          <span className="font-semibold">{currencySymbol}{formatIndianNumber(retirementResults.monthlyInvestment)}</span>
        </div>
        <div className="flex justify-between">
          <span>Monthly Expenses at Retirement:</span>
          <span className="font-semibold">{currencySymbol}{formatIndianNumber(retirementResults.inflatedMonthlyExpense)}</span>
        </div>
      </div>
      
      <Button className="w-full" onClick={calculateRetirement}>Calculate Retirement Plan</Button>
    </div>
  );
}

// Full Calculator Components with Card Wrappers
export function TaxCalculatorCard({ currencySymbol }: { currencySymbol: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <BarChart className="h-5 w-5 mr-2 text-primary" />
          Tax Calculator
        </CardTitle>
        <CardDescription>
          Estimate your income tax based on your annual income
        </CardDescription>
      </CardHeader>
      <CardContent>
        <TaxCalculator currencySymbol={currencySymbol} />
      </CardContent>
    </Card>
  );
}

export function CreditCardCalculatorCard({ currencySymbol }: { currencySymbol: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <CreditCard className="h-5 w-5 mr-2 text-primary" />
          Credit Card Payoff Calculator
        </CardTitle>
        <CardDescription>
          Calculate how long it will take to pay off your credit card balance
        </CardDescription>
      </CardHeader>
      <CardContent>
        <CreditCardCalculator currencySymbol={currencySymbol} />
      </CardContent>
    </Card>
  );
}

export function InvestmentCalculatorCard({ currencySymbol }: { currencySymbol: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Percent className="h-5 w-5 mr-2 text-primary" />
          Investment Returns Calculator
        </CardTitle>
        <CardDescription>
          Estimate returns on your investments over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <InvestmentCalculator currencySymbol={currencySymbol} />
      </CardContent>
    </Card>
  );
}

export function RetirementCalculatorCard({ currencySymbol }: { currencySymbol: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Banknote className="h-5 w-5 mr-2 text-primary" />
          Retirement Calculator
        </CardTitle>
        <CardDescription>
          Plan your retirement savings and estimate your corpus
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RetirementCalculator currencySymbol={currencySymbol} />
      </CardContent>
    </Card>
  );
}