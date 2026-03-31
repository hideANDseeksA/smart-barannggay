import prisma from "../prisma"

/**
 * Calculate trimester based on pregnancy start date
 */
export const calculateTrimester = (startDate: Date): number => {
  const now = new Date()
  const diffTime = now.getTime() - startDate.getTime()

  const weeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7))

  if (weeks <= 12) return 1
  if (weeks <= 26) return 2
  return 3
}

/**
 * Update all pregnancy records automatically
 */
export const updateTrimesterService = async () => {
  console.log("🚀 Starting trimester update service...")

  const records = await prisma.pregnancy_monitoring.findMany({
    where: {
      status: "ongoing",
    },
  })

  console.log(`📊 Found ${records.length} ongoing pregnancy records`)

  for (const record of records) {
    if (!record.pregnancy_start_date) {
      console.log(`⚠️ Skipping record ${record.id} (no start date)`)
      continue
    }

    const start = new Date(record.pregnancy_start_date)
    const now = new Date()

    const diffWeeks = Math.floor(
      (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 7)
    )

    const trimester = calculateTrimester(start)
    const status = diffWeeks >= 40 ? "delivered" : "ongoing"

    console.log("🔍 Processing Record:")
    console.log(`   ID: ${record.id}`)
    console.log(`   Weeks: ${diffWeeks}`)
    console.log(`   Trimester: ${trimester}`)
    console.log(`   Status: ${status}`)

    await prisma.pregnancy_monitoring.update({
      where: { id: record.id },
      data: {
        current_trimester: trimester,
        status,
      },
    })

    console.log(`✅ Updated record ${record.id}`)
  }

  console.log("🎉 All pregnancy records updated successfully\n")
}