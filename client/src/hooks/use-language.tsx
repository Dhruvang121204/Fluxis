import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { UserSettings } from "@shared/schema";

type LanguageContextType = {
  currentLanguage: string;
  translate: (key: string) => string;
};

// Basic translations for essential UI elements
const translations: Record<string, Record<string, string>> = {
  en: {
    // General
    "appName": "Fluxix",
    "loading": "Loading...",
    "error": "Error",
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "edit": "Edit",
    "add": "Add",

    // Navigation
    "home": "Home",
    "transactions": "Transactions",
    "budget": "Budget",
    "financeGpt": "Finance GPT",
    "reports": "Reports",
    "settings": "Settings",

    // Auth
    "login": "Login",
    "register": "Register",
    "username": "Username",
    "password": "Password",
    "email": "Email",
    "name": "Name",
    "forgotPassword": "Forgot Password",
    "logout": "Logout",
    "loginSuccess": "Logged in successfully",
    "registerSuccess": "Registered successfully",
    "rememberMe": "Remember me",
    "passwordConfirm": "Confirm Password",

    // Transactions
    "addTransaction": "Add Transaction",
    "income": "Income",
    "expense": "Expense",
    "amount": "Amount",
    "category": "Category",
    "date": "Date",
    "description": "Description",
    "recentTransactions": "Recent Transactions",
    "noTransactions": "No transactions found",
    "transactionAdded": "Transaction added successfully",
    "transactionAddedDesc": "Your transaction has been added successfully",
    "failedToAddTransaction": "Failed to add transaction",
    "invalidAmountError": "Invalid amount format",
    "type": "Transaction Type",
    "optional": "Optional",
    "incomeExamples": "Monthly salary, Freelance work...",
    "expenseExamples": "Grocery shopping, Rent payment...",
    "selectCategory": "Select category",
    "noCategories": "No categories available",

    // Budget
    "addBudget": "Add Budget",
    "budgetLimit": "Budget Limit",
    "period": "Period",
    "weekly": "Weekly",
    "monthly": "Monthly",
    "quarterly": "Quarterly",
    "yearly": "Yearly",
    "noBudgets": "No budgets found",
    "budgetAdded": "Budget added successfully",
    "budgetAddedDesc": "Your budget has been added successfully",
    "failedToAddBudget": "Failed to add budget",
    "budgetManagement": "Budget Management",
    "trackSpending": "Track and control your spending",

    // Settings
    "accountSettings": "Account Settings",
    "manageAccount": "Manage your account and preferences",
    "appTheme": "App Theme",
    "light": "Light",
    "dark": "Dark",
    "system": "System",
    "chooseAppearance": "Choose the appearance of the app",
    "currency": "Currency",
    "displayAmounts": "Display amounts in this currency",
    "language": "Language",
    "appLanguage": "App interface language",
    "notifications": "Notifications",
    "receiveAlerts": "Receive alerts for important events",
    "settingsSaved": "Settings saved successfully",

    // FinanceGPT
    "askQuestion": "Ask a financial question",
    "sendQuestion": "Send",
    "typing": "Typing...",
    "askFinanceGpt": "Ask Finance GPT",

    // Reports
    "financialReports": "Financial Reports",
    "spendingByCategory": "Spending by Category",
    "incomeVsExpenses": "Income vs Expenses",
    "monthlyOverview": "Monthly Overview",
    "savingsRate": "Savings Rate",
    "downloadReport": "Download Report",
    "noData": "No data available",
  },
  hi: {
    // General
    "appName": "फ्लक्सिक्स",
    "loading": "लोड हो रहा है...",
    "error": "त्रुटि",
    "save": "सहेजें",
    "cancel": "रद्द करें",
    "delete": "हटाएं",
    "edit": "संपादित करें",
    "add": "जोड़ें",

    // Navigation
    "home": "होम",
    "transactions": "लेनदेन",
    "budget": "बजट",
    "financeGpt": "फाइनेंस जीपीटी",
    "reports": "रिपोर्ट",
    "settings": "सेटिंग्स",

    // Auth
    "login": "लॉगिन",
    "register": "पंजीकरण",
    "username": "उपयोगकर्ता नाम",
    "password": "पासवर्ड",
    "email": "ईमेल",
    "name": "नाम",
    "forgotPassword": "पासवर्ड भूल गए",
    "logout": "लॉगआउट",
    "loginSuccess": "सफलतापूर्वक लॉगिन हुआ",
    "registerSuccess": "सफलतापूर्वक पंजीकृत हुआ",
    "rememberMe": "मुझे याद रखें",
    "passwordConfirm": "पासवर्ड की पुष्टि करें",

    // Transactions
    "addTransaction": "लेनदेन जोड़ें",
    "income": "आय",
    "expense": "व्यय",
    "amount": "राशि",
    "category": "श्रेणी",
    "date": "दिनांक",
    "description": "विवरण",
    "recentTransactions": "हाल के लेनदेन",
    "noTransactions": "कोई लेनदेन नहीं मिला",
    "transactionAdded": "लेनदेन सफलतापूर्वक जोड़ा गया",
    "transactionAddedDesc": "आपका लेनदेन सफलतापूर्वक जोड़ा गया है",
    "failedToAddTransaction": "लेनदेन जोड़ने में विफल",
    "invalidAmountError": "अमान्य राशि प्रारूप",
    "type": "लेनदेन प्रकार",
    "optional": "वैकल्पिक",
    "incomeExamples": "मासिक वेतन, फ्रीलांस कार्य...",
    "expenseExamples": "किराना सामान, किराया भुगतान...",
    "selectCategory": "श्रेणी चुनें",
    "noCategories": "कोई श्रेणी उपलब्ध नहीं",

    // Budget
    "addBudget": "बजट जोड़ें",
    "budgetLimit": "बजट सीमा",
    "period": "अवधि",
    "weekly": "साप्ताहिक",
    "monthly": "मासिक",
    "quarterly": "त्रैमासिक",
    "yearly": "वार्षिक",
    "noBudgets": "कोई बजट नहीं मिला",
    "budgetAdded": "बजट सफलतापूर्वक जोड़ा गया",
    "budgetAddedDesc": "आपका बजट सफलतापूर्वक जोड़ा गया है",
    "failedToAddBudget": "बजट जोड़ने में विफल",
    "budgetManagement": "बजट प्रबंधन",
    "trackSpending": "अपने खर्च को ट्रैक और नियंत्रित करें",

    // Settings
    "accountSettings": "अकाउंट सेटिंग्स",
    "manageAccount": "अपने अकाउंट और प्राथमिकताओं का प्रबंधन करें",
    "appTheme": "ऐप थीम",
    "light": "लाइट",
    "dark": "डार्क",
    "system": "सिस्टम",
    "chooseAppearance": "ऐप का रूप चुनें",
    "currency": "मुद्रा",
    "displayAmounts": "इस मुद्रा में राशि प्रदर्शित करें",
    "language": "भाषा",
    "appLanguage": "ऐप इंटरफेस भाषा",
    "notifications": "सूचनाएं",
    "receiveAlerts": "महत्वपूर्ण घटनाओं के लिए अलर्ट प्राप्त करें",
    "settingsSaved": "सेटिंग्स सफलतापूर्वक सहेजी गईं",

    // FinanceGPT
    "askQuestion": "वित्तीय प्रश्न पूछें",
    "sendQuestion": "भेजें",
    "typing": "टाइपिंग...",
    "askFinanceGpt": "फाइनेंस जीपीटी से पूछें",

    // Reports
    "financialReports": "वित्तीय रिपोर्ट",
    "spendingByCategory": "श्रेणी के अनुसार खर्च",
    "incomeVsExpenses": "आय बनाम व्यय",
    "monthlyOverview": "मासिक अवलोकन",
    "savingsRate": "बचत दर",
    "downloadReport": "रिपोर्ट डाउनलोड करें",
    "noData": "कोई डेटा उपलब्ध नहीं",
  },
  es: {
    // General
    "appName": "Fluxix",
    "loading": "Cargando...",
    "error": "Error",
    "save": "Guardar",
    "cancel": "Cancelar",
    "delete": "Eliminar",
    "edit": "Editar",
    "add": "Añadir",

    // Navigation
    "home": "Inicio",
    "transactions": "Transacciones",
    "budget": "Presupuesto",
    "financeGpt": "Finance GPT",
    "reports": "Informes",
    "settings": "Configuración",

    // Auth
    "login": "Iniciar sesión",
    "register": "Registrarse",
    "username": "Nombre de usuario",
    "password": "Contraseña",
    "email": "Correo electrónico",
    "name": "Nombre",
    "forgotPassword": "Olvidé mi contraseña",
    "logout": "Cerrar sesión",
    "loginSuccess": "Sesión iniciada con éxito",
    "registerSuccess": "Registro exitoso",

    // Add more translations as needed
  },
  // Add other languages as needed
};

export const LanguageContext = createContext<LanguageContextType>({
  currentLanguage: "en",
  translate: (key) => key,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState<string>("en");

  // Get user settings to set the language with refetching on window focus
  const { data: userSettings } = useQuery<UserSettings>({
    queryKey: ["/api/user/settings"],
    refetchOnWindowFocus: true, 
    refetchInterval: 5000, // Reduce interval for more responsive updates
    staleTime: 0, // Always refetch to make sure we get the latest settings
  });

  useEffect(() => {
    if (userSettings?.language) {
      // Log the language change for debugging
      console.log("Language changed to:", userSettings.language);
      
      // Update the language state
      setCurrentLanguage(userSettings.language);
      
      // Also update the document language for screenreaders and other tools
      document.documentElement.lang = userSettings.language;
      
      // Set a data attribute on the body for CSS styling based on language
      document.documentElement.setAttribute('data-language', userSettings.language);
    }
  }, [userSettings]);

  const translate = (key: string) => {
    // Fall back to English if the key doesn't exist in the current language
    return (
      translations[currentLanguage]?.[key] || 
      translations.en[key] || 
      key
    );
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage, translate }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);