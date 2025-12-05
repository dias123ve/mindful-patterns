import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileQuestion, Users, CreditCard, Puzzle, Loader2 } from "lucide-react";

const AdminOverview = () => {
  const [stats, setStats] = useState({
    totalQuestions: 0,
    totalSubmissions: 0,
    purchases: 0,
    components: 10,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [questionsRes, submissionsRes, purchasesRes] = await Promise.all([
        supabase.from("questions").select("id", { count: "exact", head: true }),
        supabase.from("quiz_submissions").select("id", { count: "exact", head: true }),
        supabase
          .from("quiz_submissions")
          .select("id", { count: "exact", head: true })
          .eq("has_purchased", true),
      ]);

      setStats({
        totalQuestions: questionsRes.count || 0,
        totalSubmissions: submissionsRes.count || 0,
        purchases: purchasesRes.count || 0,
        components: 10,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const statCards = [
    {
      title: "Quiz Questions",
      value: stats.totalQuestions,
      icon: FileQuestion,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      title: "Quiz Submissions",
      value: stats.totalSubmissions,
      icon: Users,
      color: "text-accent",
      bg: "bg-accent/10",
    },
    {
      title: "Ebook Purchases",
      value: stats.purchases,
      icon: CreditCard,
      color: "text-success",
      bg: "bg-success/10",
    },
    {
      title: "Components",
      value: stats.components,
      icon: Puzzle,
      color: "text-primary",
      bg: "bg-primary/10",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">
          Dashboard Overview
        </h1>
        <p className="text-muted-foreground mt-1">
          Monitor your MindProfile quiz performance
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="animate-fade-in-up">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-display font-bold text-foreground">
                  {stat.value}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• Add or edit quiz questions in the Quiz Manager</p>
          <p>• Update component descriptions and examples</p>
          <p>• Upload PDF modules for each thinking component</p>
          <p>• Configure email templates for ebook delivery</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminOverview;
