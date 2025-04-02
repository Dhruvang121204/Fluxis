import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";
import { Redirect } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { insertUserSchema } from "@shared/schema";
import { Loader2 } from "lucide-react";

const loginSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters",
  }),
  rememberMe: z.boolean().optional(),
});

const registerSchema = insertUserSchema.extend({
  passwordConfirm: z.string().min(6, {
    message: "Password must be at least 6 characters",
  }),
}).refine((data) => data.password === data.passwordConfirm, {
  message: "Passwords don't match",
  path: ["passwordConfirm"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const { user, loginMutation, registerMutation } = useAuth();
  const { translate } = useLanguage();
  
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
      rememberMe: false,
    },
  });

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      name: "",
      email: "",
      password: "",
      passwordConfirm: "",
    },
  });

  function onLoginSubmit(values: LoginFormValues) {
    loginMutation.mutate({
      username: values.username,
      password: values.password,
    });
  }

  function onRegisterSubmit(values: RegisterFormValues) {
    const { passwordConfirm, ...registerData } = values;
    registerMutation.mutate(registerData);
  }

  // Redirect if user is already logged in
  if (user) {
    return <Redirect to="/" />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center">
        {/* Left column - Form */}
        <Card className="w-full shadow-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">{translate("appName")}</CardTitle>
            <CardDescription>
              {translate("manageAccount")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "login" | "register")}>
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="login">{translate("login")}</TabsTrigger>
                <TabsTrigger value="register">{translate("register")}</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{translate("username")}</FormLabel>
                          <FormControl>
                            <Input placeholder={translate("username").toLowerCase()} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{translate("password")}</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex items-center justify-between">
                      <FormField
                        control={loginForm.control}
                        name="rememberMe"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel className="text-sm cursor-pointer">{translate("rememberMe") || "Remember me"}</FormLabel>
                          </FormItem>
                        )}
                      />
                      <a href="#" className="text-sm text-primary hover:underline">
                        {translate("forgotPassword")}
                      </a>
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {translate("loading")}
                        </>
                      ) : (
                        translate("login")
                      )}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
              
              <TabsContent value="register">
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                    <FormField
                      control={registerForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{translate("name")}</FormLabel>
                          <FormControl>
                            <Input placeholder={translate("name")} value={field.value || ""} onChange={field.onChange} onBlur={field.onBlur} ref={field.ref} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{translate("email")}</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder={translate("email")} value={field.value || ""} onChange={field.onChange} onBlur={field.onBlur} ref={field.ref} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{translate("username")}</FormLabel>
                          <FormControl>
                            <Input placeholder={translate("username").toLowerCase()} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{translate("password")}</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="passwordConfirm"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{translate("passwordConfirm") || "Confirm Password"}</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {translate("loading")}
                        </>
                      ) : (
                        translate("register")
                      )}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Right column - Hero */}
        <div className="hidden md:flex flex-col space-y-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-800">{translate("appName")}</h1>
            <p className="text-xl text-gray-600">Financial Freedom Made Simple</p>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="bg-primary-100 p-2 rounded-lg">
                <i className="ri-line-chart-line text-xl text-primary-600"></i>
              </div>
              <div>
                <h3 className="font-medium text-gray-800">{translate("trackSpending") || "Track Your Finances"}</h3>
                <p className="text-gray-600">Monitor your income and expenses in one place</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="bg-success-100 p-2 rounded-lg">
                <i className="ri-tools-line text-xl text-success-600"></i>
              </div>
              <div>
                <h3 className="font-medium text-gray-800">{translate("financialTools") || "Financial Calculators"}</h3>
                <p className="text-gray-600">Use powerful tools to plan your financial future</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="bg-warning-100 p-2 rounded-lg">
                <i className="ri-pie-chart-line text-xl text-warning-600"></i>
              </div>
              <div>
                <h3 className="font-medium text-gray-800">{translate("financialReports") || "Visual Insights"}</h3>
                <p className="text-gray-600">Understand your finances with detailed reports</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="bg-primary-100 p-2 rounded-lg">
                <i className="ri-ai-generate text-xl text-primary-600"></i>
              </div>
              <div>
                <h3 className="font-medium text-gray-800">{translate("askFinanceGpt") || "AI-Powered Recommendations"}</h3>
                <p className="text-gray-600">Get smart insights to improve your financial health</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="bg-info-100 p-2 rounded-lg">
                <i className="ri-notification-3-line text-xl text-info-600"></i>
              </div>
              <div>
                <h3 className="font-medium text-gray-800">{translate("notifications") || "Smart Notifications"}</h3>
                <p className="text-gray-600">Stay updated with important financial alerts</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
