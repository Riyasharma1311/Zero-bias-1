import type {
  Patient,
  ClinicalData,
  Comorbidity,
  Medication,
  Admission,
  DashboardStats,
  RiskDistribution,
  ReadmissionTrend,
} from "@/types"

// Mock database for demonstration purposes
// In a real app, you would use a real database like Prisma with PostgreSQL

class Database {
  private patients: Patient[] = []
  private clinicalData: ClinicalData[] = []
  private comorbidities: Comorbidity[] = []
  private medications: Medication[] = []
  private admissions: Admission[] = []

  constructor() {
    this.seedData()
  }

  private seedData() {
    // Create some sample patients
    for (let i = 1; i <= 85; i++) {
      const patientId = `P-${7000 + i}`

      // Create patient
      this.patients.push({
        id: `pat_${i}`,
        patientId,
        name: `John Smith`,
        age: 65 + Math.floor(Math.random() * 15),
        gender: Math.random() > 0.5 ? "Male" : "Female",
        weight: 70 + Math.floor(Math.random() * 30),
        height: 160 + Math.floor(Math.random() * 30),
        createdAt: new Date(2023, 0, 1),
        updatedAt: new Date(),
      })

      // Create clinical data
      const riskScore = Math.floor(Math.random() * 100)
      this.clinicalData.push({
        id: `clin_${i}`,
        patientId,
        creatinine: 0.8 + Math.random() * 1.5,
        bnp: 100 + Math.floor(Math.random() * 900),
        ejectionFraction: 25 + Math.floor(Math.random() * 40),
        sodium: 135 + Math.floor(Math.random() * 10),
        bloodPressureSystolic: 120 + Math.floor(Math.random() * 40),
        bloodPressureDiastolic: 70 + Math.floor(Math.random() * 30),
        lastAdmissionDate: new Date(2023, 4, 10),
        primaryDiagnosis: "Heart Failure",
        riskScore,
        recordedAt: new Date(2023, 4, 10),
      })

      // Create comorbidities
      this.comorbidities.push({
        id: `com_${i}`,
        patientId,
        diabetes: Math.random() > 0.7,
        hypertension: Math.random() > 0.6,
        chronicKidneyDisease: Math.random() > 0.8,
        copd: Math.random() > 0.8,
        coronaryArteryDisease: Math.random() > 0.7,
        atrialFibrillation: Math.random() > 0.8,
        priorHeartFailure: Math.random() > 0.7,
      })

      // Create medications
      this.medications.push({
        id: `med_${i}`,
        patientId,
        aceInhibitors: Math.random() > 0.5,
        arbs: Math.random() > 0.6,
        betaBlockers: Math.random() > 0.4,
        diuretics: Math.random() > 0.3,
        mras: Math.random() > 0.7,
        sglt2Inhibitors: Math.random() > 0.6,
      })

      // Create admissions (1-3 per patient)
      const admissionCount = 1 + Math.floor(Math.random() * 3)
      for (let j = 0; j < admissionCount; j++) {
        this.admissions.push({
          id: `adm_${i}_${j}`,
          patientId,
          date: new Date(2023, 0, 15),
          reason: "Acute Decompensated Heart Failure",
          lengthOfStay: 3 + Math.floor(Math.random() * 7),
          facility: "Memorial Hospital",
        })
      }
    }
  }

  // Patient methods
  async getPatients(): Promise<Patient[]> {
    return this.patients
  }

  async getPatientById(patientId: string): Promise<Patient | null> {
    return this.patients.find((p) => p.patientId === patientId) || null
  }

  async createPatient(patient: Omit<Patient, "id" | "createdAt" | "updatedAt">): Promise<Patient> {
    const newPatient: Patient = {
      ...patient,
      id: `pat_${this.patients.length + 1}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    this.patients.push(newPatient)
    return newPatient
  }

  // Clinical data methods
  async getClinicalDataByPatientId(patientId: string): Promise<ClinicalData | null> {
    return this.clinicalData.find((c) => c.patientId === patientId) || null
  }

  // Comorbidity methods
  async getComorbiditiesByPatientId(patientId: string): Promise<Comorbidity | null> {
    return this.comorbidities.find((c) => c.patientId === patientId) || null
  }

  // Medication methods
  async getMedicationsByPatientId(patientId: string): Promise<Medication | null> {
    return this.medications.find((m) => m.patientId === patientId) || null
  }

  // Admission methods
  async getAdmissionsByPatientId(patientId: string): Promise<Admission[]> {
    return this.admissions.filter((a) => a.patientId === patientId)
  }

  // Dashboard stats
  async getDashboardStats(): Promise<DashboardStats> {
    const totalPatients = this.patients.length
    const highRiskPatients = this.clinicalData.filter((c) => c.riskScore > 70).length
    const avgReadmissionRisk = Math.round(this.clinicalData.reduce((sum, c) => sum + c.riskScore, 0) / totalPatients)
    const currentlyMonitoring = 32 // Mock value

    return {
      totalPatients,
      highRiskPatients,
      avgReadmissionRisk,
      currentlyMonitoring,
      totalPatientsChange: 12,
      highRiskPatientsChange: 5,
      avgReadmissionRiskChange: 2,
      currentlyMonitoringChange: 0,
    }
  }

  // Risk distribution
  async getRiskDistribution(): Promise<RiskDistribution> {
    const low = this.clinicalData.filter((c) => c.riskScore < 30).length
    const medium = this.clinicalData.filter((c) => c.riskScore >= 30 && c.riskScore <= 70).length
    const high = this.clinicalData.filter((c) => c.riskScore > 70).length

    return { low, medium, high }
  }

  // Readmission trend
  async getReadmissionTrend(): Promise<ReadmissionTrend[]> {
    // Mock data for readmission trend
    return [
      { month: "Jan", count: 26 },
      { month: "Feb", count: 28 },
      { month: "Mar", count: 24 },
      { month: "Apr", count: 15 },
      { month: "May", count: 30 },
      { month: "Jun", count: 24 },
    ]
  }
}

export const db = new Database()
