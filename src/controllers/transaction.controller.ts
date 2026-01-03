import { Request, Response } from "express"
import prisma from "../prisma"
import { generateSignedUrl } from "../utils/supabaseUrl.util"
import path from "path"
import { generateCertificate } from "../utils/certificates/helper.generateCertificate"
import { decrypt } from "../utils/crypto.util"
import {getDayWithSuffix} from "../helper/date.helper"
/* CREATE */
export const createTransaction = async (req: Request, res: Response): Promise<void> => {
  try {
    const transaction = await prisma.transaction.create({
      data: req.body,
    })
    res.status(201).json(transaction)
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message })
    } else {
      res.status(500).json({ error: "Unknown error occurred" })
    }
  }
}

/* READ ALL */
export const getTransactions = async (_req: Request, res: Response): Promise<void> => {
  try {
    const transactions = await prisma.transaction.findMany()
    res.json(transactions)
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message })
    } else {
      res.status(500).json({ error: "Unknown error occurred" })
    }
  }
}

/* READ ONE */
export const getTransactionById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const transaction = await prisma.transaction.findMany({
      where: { resident_id: req.params.resident_id },
      include: {
        certificate: {
          select: {
            template_name: true,
            template_price: true
          },
        },
      },
    })

    if (!transaction) {
      res.status(404).json({ message: "Transaction not found" })
      return
    }

     transaction.forEach(tx => {
      if (tx.certificate) {
        tx.certificate.template_name = decrypt(tx.certificate.template_name);
      }
    });

    res.status(200).json(transaction);

  } catch (err) {
    res.status(500).json({
      error: err instanceof Error ? err.message : "Unknown error occurred",
    })
  }
}

/* UPDATE */
export const updateTransaction = async (req: Request, res: Response): Promise<void> => {
  try {
    const transaction = await prisma.transaction.update({
      where: { id: req.params.id },
      data: req.body,
    })
    res.json(transaction)
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message })
    } else {
      res.status(500).json({ error: "Unknown error occurred" })
    }
  }
}

/* DELETE */
export const deleteTransaction = async (req: Request, res: Response): Promise<void> => {
  try {
    await prisma.transaction.delete({
      where: { id: req.params.id },
    })
    
    res.json({ message: "transaction deleted successfully" })
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message })
    } else {
      res.status(500).json({ error: "Unknown error occurred" })
    }
  }
}

export const generateTransactionCertificate = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params

    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: {
        certificate: {
          select: { template_path: true },
        },
      },
    })

    if (!transaction) {
      res.status(404).json({ error: "Transaction not found" })
      return
    }
`x`
    if (!transaction.details) {
      res.status(400).json({ error: "Certificate data missing" })
      return
    }

    if (!transaction.certificate?.template_path) {
      res.status(400).json({ error: "Template not configured" })
      return
    }

    // 🔓 Decrypt + parse JSON
    let certificateData: Record<string, string>
    try {
      const decrypted = decrypt(transaction.details)
      certificateData = JSON.parse(decrypted)
      const now = new Date()
        const dayth = getDayWithSuffix(now.getDate())
        const month = now.toLocaleString("en-US", { month: "long" })
        const year = now.getFullYear()

    certificateData.issued = `${dayth} day of ${month} ${year}`
    } catch {
      res.status(400).json({ error: "Invalid certificate details format" })
      return
    }

    const templateUrl = await generateSignedUrl(
      transaction.certificate.template_path,
      60 * 5
    )

    if (!templateUrl) {
      res.status(500).json({ error: "Failed to generate template URL" })
      return
    }

    // 🧾 Generate DOCX buffer (NO FILE SYSTEM)
    const buffer = await generateCertificate(templateUrl, certificateData)

    // 📥 Force download
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="certificate-${transaction.id}.docx"`
    )
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    )

    res.send(buffer)

    // ✅ Update status (async)
    prisma.transaction.update({
      where: { id },
      data: { status: "completed" },
    }).catch(console.error)

  } catch (err) {
    res.status(500).json({
      error: err instanceof Error ? err.message : "Certificate generation failed",
    })
  }
}