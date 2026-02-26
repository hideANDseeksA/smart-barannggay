import { Request, Response } from "express"
import prisma from "../prisma"
import { getIO } from "../socket"
import { decryptAll } from "../utils/crypto.util"
import { encrypt } from "../utils/crypto.util"


  interface NotificationContent {
  title: string
  message: string
  from: string
  type: "success" | "info" | "warning"
}

/* CREATE */
export const createNotification = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { resident_id, role, message, title, from, type } = req.body
    const content: NotificationContent = { title, message, from, type }

    // 1️⃣ Save to DB with encrypted content
    const notification = await prisma.notification.create({
      data: {
        resident_id,
        content: encrypt(JSON.stringify(content)), // encrypted in DB
        receiver: role,
      },
    })

    // 2️⃣ Build the full payload with DECRYPTED content (same shape as GET)
    const payload = {
      id: notification.id,
      resident_id: notification.resident_id,
      content,               // ✅ plain object, not encrypted string
      mark_read: notification.mark_read,
      timestamp: notification.timestamp,
      receiver: notification.receiver,
    }

    const io = getIO()

    // 3️⃣ Emit the full payload, not just content
    if (resident_id) {
      io.to(`user:${resident_id}`).emit("new-notification", payload) // ✅
    }

    if (role === "staff" || role === "healthworker") {
      io.to(`role:${role}`).emit("new-notification", payload) 
    }

    res.status(201).json(payload) // ✅ return decrypted too
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message })
      console.error("Error creating notification:", err)
    } else {
      res.status(500).json({ error: "Unknown error occurred" })
    }
  }
}
/* READ ALL */
export const getNotifications = async (_req: Request, res: Response): Promise<void> => {
  try {
    const notifications = await prisma.notification.findMany()
    res.json(notifications)
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message })
    } else {
      res.status(500).json({ error: "Unknown error occurred" })
    }
  }
}

/* Get By resident_id */
export const getNotificationsByResidentId = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { resident_id } = req.params
    const notifications = await prisma.notification.findMany({
      where: { resident_id },
    })

    const formattedNotifications = notifications.map(n => {
      let contentObj = null

      if (n.content) {
        try {
          contentObj = JSON.parse(decryptAll(n.content))
        } catch (err) {
          console.error("Failed to parse notification content:", err)
          contentObj = { message: "Invalid content format" }
        }
      }

      return {
        ...n,
        content: contentObj,
      }
    })

    res.json(formattedNotifications)
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message })
    } else {
      res.status(500).json({ error: "Unknown error occurred" })
    }
  }
}



/* UPDATE */
export const updateNotification = async (req: Request, res: Response): Promise<void> => {
  try {
    const notification = await prisma.notification.update({
      where: { id: req.params.id },
      data: req.body,
    })
    res.json(notification)
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message })
    } else {
      res.status(500).json({ error: "Unknown error occurred" })
    }
  }
}

/* DELETE */
export const deleteNotification = async (req: Request, res: Response): Promise<void> => {
  try {
    await prisma.notification.delete({
      where: { id: req.params.id },
    })
    res.json({ message: "notification deleted successfully" })
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message })
    } else {
      res.status(500).json({ error: "Unknown error occurred" })
    }
  }
}
