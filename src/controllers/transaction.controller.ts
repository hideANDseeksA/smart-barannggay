import { Request, Response } from "express"
import prisma from "../prisma"
import { generateSignedUrl } from "../utils/supabaseUrl.util"
import path from "path"
import { generateCertificate } from "../utils/certificates/helper.generateCertificate"
import { safeDecrypt, } from "../utils/crypto.util"
import { getDayWithSuffix } from "../helper/date.helper"
import { sendNotification } from "../service/notification.service"
import { getResidentById,formatResidentName } from "@/utils/resident.helper"
/* CREATE */

export const createTransaction = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, template, ...transactionData } = req.body;

    const transaction = await prisma.transaction.create({
      data: transactionData,
    });

    const submittedOn = new Date().toLocaleString("en-PH", {
      timeZone: "Asia/Manila",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const message =
      `This is to formally notify you that a new certificate request has been submitted by a resident and is now awaiting your review.\n\n` +
      `Transaction Details:\n` +
      `• Transaction ID   : ${transaction.id}\n` +
      `• Certificate      : ${template}\n` +
      `• Requested By     : ${name}\n` +
      `• Status           : Pending\n` +
      `• Date Submitted   : ${submittedOn}\n\n` +
      `Please review the request at your earliest convenience to ensure the resident receives timely assistance.`;

    await sendNotification(transaction.resident_id, "staff", {
      title: "New Certificate Request Submitted",
      message,
      from: name,
      type: "info",
    });

    res.status(201).json("Request Sent!");
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(500).json({ error: "Unknown error occurred" });
    }
  }
};
/* READ ALL */
export const getOnlineRequest = async (_req: Request, res: Response): Promise<void> => {
  try {
    const transactions = await prisma.transaction.findMany({
      where: {
        certificate: {
          is: {
            requestType: true,
          },
        },
        status: { in: ["pending", "on process", "ready to claim"] }
      },
      include: {
        certificate: {
          select: {
            template_name: true,
            template_price: true,
          },
        },
        resident: {
          select: {
            f_name: true,
            m_name: true,
            l_name: true,
            email_address: true,
            resident_id: true,
            purok: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    })


    transactions.forEach(tx => {
      if (tx.certificate) {
        tx.certificate.template_name = safeDecrypt(tx.certificate.template_name);
      }

      if (tx.resident) {
        tx.resident.f_name = tx.resident.f_name && safeDecrypt(tx.resident.f_name);
        tx.resident.m_name = tx.resident.m_name && safeDecrypt(tx.resident.m_name);
        tx.resident.l_name = tx.resident.l_name && safeDecrypt(tx.resident.l_name);
        tx.resident.email_address = tx.resident.email_address && safeDecrypt(tx.resident.email_address);

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



/* READ ALL */
export const getAppointment = async (_req: Request, res: Response): Promise<void> => {
  try {
    const transactions = await prisma.transaction.findMany({
      where: {
        certificate: {
          is: {
            requestType: false,
          },
        },
        status: { in: ["pending", "approved"] }
      },
      include: {
        certificate: {
          select: {
            template_name: true,
            template_price: true,
          },
        },
        resident: {
          select: {
            f_name: true,
            m_name: true,
            l_name: true,
            email_address: true,
            resident_id: true,
            purok: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    })


    transactions.forEach(tx => {
      if (tx.certificate) {
        tx.certificate.template_name = safeDecrypt(tx.certificate.template_name);
      }

      if (tx.resident) {
        tx.resident.f_name = tx.resident.f_name && safeDecrypt(tx.resident.f_name);
        tx.resident.m_name = tx.resident.m_name && safeDecrypt(tx.resident.m_name);
        tx.resident.l_name = tx.resident.l_name && safeDecrypt(tx.resident.l_name);
        tx.resident.email_address = tx.resident.email_address && safeDecrypt(tx.resident.email_address);

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





export const getHistory = async (_req: Request, res: Response): Promise<void> => {
  try {
    const transactions = await prisma.transaction.findMany({
      where: {
        status: { in: ["completed", "declined", "cancelled", "expired"] }
      },
      include: {
        certificate: {
          select: {
            template_name: true,
            template_price: true,
          },
        },
        resident: {
          select: {
            f_name: true,
            m_name: true,
            l_name: true,
            email_address: true,
            resident_id: true,
            purok: {
              select: {
                name: true,
              },
            },
          },
        },
        handled_by: {
          select: {
            f_name: true,
            m_name: true,
            l_name: true,
          },
        },
      },
    })
    transactions.forEach(tx => {
      if (tx.certificate) {
        tx.certificate.template_name = safeDecrypt(tx.certificate.template_name);
      }

      if (tx.resident) {
        tx.resident.f_name = tx.resident.f_name && safeDecrypt(tx.resident.f_name);
        tx.resident.m_name = tx.resident.m_name && safeDecrypt(tx.resident.m_name);
        tx.resident.l_name = tx.resident.l_name && safeDecrypt(tx.resident.l_name);
        tx.resident.email_address = tx.resident.email_address && safeDecrypt(tx.resident.email_address);
      }

      if (tx.handled_by) {
        tx.handled_by.f_name = tx.handled_by.f_name && safeDecrypt(tx.handled_by.f_name);
        tx.handled_by.m_name = tx.handled_by.m_name && safeDecrypt(tx.handled_by.m_name);
        tx.handled_by.l_name = tx.handled_by.l_name && safeDecrypt(tx.handled_by.l_name);
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
      resident.f_name = resident.f_name && safeDecrypt(resident.f_name);
      resident.m_name = resident.m_name && safeDecrypt(resident.m_name);
      resident.l_name = resident.l_name && safeDecrypt(resident.l_name);
      resident.s_name = resident.s_name && safeDecrypt(resident.s_name);
      resident.civil_status = resident.civil_status && safeDecrypt(resident.civil_status);

      resident.b_place = resident.b_place && safeDecrypt(resident.b_place);
      resident.contact_no = resident.contact_no && safeDecrypt(resident.contact_no);
      resident.house_no = resident.house_no && safeDecrypt(resident.house_no);
      resident.email_address = resident.email_address && safeDecrypt(resident.email_address);
    }


    data.latest_documents?.forEach((doc: any) => {

      // 🔐 safeDecrypt title
      if (doc.title) {
        const safeDecrypted = safeDecrypt(doc.title);
        try {
          doc.title = JSON.parse(safeDecrypted);
        } catch {
          doc.title = safeDecrypted;
        }
      }

      if (doc.purpose) {
        const safeDecrypted = safeDecrypt(doc.purpose);
        try {
          doc.purpose = JSON.parse(safeDecrypted);
        } catch {
          doc.purpose = safeDecrypted;
        }
      }

      // 🔐 safeDecrypt document type fields
      if (doc.document_type) {

        if (doc.document_type.name) {
          const safeDecrypted = safeDecrypt(doc.document_type.name);
          try {
            doc.document_type.name = JSON.parse(safeDecrypted);
          } catch {
            doc.document_type.name = safeDecrypted;
          }
        }

        if (doc.document_type.description) {
          const safeDecrypted = safeDecrypt(doc.document_type.description);
          try {
            doc.document_type.description = JSON.parse(safeDecrypted);
          } catch {
            doc.document_type.description = safeDecrypted;
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
        const safeDecrypted = safeDecrypt(tx.details);
        try {
          tx.details = JSON.parse(safeDecrypted);
        } catch {
          tx.details = safeDecrypted;
        }
      }


      if (tx.certificate?.template_name) {
        tx.certificate.template_name = safeDecrypt(tx.certificate.template_name);
      }
    });


    res.status(200).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: err instanceof Error ? err.message : "Unknown error occurred",
    });
  }
};




export const getTransactionById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const transactions = await prisma.transaction.findMany({
      where: { resident_id: req.params.resident_id },
      include: {
        certificate: {
          select: {
            template_name: true,
            template_price: true,
          },
        },
      },
    });

    if (transactions.length === 0) {
      res.status(404).json({ message: "Transaction not found" });
      return;
    }

    const decryptedTransactions = transactions.map((tx) => ({
      ...tx,
      certificate: tx.certificate
        ? {
            ...tx.certificate,
            template_name: safeDecrypt(tx.certificate.template_name),
          }
        : null,
    }));

    res.status(200).json(decryptedTransactions);
  } catch (err) {
    res.status(500).json({
      error: err instanceof Error ? err.message : "Unknown error occurred",
    });
  }
};

/* UPDATE */
export const updateTransaction = async (req: Request, res: Response): Promise<void> => {
  try {
    const { appointment_date, status, handled_by_id} = req.body;

    const transaction = await prisma.transaction.update({
      where: { id: req.params.id },
      data: {
        status,
        ...(appointment_date && {
          appointment_date: new Date(appointment_date),
        }),
        ...(handled_by_id && {
          handler: handled_by_id,
        }),
      },
      include: {
        resident: true,        // gets resident name fields
        certificate: true,     // gets template_name
      },
    });

    const resident_name = await getResidentById(transaction.resident_id);
    const name = formatResidentName(resident_name);
    const template = safeDecrypt(transaction.certificate.template_name);


    const handler = await getResidentById(handled_by_id);
    const handler_name = formatResidentName(handler);

    const updatedOn = new Date().toLocaleString("en-PH", {
      timeZone: "Asia/Manila",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    if (status === "approved") {
      const formattedDate = transaction.appointment_date
        ? transaction.appointment_date.toLocaleDateString("en-PH", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : "To Be Determined";

      await sendNotification(transaction.resident_id, "resident", {
        title: "Certificate Request Approved",
        message:
          `This is to formally notify you that your certificate request has been reviewed and approved by the Barangay Office.\n\n` +
          `Transaction Details:\n` +
          `• Transaction ID   : ${transaction.id}\n` +
          `• Certificate      : ${template}\n` +
          `• Requested By     : ${name}\n` +
          `• Handled By       : ${handler_name}\n` +
          `• Status           : Approved\n` +
          `• Appointment Date : ${formattedDate}\n` +
          `• Last Updated     : ${updatedOn}\n\n` +
          `Please be present on your scheduled appointment date and bring any required documents. Contact the Barangay Office if you have any concerns.`,
        from: "Barangay Office",
        type: "success",
      });

    } else if (status === "declined") {

      await sendNotification(transaction.resident_id, "resident", {
        title: "Certificate Request Declined",
        message:
          `This is to formally notify you that your certificate request has been reviewed and declined by the Barangay Office.\n\n` +
          `Transaction Details:\n` +
          `• Transaction ID   : ${transaction.id}\n` +
          `• Certificate      : ${template}\n` +
          `• Requested By     : ${name}\n` +
          `• Handled By       : ${handler_name}\n` +
          `• Status           : Declined\n` +
          `• Last Updated     : ${updatedOn}\n\n` +
          `If you believe this is an error or require further clarification, please visit or contact the Barangay Office directly.`,
        from: "Barangay Office",
        type: "warning",
      });

    } else {

      await sendNotification(transaction.resident_id, "resident", {
        title: "Certificate Request Update",
        message:
          `This is to formally notify you that the status of your certificate request has been updated.\n\n` +
          `Transaction Details:\n` +
          `• Transaction ID   : ${transaction.id}\n` +
          `• Certificate      : ${template}\n` +
          `• Requested By     : ${name}\n` +
          `• Handled By       : ${handler_name}\n` +
          `• Status           : ${status.charAt(0).toUpperCase() + status.slice(1)}\n` +
          `• Last Updated     : ${updatedOn}\n\n` +
          `Please check your account for further details or contact the Barangay Office if you have any concerns.`,
        from: "Barangay Office",
        type: "info",
      });
    }

    res.json(transaction);
  } catch (err) {
    console.error(err);
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(500).json({ error: "Unknown error occurred" });
    }
  }
};


export const cancelTransaction = async (req: Request, res: Response): Promise<void> => {
  try {
    const existingTransaction = await prisma.transaction.findUnique({
      where: { id: req.params.id },
      include: {
        resident: {
          select: {
            f_name: true,
            l_name: true,
          },
        },
        certificate: {
          select: {
            template_price: true,
             template_name : true,
          },
        },
      },
    });

    if (!existingTransaction) {
      res.status(404).json({ error: "Transaction not found" });
      return;
    }

    if (["completed", "declined"].includes(existingTransaction.status)) {
      res.status(400).json({ error: "Cannot cancel this transaction" });
      return;
    }

    const transaction = await prisma.transaction.update({
      where: { id: req.params.id },
      data: { status: "cancelled" },
    });

    const residentName = `${safeDecrypt(existingTransaction.resident.f_name)} ${safeDecrypt(existingTransaction.resident.l_name)}`;
    const certificateName = safeDecrypt(existingTransaction.certificate.template_name);
    const certificatePrice = existingTransaction.certificate.template_price
      ? `₱${existingTransaction.certificate.template_price.toFixed(2)}`
      : "Free";
    const transactionId = existingTransaction.id;
    const requestedOn = existingTransaction.timestamp.toLocaleString("en-PH", {
      timeZone: "Asia/Manila",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    const cancelledOn = new Date().toLocaleString("en-PH", {
      timeZone: "Asia/Manila",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    await sendNotification(transaction.resident_id, "staff", {
      title: "Certificate Request Cancelled",
      message:
        `This is to formally notify you that the following certificate request has been cancelled by the resident.\n\n` +
        `Transaction Details:\n` +
        `• Transaction ID   : ${transactionId}\n` +
        `• Certificate      : ${certificateName}\n` +
        `• Fee              : ${certificatePrice}\n` +
        `• Requested By     : ${residentName}\n` +
        `• Date Requested   : ${requestedOn}\n` +
        `• Status           : Cancelled\n` +
        `• Date Cancelled   : ${cancelledOn}\n\n` +
        `No further action is required for this transaction. ` +
        `Should you have any concerns, please coordinate with the resident directly.`,
      from: residentName,
      type: "warning",
    });

    res.json({
      message: "Transaction cancelled successfully",
      transaction,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: err instanceof Error ? err.message : "Unknown error",
    });
  }
};
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

    // 🔓 safeDecrypt + parse JSON
    let certificateData: Record<string, string>
    try {
      const safeDecrypted = safeDecrypt(transaction.details)
      certificateData = JSON.parse(safeDecrypted)
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


export const createAndGenerateCertificate = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { certificate_id, resident_id, details } = req.body

    if (!certificate_id || !resident_id || !details) {
      res.status(400).json({ error: "certificate_id, resident_id, and details are required" })
      return
    }

    // 1️⃣ Create transaction
    const transaction = await prisma.transaction.create({
      data: {
        certificate_id,
        resident_id,
        details: JSON.stringify(details), // encrypt later if needed
        status: "pending",
      },
      include: {
        certificate: { select: { template_path: true } },
      },
    })

    if (!transaction.certificate?.template_path) {
      res.status(400).json({ error: "Template not configured for this certificate" })
      return
    }

    // 2️⃣ Prepare certificate data
    let certificateData: Record<string, any> = details

    const now = new Date()
    const dayth = getDayWithSuffix(now.getDate())
    const month = now.toLocaleString("en-US", { month: "long" })
    const year = now.getFullYear()

    certificateData.issued = `${dayth} day of ${month} ${year}`

    // 3️⃣ Generate template URL
    const templateUrl = await generateSignedUrl(transaction.certificate.template_path, 60 * 5)

    if (!templateUrl) {
      res.status(500).json({ error: "Failed to generate template URL" })
      return
    }

    // 4️⃣ Generate DOCX buffer
    const buffer = await generateCertificate(templateUrl, certificateData)

    // 5️⃣ Update transaction status to completed
    prisma.transaction.update({
      where: { id: transaction.id },
      data: { status: "completed" },
    }).catch(console.error)

    // 6️⃣ Send buffer for download
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="certificate-${transaction.id}.docx"`
    )
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    )
    res.send(buffer)
  } catch (err) {
    console.error(err)
    res.status(500).json({
      error: err instanceof Error ? err.message : "Failed to create transaction and generate certificate",
    })
  }
}


export const updateAndGenerateCertificate = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params
    const { details, certificate_id, resident_id } = req.body

    if (!id) {
      res.status(400).json({ error: "Transaction id is required" })
      return
    }

    // 1️⃣ Update transaction
    const transaction = await prisma.transaction.update({
      where: { id },
      data: {
        certificate_id,
        resident_id,
        details: details ? JSON.stringify(details) : undefined, // update only if provided
        status: "pending",
      },
      include: {
        certificate: { select: { template_path: true } },
      },
    })

    if (!transaction.certificate?.template_path) {
      res.status(400).json({ error: "Template not configured for this certificate" })
      return
    }

    // 2️⃣ Prepare certificate data
    const certificateData: Record<string, any> = details || {}
    const now = new Date()
    const dayth = getDayWithSuffix(now.getDate())
    const month = now.toLocaleString("en-US", { month: "long" })
    const year = now.getFullYear()
    certificateData.issued = `${dayth} day of ${month} ${year}`

    // 3️⃣ Generate template URL
    const templateUrl = await generateSignedUrl(transaction.certificate.template_path, 60 * 5)
    if (!templateUrl) {
      res.status(500).json({ error: "Failed to generate template URL" })
      return
    }

    // 4️⃣ Generate DOCX buffer
    const buffer = await generateCertificate(templateUrl, certificateData)

    // 5️⃣ Update transaction status to completed
    prisma.transaction.update({
      where: { id: transaction.id },
      data: { status: "completed" },
    }).catch(console.error)

    // 6️⃣ Send buffer for download
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="certificate-${transaction.id}.docx"`
    )
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    )
    res.send(buffer)

  } catch (err) {
    console.error(err)
    res.status(500).json({
      error: err instanceof Error ? err.message : "Failed to update transaction and generate certificate",
    })
  }
}