import { Request, Response } from "express"
import prisma from "../prisma"
import { generateSignedUrl } from "../utils/supabaseUrl.util"
import path from "path"
import { generateCertificate } from "../utils/certificates/helper.generateCertificate"
import { decrypt, safeDecrypt } from "../utils/crypto.util"
import { getDayWithSuffix } from "../helper/date.helper"

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
    const transactions = await prisma.transaction.findMany({
      include: {
        certificate: {
          select: {
            template_name: true,
            template_price: true
          }
        },
        resident:{
          select:{
            f_name:true,
            m_name:true,
            l_name:true,
            email_address:true,
            resident_id:true,
            purok:{
              select:{
                name:true
              }
            }
            
          }
          
        }
      }
    })

    transactions.forEach(tx => {
      if (tx.certificate) {
        tx.certificate.template_name = decrypt(tx.certificate.template_name);
      }

      if(tx.resident){
        tx.resident.f_name = tx.resident.f_name && decrypt(tx.resident.f_name);
        tx.resident.m_name = tx.resident.m_name && decrypt(tx.resident.m_name);
        tx.resident.l_name = tx.resident.l_name && decrypt(tx.resident.l_name);
        tx.resident.email_address = tx.resident.email_address && decrypt(tx.resident.email_address);

      }
    });

    

    res.status(200).json(transactions);
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message })
    } else {
      res.status(500).json({ error: "Unknown error occurred" })
    }
  }
};

export const getTransactionByIds = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({ error: "resident id is required" });
      return;
    }

    const result: any[] = await prisma.$queryRaw`
      SELECT "smart-barangay".get_resident_summary(${id}::uuid);
    `;

    const data = result[0]?.get_resident_summary;

    if (!data) {
      res.status(404).json({ message: "Data not found" });
      return;
    }


    const resident = data.resident;
    if (resident) {
      resident.f_name = resident.f_name && decrypt(resident.f_name);
      resident.m_name = resident.m_name && decrypt(resident.m_name);
      resident.l_name = resident.l_name && decrypt(resident.l_name);
      resident.b_place = resident.b_place && decrypt(resident.b_place);
      resident.contact_no = resident.contact_no && decrypt(resident.contact_no);
      resident.house_no = resident.house_no && decrypt(resident.house_no);
      resident.email_address = resident.email_address && decrypt(resident.email_address);
    }

   
data.latest_documents?.forEach((doc: any) => {

  // 🔐 Decrypt title
  if (doc.title) {
    const decrypted = decrypt(doc.title);
    try {
      doc.title = JSON.parse(decrypted);
    } catch {
      doc.title = decrypted;
    }
  }
 
  if (doc.purpose) {
    const decrypted = decrypt(doc.purpose);
    try {
      doc.purpose = JSON.parse(decrypted);
    } catch {
      doc.purpose = decrypted;
    }
  }

  // 🔐 Decrypt document type fields
  if (doc.document_type) {

    if (doc.document_type.name) {
      const decrypted = decrypt(doc.document_type.name);
      try {
        doc.document_type.name = JSON.parse(decrypted);
      } catch {
        doc.document_type.name = decrypted;
      }
    }

    if (doc.document_type.description) {
      const decrypted = decrypt(doc.document_type.description);
      try {
        doc.document_type.description = JSON.parse(decrypted);
      } catch {
        doc.document_type.description = decrypted;
      }
    }

  }

});

for (const doc of data.latest_documents || []) {

  if (doc.file_url) {
    doc.file_url = await generateSignedUrl(doc.file_url, 60 * 5);
  }

}

    data.latest_transactions?.forEach((tx: any) => {

      if (tx.details) {
        const decrypted = decrypt(tx.details);
        try {
          tx.details = JSON.parse(decrypted);
        } catch {
          tx.details = decrypted;
        }
      }


      if (tx.certificate?.template_name) {
        tx.certificate.template_name = decrypt(tx.certificate.template_name);
      }
    });


    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({
      error: err instanceof Error ? err.message : "Unknown error occurred",
    });
  }
};




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