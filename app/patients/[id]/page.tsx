import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { DashboardHeader } from "@/components/dashboard/header"
import { PatientProfile } from "@/components/patients/patient-profile"

interface PatientDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function PatientDetailPage({ params }: PatientDetailPageProps) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const id = (await params).id


  const patient = await db.getPatientById(id)

  if (!patient) {
    redirect("/dashboard")
  }

  const clinicalData = await db.getClinicalDataByPatientId(id)
  const comorbidities = await db.getComorbiditiesByPatientId(id)
  const medications = await db.getMedicationsByPatientId(id)
  const admissions = await db.getAdmissionsByPatientId(id)

  return (
    <div className="flex flex-col w-full min-h-screen">
      <DashboardHeader />
      <main className="flex min-h-[calc(100vh_-_theme(spacing.16))] bg-pink-50/40 flex-1 flex-col gap-4 p-4 md:gap-8 md:p-10">
        <PatientProfile
          patient={patient}
          clinicalData={clinicalData}
          comorbidities={comorbidities}
          medications={medications}
          admissions={admissions}
        />
      </main>
    </div>
  )
}
