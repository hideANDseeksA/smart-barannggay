import { Request, Response } from "express"
import prisma from "../prisma"
import { uploadToSupabase } from "../utils/supabaseUpload.util"
import { generateSignedUrl } from "../utils/supabaseUrl.util"
import { updateSupabaseFile } from "../utils/supabaseUpdate.util"
import { deleteFromSupabase } from "../utils/supabaseDelete.util"
import { decrypt } from "../utils/crypto.util"
import { sendNotification } from "../service/notification.service"
import { getResidentById, formatResidentName } from "@/utils/resident.helper";

export const createComplaints = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { resident_id ,complaint_type, description } = req.body;
    const file = req.file;

    if (!resident_id || !complaint_type || !description) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    if (!file) {
      res.status(400).json({ error: "Image is required" });
      return;
    }

    const resident = await getResidentById(resident_id);

    if (!resident) {
      res.status(404).json({ error: "Resident not found" });
      return;
    }

    const name = formatResidentName(resident);

    const image_paths = await uploadToSupabase({
      bucket: "complaints",
      file,
    });

    const complaint = await prisma.complaints.create({
      data: {
        resident_id,
        complaint_type,
        description,
        status: "Pending",
        image_paths,
      },
    });

await sendNotification(resident_id, "staff", {
  title: "New Complaint Submitted",
  message: `A new complaint has been submitted by ${name}. 

Type: ${complaint_type}
Details: ${decrypt(description)}

Please review and take the necessary action.`,
  from: name,
  type: "info",
});

    res.status(201).json(complaint);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: err instanceof Error ? err.message : "Unknown error",
    });
  }
};

/* READ ALL */

export const getcomplaints = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const complaints = await prisma.complaints.findMany({
      include: {
        resident: {
          select: {
            resident_id: true,
            f_name: true,
            m_name: true,
            l_name: true,
            purok: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });


    // Monthly resolved count
    const monthlyResolvedCount: Record<string, number> = {
      Jan: 0, Feb: 0, Mar: 0, Apr: 0,
      May: 0, Jun: 0, Jul: 0, Aug: 0,
      Sep: 0, Oct: 0, Nov: 0, Dec: 0,
    };

    // 🔹 Status counts
    const statusCounts = {
      pending: 0,
      on_process: 0,
      resolved: 0,
      declined: 0,
    };

    const result = await Promise.all(
      complaints.map(async (comp) => {

        // Count status
        if (comp.status === "pending") statusCounts.pending++;
        if (comp.status === "on process") statusCounts.on_process++;
        if (comp.status === "resolved") statusCounts.resolved++;
        if (comp.status === "declined") statusCounts.declined++;

        // Count resolved per month
        if (comp.status === "resolved") {
          const month = comp.created_at.toLocaleString("en-US", {
            month: "short",
          });
          monthlyResolvedCount[month]++;
        }

        // Decrypt resident names
        if (comp.resident) {
          comp.resident.f_name =
            comp.resident.f_name && decrypt(comp.resident.f_name);
          comp.resident.m_name =
            comp.resident.m_name && decrypt(comp.resident.m_name);
          comp.resident.l_name =
            comp.resident.l_name && decrypt(comp.resident.l_name);
        }

        comp.complaint_type =
          comp.complaint_type && decrypt(comp.complaint_type);
        comp.description =
          comp.description && decrypt(comp.description);

        return {
          ...comp,
          image_url: comp.image_paths
            ? await generateSignedUrl(comp.image_paths, 60 * 5)
            : null,
        };
      })
    );

    res.json({
      complaints: result,
      monthlyResolvedCount,
      statusCounts,
      totalComplaints: complaints.length,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: err instanceof Error ? err.message : "Unknown error occurred",
    });
  }
};



/* UPDATE */
export const updatecomplaints = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params
     const { handler,status} = req.body
    const file = req.file

    // 1️⃣ Find existing complaints
    const existing = await prisma.complaints.findUnique({
      where: { id },
    })

    if (!existing) {
      res.status(404).json({ error: "complaints not found" })
      return
    }
    const handler_name = await getResidentById(handler);

    if (!handler_name) {
      res.status(404).json({ error: "Resident not found" });
      return;
    } 

    const name = formatResidentName(handler_name);

    let image_paths = existing.image_paths

    // 2️⃣ If new file uploaded, replace old file
    if (file) {
      image_paths = await updateSupabaseFile({
        bucket: "complaints",
        file,
        oldPath: existing.image_paths,
      })
    }

    // 3️⃣ Update complaints in DB
    const updated = await prisma.complaints.update({
      where: { id },
      data: {
        status,
        image_paths,
      },
    })

let message = "";

if (status === "on review") {
  message = `Your complaint has been officially received and is currently under review by the Barangay Office.

This matter is being handled by ${name}. We will notify you once the evaluation process has been completed.

Thank you for your patience and cooperation.`;
}

else if (status === "on action") {
  message = `Your complaint has been reviewed and is now undergoing appropriate action.

This case is currently being handled by ${name}, who is taking the necessary steps to address your concern.

We appreciate your understanding as we work towards a resolution.`;
}

else if (status === "resolved") {
  message = `We are pleased to inform you that your complaint has been successfully resolved by the Barangay Office.

This matter was handled by ${name}. If you have any further concerns or require additional assistance, please feel free to contact the barangay office.

Thank you.`;
}

else if (status === "declined") {
  message = `After careful review, your complaint has been declined by the Barangay Office.

This decision was made by ${name}. For further clarification or assistance, you may coordinate directly with the barangay office.

Thank you for your understanding.`;
}

else {
  message = `Your complaint status has been updated to "${status}".

This update is being managed by ${name}. Please contact the barangay office if you require further information.`;
}

await sendNotification(updated.resident_id, "resident", {
  title: `Your complaint is ${status}`,
  message: message,
  from: name,
  type: "info",
});


    res.json(updated)
  } catch (err) {
    console.error(err)
    res.status(500).json({
      error: err instanceof Error ? err.message : "Unknown error occurred",
    })
  }
}

/* DELETE */
export const deletecomplaints = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // 1️⃣ Find the complaints to get image_paths
    const existing = await prisma.complaints.findUnique({
      where: { id: req.params.id },
    })

    if (!existing) {
      res.status(404).json({ error: "complaints not found" })
      return
    }

    // 2️⃣ Delete file from Supabase if exists
    if (existing.image_paths) {
      await deleteFromSupabase({
        bucket: "complaints",
        path: existing.image_paths,
      })
    }

    // 3️⃣ Delete record from DB
    await prisma.complaints.delete({
      where: { id: req.params.id },
    })

    res.json({ message: "complaints deleted successfully" })
  } catch (err) {
    console.error(err)
    res.status(500).json({
      error: err instanceof Error ? err.message : "Unknown error occurred",
    })
  }
}
