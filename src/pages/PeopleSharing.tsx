import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Baby, 
  UserPlus, 
  Crown,
  Heart,
  AlertCircle
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function PeopleSharing() {
  const { t } = useLanguage();

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">People & Sharing</h1>
            <p className="text-muted-foreground mt-1">
              Manage your family group, kids accounts, and sharing preferences
            </p>
          </div>
          <Button className="gap-2" disabled>
            <UserPlus className="h-4 w-4" />
            Add Family Member
          </Button>
        </div>

        {/* Family Overview - Empty State */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Family Members</p>
                  <p className="text-2xl font-bold">0</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-500/10">
                  <Crown className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Parents/Guardians</p>
                  <p className="text-2xl font-bold">0</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-pink-500/10">
                  <Baby className="h-5 w-5 text-pink-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Kids Accounts</p>
                  <p className="text-2xl font-bold">0</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-green-500/10">
                  <Heart className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Approved Contacts</p>
                  <p className="text-2xl font-bold">0</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="family" className="space-y-6">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="family" className="gap-2">
              <Users className="h-4 w-4" />
              Family Group
            </TabsTrigger>
            <TabsTrigger value="kids" className="gap-2">
              <Baby className="h-4 w-4" />
              Kids & Parental Controls
            </TabsTrigger>
            <TabsTrigger value="contacts" className="gap-2">
              <Heart className="h-4 w-4" />
              Approved Contacts
            </TabsTrigger>
          </TabsList>

          {/* Family Group Tab */}
          <TabsContent value="family" className="space-y-4">
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle>Family Group</CardTitle>
                <CardDescription>Manage your family group members and their permissions</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Empty State */}
                <div className="py-12 text-center">
                  <div className="p-4 rounded-full bg-muted/50 w-fit mx-auto mb-4">
                    <Users className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">No Family Members</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    You haven't added any family members yet. Family sharing features coming soon.
                  </p>
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <AlertCircle className="h-4 w-4" />
                    <span>Family management requires additional setup</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Kids & Parental Controls Tab */}
          <TabsContent value="kids" className="space-y-4">
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle>Kids Accounts</CardTitle>
                <CardDescription>Manage parental controls and screen time limits</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Empty State */}
                <div className="py-12 text-center">
                  <div className="p-4 rounded-full bg-pink-500/10 w-fit mx-auto mb-4">
                    <Baby className="h-12 w-12 text-pink-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">No Kids Accounts</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Create supervised accounts for children with parental controls and content restrictions.
                  </p>
                  <Button disabled className="gap-2">
                    <Baby className="h-4 w-4" />
                    Create Kids Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Approved Contacts Tab */}
          <TabsContent value="contacts" className="space-y-4">
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle>Approved Contacts</CardTitle>
                <CardDescription>Manage trusted contacts who can communicate with your family</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Empty State */}
                <div className="py-12 text-center">
                  <div className="p-4 rounded-full bg-green-500/10 w-fit mx-auto mb-4">
                    <Heart className="h-12 w-12 text-green-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">No Approved Contacts</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Add trusted contacts like grandparents, teachers, or coaches who can communicate with your family.
                  </p>
                  <Button disabled className="gap-2">
                    <UserPlus className="h-4 w-4" />
                    Add Contact
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
