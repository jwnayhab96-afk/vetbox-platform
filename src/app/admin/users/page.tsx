"use client";

import React, { useState } from "react";
import { Header } from "@/components/shared/header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { store } from "@/lib/data/store";
import { formatArabicDate } from "@/lib/utils";
import { Users, Search, Shield, User, Stethoscope } from "lucide-react";

export default function AdminUsersPage() {
  const users = store.getUsers();
  const [search, setSearch] = useState("");

  const filtered = users.filter((u) => {
    return (
      u.full_name.toLowerCase().includes(search.toLowerCase()) ||
      (u.phone && u.phone.includes(search)) ||
      u.governorate.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header
        title="إدارة مستخدمي المنصة"
        subtitle="استعراض حسابات المربين، الأطباء، والمشرفين"
        role="admin"
      />

      <div className="p-4 md:p-8 space-y-6 max-w-6xl">
        <div className="max-w-md">
          <Input
            placeholder="ابحث بالاسم، رقم الهاتف، أو المحافظة..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search className="h-4 w-4" />}
          />
        </div>

        <Card className="border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-muted/60 text-muted-foreground font-semibold border-b border-border/60">
                <tr>
                  <th className="p-3.5">المستخدم</th>
                  <th className="p-3.5">الدور</th>
                  <th className="p-3.5">الهاتف</th>
                  <th className="p-3.5">الموقع</th>
                  <th className="p-3.5">تاريخ التسجيل</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filtered.map((user) => (
                  <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3.5 font-bold text-foreground flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                        {user.role === "veterinarian" ? <Stethoscope className="h-4 w-4" /> : user.role === "admin" ? <Shield className="h-4 w-4" /> : <User className="h-4 w-4" />}
                      </div>
                      <span>{user.full_name}</span>
                    </td>
                    <td className="p-3.5">
                      <Badge variant={user.role === "veterinarian" ? "secondary" : user.role === "admin" ? "default" : "outline"}>
                        {user.role === "owner" ? "مربي" : user.role === "veterinarian" ? "طبيب" : "مشرف"}
                      </Badge>
                    </td>
                    <td className="p-3.5 font-mono">{user.phone || "-"}</td>
                    <td className="p-3.5">{user.city ? `${user.city}، ${user.governorate}` : user.governorate}</td>
                    <td className="p-3.5 text-muted-foreground">{formatArabicDate(user.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
