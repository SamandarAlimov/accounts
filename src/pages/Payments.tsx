import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CreditCard,
  Plus,
  Receipt,
  Wallet,
  Shield,
  Sparkles,
  Crown,
  AlertCircle,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Payments() {
  const { t } = useLanguage();

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="animate-fade-up">
          <h1 className="text-3xl font-semibold text-foreground mb-2">Payments & Subscriptions</h1>
          <p className="text-muted-foreground">
            Manage your payment methods, view transactions, and control subscriptions.
          </p>
        </div>

        <Tabs defaultValue="methods" className="animate-fade-up delay-100">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="methods">Payment Methods</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          </TabsList>

          {/* Payment Methods Tab */}
          <TabsContent value="methods" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-foreground">Your Cards</h2>
              <Button disabled>
                <Plus className="h-4 w-4" />
                Add New Card
              </Button>
            </div>

            {/* Empty State */}
            <div className="glass-card p-12 text-center">
              <div className="p-4 rounded-full bg-muted/50 w-fit mx-auto mb-4">
                <CreditCard className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">No Payment Methods</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                You haven't added any payment methods yet. Payment integration coming soon.
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <AlertCircle className="h-4 w-4" />
                <span>Stripe integration required for payment processing</span>
              </div>
            </div>

            {/* Security Note */}
            <div className="glass-card p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-green-500/10">
                  <Shield className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Secure Payments</h4>
                  <p className="text-sm text-muted-foreground">
                    All payment information is encrypted and securely stored using PCI-DSS standards.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-foreground">Transaction History</h2>
              <Button variant="outline" disabled>
                <Receipt className="h-4 w-4 mr-2" />
                Download All
              </Button>
            </div>

            {/* Empty State */}
            <div className="glass-card p-12 text-center">
              <div className="p-4 rounded-full bg-muted/50 w-fit mx-auto mb-4">
                <Receipt className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">No Transactions</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Your transaction history will appear here once you start making purchases.
              </p>
            </div>
          </TabsContent>

          {/* Subscriptions Tab */}
          <TabsContent value="subscriptions" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-foreground">Active Subscriptions</h2>
              <Button variant="outline" disabled>
                <Wallet className="h-4 w-4 mr-2" />
                Billing Portal
              </Button>
            </div>

            {/* Empty State */}
            <div className="glass-card p-12 text-center">
              <div className="p-4 rounded-full bg-muted/50 w-fit mx-auto mb-4">
                <Crown className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">No Active Subscriptions</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                You don't have any active subscriptions. Explore our plans to unlock premium features.
              </p>
              <Button disabled>
                <Sparkles className="h-4 w-4 mr-2" />
                View Plans
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
