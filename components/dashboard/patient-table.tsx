"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { db } from "@/lib/db"
import type { Patient } from "@/types"

type PatientWithRisk = Patient & { riskScore: number; lastAdmission: Date }

export function PatientTable() {
  const [patients, setPatients] = useState<PatientWithRisk[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const patientData = await db.getPatients()

        // Combine patient data with risk scores
        const patientsWithRisk = await Promise.all(
          patientData.map(async (patient) => {
            const clinicalData = await db.getClinicalDataByPatientId(patient.patientId)
            return {
              ...patient,
              riskScore: clinicalData?.riskScore || 0,
              lastAdmission: clinicalData?.lastAdmissionDate || new Date(),
            }
          }),
        )

        setPatients(patientsWithRisk)
      } catch (error) {
        console.error("Error fetching patients:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPatients()
  }, [])

  const filteredPatients = patients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.patientId.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    }).format(new Date(date))
  }

  const getRiskColor = (score: number) => {
    if (score < 30) return "text-green-500"
    if (score < 70) return "text-yellow-500"
    return "text-red-500"
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Patient List</h2>
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Search Patients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64"
          />
          <div>Sort By ↓</div>
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Age</TableHead>
              <TableHead>Risk Score</TableHead>
              <TableHead>Last Admission</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array(5)
                .fill(0)
                .map((_, index) => (
                  <TableRow key={index}>
                    <TableCell colSpan={6}>
                      <div className="h-10 bg-gray-100 animate-pulse rounded" />
                    </TableCell>
                  </TableRow>
                ))
            ) : filteredPatients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  No patients found
                </TableCell>
              </TableRow>
            ) : (
              filteredPatients.slice(0, 10).map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell>{patient.patientId}</TableCell>
                  <TableCell>{patient.name}</TableCell>
                  <TableCell>{patient.age}</TableCell>
                  <TableCell>
                    <span className={getRiskColor(patient.riskScore)}>{patient.riskScore}%</span>
                  </TableCell>
                  <TableCell>{formatDate(patient.lastAdmission)}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-pink-600 border-pink-200 hover:bg-pink-50"
                      asChild
                    >
                      <Link href={`/patients/${patient.patientId}`}>View Details</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
