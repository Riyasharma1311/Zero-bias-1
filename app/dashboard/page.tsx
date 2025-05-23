import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { DashboardHeader } from "@/components/dashboard/header"
import { DashboardStats } from "@/components/dashboard/stats"
import { PatientRiskChart } from "@/components/dashboard/patient-risk-chart"
import { ReadmissionTrendChart } from "@/components/dashboard/readmission-trend-chart"
import { PatientTable } from "@/components/dashboard/patient-table"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="flex flex-col w-full min-h-screen">
      <DashboardHeader />
      <main className="flex min-h-[calc(100vh_-_theme(spacing.16))] bg-pink-50/40 flex-1 flex-col gap-4 p-4 md:gap-8 md:p-10">
        <div className="max-w-6xl w-full mx-auto grid gap-2">
          <h1 className="font-semibold text-3xl">Dashboard</h1>
          <div className="flex items-center text-sm gap-2">
            <span className="font-medium">
              Welcome back, {session.user?.name || "Doctor"}. Here's your patient overview for today.
            </span>
          </div>
        </div>
        <div className="grid gap-6 max-w-6xl w-full mx-auto">
          <DashboardStats />
          <div className="grid gap-6 md:grid-cols-2">
            <PatientRiskChart />
            <ReadmissionTrendChart />
          </div>
          <PatientTable />
        </div>
      </main>
    </div>
  )
}
