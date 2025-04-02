import { useState } from "react";
import AppShell from "@/components/layout/app-shell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { 
  Calculator, 
  PiggyBank, 
  LineChart, 
  CalendarDays, 
  DollarSign,
  BarChart,
  Percent,
  Banknote,
  CreditCard,
  ArrowLeftRight
} from "lucide-react";
import { getCurrencySymbol } from "@/lib/currency";
import { useQuery } from "@tanstack/react-query";
import { UserSettings } from "@shared/schema";
import { 
  TaxCalculator, 
  CreditCardCalculator, 
  InvestmentCalculator, 
  RetirementCalculator 
} from "@/components/tools/calculators";

export default function ToolsPage() {
  const { data: userSettings } = useQuery<UserSettings>({
    queryKey: ["/api/user/settings"],
  });
  
  const currencySymbol = getCurrencySymbol(userSettings?.currency || 'INR');
  
  return (
    <AppShell
      title="Financial Tools"
      subtitle="Calculators and tools to help manage your finances"
      activePage="tools"
    >
      <div className="p-4 space-y-6 pb-20">
        <Tabs defaultValue="calculator">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="calculator">Calculator</TabsTrigger>
            <TabsTrigger value="loan">Loan</TabsTrigger>
            <TabsTrigger value="savings">Savings</TabsTrigger>
            <TabsTrigger value="converter">Converter</TabsTrigger>
          </TabsList>
          
          {/* Basic Calculator */}
          <TabsContent value="calculator">
            <CalculatorTool currencySymbol={currencySymbol} />
          </TabsContent>
          
          {/* Loan Calculator */}
          <TabsContent value="loan">
            <LoanCalculator currencySymbol={currencySymbol} />
          </TabsContent>
          
          {/* Savings Calculator */}
          <TabsContent value="savings">
            <SavingsCalculator currencySymbol={currencySymbol} />
          </TabsContent>
          
          {/* Currency Converter */}
          <TabsContent value="converter">
            <CurrencyConverter currencySymbol={currencySymbol} />
          </TabsContent>
        </Tabs>
        
        {/* More Financial Tools */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
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
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <CreditCard className="h-5 w-5 mr-2 text-primary" />
                Credit Card Payoff
              </CardTitle>
              <CardDescription>
                Calculate how long it will take to pay off your credit card
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CreditCardCalculator currencySymbol={currencySymbol} />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Percent className="h-5 w-5 mr-2 text-primary" />
                Investment Returns
              </CardTitle>
              <CardDescription>
                Estimate returns on your investments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InvestmentCalculator currencySymbol={currencySymbol} />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Banknote className="h-5 w-5 mr-2 text-primary" />
                Retirement Calculator
              </CardTitle>
              <CardDescription>
                Plan your retirement savings and withdrawals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RetirementCalculator currencySymbol={currencySymbol} />
            </CardContent>
          </Card>
          

        </div>
      </div>
    </AppShell>
  );
}

// Calculator Tool Component
function CalculatorTool({ currencySymbol }: { currencySymbol: string }) {
  const [display, setDisplay] = useState('0');
  const [firstValue, setFirstValue] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForSecondValue, setWaitingForSecondValue] = useState(false);

  const handleNumberClick = (num: string) => {
    if (display === '0' || waitingForSecondValue) {
      setDisplay(num);
      setWaitingForSecondValue(false);
    } else {
      setDisplay(display + num);
    }
  };

  const handleOperatorClick = (op: string) => {
    setFirstValue(parseFloat(display));
    setOperator(op);
    setWaitingForSecondValue(true);
  };

  const handleEquals = () => {
    if (firstValue !== null && operator) {
      const secondValue = parseFloat(display);
      let result = 0;
      
      switch (operator) {
        case '+':
          result = firstValue + secondValue;
          break;
        case '-':
          result = firstValue - secondValue;
          break;
        case '×':
          result = firstValue * secondValue;
          break;
        case '÷':
          result = firstValue / secondValue;
          break;
      }
      
      setDisplay(result.toString());
      setFirstValue(null);
      setOperator(null);
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setFirstValue(null);
    setOperator(null);
    setWaitingForSecondValue(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calculator className="h-5 w-5 mr-2 text-primary" />
          Financial Calculator
        </CardTitle>
        <CardDescription>Perform basic financial calculations</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="bg-muted p-4 mb-4 text-right rounded-md">
          <p className="text-2xl font-mono">{display}</p>
        </div>
        
        <div className="grid grid-cols-4 gap-2">
          <Button variant="outline" onClick={() => handleClear()}>C</Button>
          <Button variant="outline">+/-</Button>
          <Button variant="outline">%</Button>
          <Button variant="outline" onClick={() => handleOperatorClick('÷')}>÷</Button>
          
          <Button variant="outline" onClick={() => handleNumberClick('7')}>7</Button>
          <Button variant="outline" onClick={() => handleNumberClick('8')}>8</Button>
          <Button variant="outline" onClick={() => handleNumberClick('9')}>9</Button>
          <Button variant="outline" onClick={() => handleOperatorClick('×')}>×</Button>
          
          <Button variant="outline" onClick={() => handleNumberClick('4')}>4</Button>
          <Button variant="outline" onClick={() => handleNumberClick('5')}>5</Button>
          <Button variant="outline" onClick={() => handleNumberClick('6')}>6</Button>
          <Button variant="outline" onClick={() => handleOperatorClick('-')}>-</Button>
          
          <Button variant="outline" onClick={() => handleNumberClick('1')}>1</Button>
          <Button variant="outline" onClick={() => handleNumberClick('2')}>2</Button>
          <Button variant="outline" onClick={() => handleNumberClick('3')}>3</Button>
          <Button variant="outline" onClick={() => handleOperatorClick('+')}>+</Button>
          
          <Button variant="outline" onClick={() => handleNumberClick('0')} className="col-span-2">0</Button>
          <Button variant="outline" onClick={() => handleNumberClick('.')}>.</Button>
          <Button variant="default" onClick={() => handleEquals()}>=</Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Loan Calculator Component
function LoanCalculator({ currencySymbol }: { currencySymbol: string }) {
  const [loanAmount, setLoanAmount] = useState(100000);
  const [interestRate, setInterestRate] = useState(8);
  const [loanTerm, setLoanTerm] = useState(5);
  
  // Calculate monthly payment using the formula: P = L[c(1 + c)^n]/[(1 + c)^n - 1]
  // where P is the monthly payment, L is the loan amount, c is the monthly interest rate, and n is the number of payments
  const calculateMonthlyPayment = () => {
    const monthlyRate = interestRate / 100 / 12;
    const payments = loanTerm * 12;
    
    if (monthlyRate === 0) return loanAmount / payments;
    
    const x = Math.pow(1 + monthlyRate, payments);
    return (loanAmount * monthlyRate * x) / (x - 1);
  };
  
  const monthlyPayment = calculateMonthlyPayment();
  const totalPayment = monthlyPayment * loanTerm * 12;
  const totalInterest = totalPayment - loanAmount;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <DollarSign className="h-5 w-5 mr-2 text-primary" />
          Loan Calculator
        </CardTitle>
        <CardDescription>Calculate monthly payments for a loan</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Loan Amount ({currencySymbol})</Label>
              <div className="w-32">
                <Input
                  type="number"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(Number(e.target.value))}
                />
              </div>
            </div>
            <Slider
              value={[loanAmount]}
              min={1000}
              max={1000000}
              step={1000}
              onValueChange={(val) => setLoanAmount(val[0])}
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Interest Rate (%)</Label>
              <div className="w-32">
                <Input
                  type="number"
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  step={0.1}
                />
              </div>
            </div>
            <Slider
              value={[interestRate]}
              min={1}
              max={20}
              step={0.1}
              onValueChange={(val) => setInterestRate(val[0])}
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Loan Term (years)</Label>
              <div className="w-32">
                <Input
                  type="number"
                  value={loanTerm}
                  onChange={(e) => setLoanTerm(Number(e.target.value))}
                />
              </div>
            </div>
            <Slider
              value={[loanTerm]}
              min={1}
              max={30}
              step={1}
              onValueChange={(val) => setLoanTerm(val[0])}
            />
          </div>
          
          <div className="bg-muted p-4 rounded-md space-y-3 mt-4">
            <div className="flex justify-between">
              <span className="text-sm">Monthly Payment:</span>
              <span className="font-semibold font-mono">{currencySymbol}{monthlyPayment.toFixed(0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Total Payment:</span>
              <span className="font-semibold font-mono">{currencySymbol}{totalPayment.toFixed(0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Total Interest:</span>
              <span className="font-semibold font-mono">{currencySymbol}{totalInterest.toFixed(0)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Savings Calculator Component
function SavingsCalculator({ currencySymbol }: { currencySymbol: string }) {
  const [initialDeposit, setInitialDeposit] = useState(10000);
  const [monthlyContribution, setMonthlyContribution] = useState(1000);
  const [annualRate, setAnnualRate] = useState(7);
  const [years, setYears] = useState(10);
  const [compoundFrequency, setCompoundFrequency] = useState(12); // monthly
  
  // Calculate future value using compound interest formula with regular contributions
  const calculateFutureValue = () => {
    const r = annualRate / 100; // annual rate in decimal
    const n = compoundFrequency; // compounding frequency
    const t = years; // time in years
    const P = initialDeposit; // principal (initial investment)
    const PMT = monthlyContribution; // periodic payment
    
    // Future value of initial principal
    const principalFV = P * Math.pow(1 + r/n, n*t);
    
    // Future value of periodic payments
    // Using formula: PMT * (((1 + r/n)^(n*t) - 1) / (r/n))
    const paymentFV = PMT * ((Math.pow(1 + r/n, n*t) - 1) / (r/n));
    
    return principalFV + paymentFV;
  };
  
  const futureValue = calculateFutureValue();
  const totalContributions = initialDeposit + (monthlyContribution * 12 * years);
  const interestEarned = futureValue - totalContributions;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <PiggyBank className="h-5 w-5 mr-2 text-primary" />
          Savings Calculator
        </CardTitle>
        <CardDescription>Calculate how your savings will grow over time</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Initial Deposit ({currencySymbol})</Label>
              <div className="w-32">
                <Input
                  type="number"
                  value={initialDeposit}
                  onChange={(e) => setInitialDeposit(Number(e.target.value))}
                />
              </div>
            </div>
            <Slider
              value={[initialDeposit]}
              min={0}
              max={100000}
              step={1000}
              onValueChange={(val) => setInitialDeposit(val[0])}
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Monthly Contribution ({currencySymbol})</Label>
              <div className="w-32">
                <Input
                  type="number"
                  value={monthlyContribution}
                  onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                />
              </div>
            </div>
            <Slider
              value={[monthlyContribution]}
              min={0}
              max={10000}
              step={100}
              onValueChange={(val) => setMonthlyContribution(val[0])}
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Annual Interest Rate (%)</Label>
              <div className="w-32">
                <Input
                  type="number"
                  value={annualRate}
                  onChange={(e) => setAnnualRate(Number(e.target.value))}
                  step={0.1}
                />
              </div>
            </div>
            <Slider
              value={[annualRate]}
              min={0.1}
              max={15}
              step={0.1}
              onValueChange={(val) => setAnnualRate(val[0])}
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Time Period (years)</Label>
              <div className="w-32">
                <Input
                  type="number"
                  value={years}
                  onChange={(e) => setYears(Number(e.target.value))}
                />
              </div>
            </div>
            <Slider
              value={[years]}
              min={1}
              max={40}
              step={1}
              onValueChange={(val) => setYears(val[0])}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="compound-monthly"
              checked={compoundFrequency === 12}
              onCheckedChange={(checked) => setCompoundFrequency(checked ? 12 : 1)}
            />
            <Label htmlFor="compound-monthly">Compound Monthly</Label>
          </div>
          
          <div className="bg-muted p-4 rounded-md space-y-3 mt-4">
            <div className="flex justify-between">
              <span className="text-sm">Future Value:</span>
              <span className="font-semibold font-mono">{currencySymbol}{futureValue.toFixed(0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Total Contributions:</span>
              <span className="font-semibold font-mono">{currencySymbol}{totalContributions}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Interest Earned:</span>
              <span className="font-semibold font-mono">{currencySymbol}{interestEarned.toFixed(0)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Currency Converter Component
function CurrencyConverter({ currencySymbol }: { currencySymbol: string }) {
  const [amount, setAmount] = useState(1000);
  const [fromCurrency, setFromCurrency] = useState('INR');
  const [toCurrency, setToCurrency] = useState('USD');
  
  // Exchange rates (simplified for demo)
  const exchangeRates: Record<string, Record<string, number>> = {
    'INR': {
      'USD': 0.012,
      'EUR': 0.011,
      'GBP': 0.0094,
      'JPY': 1.78,
      'INR': 1
    },
    'USD': {
      'INR': 83.5,
      'EUR': 0.92,
      'GBP': 0.78,
      'JPY': 148.9,
      'USD': 1
    },
    'EUR': {
      'INR': 91.1,
      'USD': 1.09,
      'GBP': 0.85,
      'JPY': 162.3,
      'EUR': 1
    },
    'GBP': {
      'INR': 106.6,
      'USD': 1.28,
      'EUR': 1.17,
      'JPY': 190.2,
      'GBP': 1
    },
    'JPY': {
      'INR': 0.56,
      'USD': 0.0067,
      'EUR': 0.0062,
      'GBP': 0.0053,
      'JPY': 1
    }
  };
  
  // Get currency symbols
  const getCurrencySymbolForCode = (code: string) => {
    switch (code) {
      case 'USD': return '$';
      case 'EUR': return '€';
      case 'GBP': return '£';
      case 'INR': return '₹';
      case 'JPY': return '¥';
      default: return code;
    }
  };
  
  // Calculate converted amount
  const getConvertedAmount = () => {
    const rate = exchangeRates[fromCurrency][toCurrency];
    return amount * rate;
  };
  
  const convertedAmount = getConvertedAmount();
  const exchangeRate = exchangeRates[fromCurrency][toCurrency];
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <ArrowLeftRight className="h-5 w-5 mr-2 text-primary" />
          Currency Converter
        </CardTitle>
        <CardDescription>Convert between different currencies</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                {getCurrencySymbolForCode(fromCurrency)}
              </span>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="pl-8"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>From</Label>
              <select 
                className="w-full rounded-md border border-input p-2"
                value={fromCurrency}
                onChange={(e) => setFromCurrency(e.target.value)}
              >
                <option value="INR">Indian Rupee (₹)</option>
                <option value="USD">US Dollar ($)</option>
                <option value="EUR">Euro (€)</option>
                <option value="GBP">British Pound (£)</option>
                <option value="JPY">Japanese Yen (¥)</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <Label>To</Label>
              <select 
                className="w-full rounded-md border border-input p-2"
                value={toCurrency}
                onChange={(e) => setToCurrency(e.target.value)}
              >
                <option value="USD">US Dollar ($)</option>
                <option value="INR">Indian Rupee (₹)</option>
                <option value="EUR">Euro (€)</option>
                <option value="GBP">British Pound (£)</option>
                <option value="JPY">Japanese Yen (¥)</option>
              </select>
            </div>
          </div>
          
          <div className="bg-muted p-4 rounded-md space-y-3 mt-4">
            <div className="flex justify-between">
              <span className="text-sm">{amount} {fromCurrency} =</span>
              <span className="font-semibold font-mono">
                {getCurrencySymbolForCode(toCurrency)}{convertedAmount.toFixed(2)} {toCurrency}
              </span>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>Exchange Rate:</span>
              <span>1 {fromCurrency} = {exchangeRate} {toCurrency}</span>
            </div>
          </div>
          
          <div className="text-center text-xs text-gray-500 mt-4">
            <p>Exchange rates are for demonstration purposes only.</p>
            <p>Last updated: April 2, 2025</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}