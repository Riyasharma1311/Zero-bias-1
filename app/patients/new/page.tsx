import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { DashboardHeader } from "@/components/dashboard/header"
import { NewPatientForm } from "@/components/patients/new-patient-form"

export default async function NewPatientPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="flex flex-col w-full min-h-screen">
      <DashboardHeader />
      <main className="flex min-h-[calc(100vh_-_theme(spacing.16))] bg-pink-50/40 flex-1 flex-col gap-4 p-4 md:gap-8 md:p-10">
        <NewPatientForm />
      </main>
    </div>
  )
}
