// utils/csvToResidentBulkMapper.ts
import { Prisma } from "@prisma/client"
import { encrypt } from "./crypto.util"

export const csvToResidentBulkMapper = (
  row: any,
  purokMap: Record<string, string>
): Prisma.residentsCreateManyInput => {
  // Normalize keys (trimmed, case-insensitive)
  const normalizedRow: Record<string, string> = {}
  Object.keys(row).forEach((key) => {
    normalizedRow[key.trim()] = row[key]?.toString().trim() || ""
  })

  const purokName = normalizedRow["Purok"] || ""
  const purokId = purokMap[purokName]

  const maybeEncrypt = (value?: string | null) => {
    if (!value) return null
    return encrypt(value)
  }

  // Safe birth date parser
  const parseDate = (value?: string) => {
    if (!value) return null
    const [month, day, year] = value.split("/")
    if (!month || !day || !year) return null
    return new Date(Number(year), Number(month) - 1, Number(day))
  }

  return {
    f_name: maybeEncrypt(normalizedRow["First Name"]) || "Unknown",
    l_name: maybeEncrypt(normalizedRow["Last Name"]) || "Unknown",
    sex:
      normalizedRow["Sex"]?.toLowerCase() === "female"
        ? "Female"
        : "Male",
    m_name: maybeEncrypt(normalizedRow["Middle Name"]) || null,
    s_name: maybeEncrypt(normalizedRow["Suffix"]) || null,
    b_date: parseDate(normalizedRow["Birth Date"]),
    b_place: maybeEncrypt(normalizedRow["Birth Place"]) || null,
    email_address: maybeEncrypt(normalizedRow["Email"]) || null,
    contact_no: maybeEncrypt(normalizedRow["Contact No"]) || null,
    sector: normalizedRow["Sector"] || null,
    remarks: normalizedRow["Remarks"] || null,
    voting_status: normalizedRow["Voting Status"] || null,
    purok_id: purokId ?? null, // ✅ FK only
  }
}
