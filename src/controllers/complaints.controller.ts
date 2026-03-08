import { Request, Response } from "express"
import prisma from "../prisma"
import { uploadToSupabase } from "../utils/supabaseUpload.util"
import { generateSignedUrl } from "../utils/supabaseUrl.util"
import { updateSupabaseFile } from "../utils/supabaseUpdate.util"
import { deleteFromSupabase } from "../utils/supabaseDelete.util"
import { decrypt } from "../utils/crypto.util"

export const createComplaints = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { resident_id,complaint_type,description,status } = req.body
    const file = req.file

    if (!file) {
      res.status(400).json({ error: "Image is required" })
      return
    }

    /* Upload once, reuse everywhere */
    const image_paths = await uploadToSupabase({
      bucket: "complaints",
      file,
    })

    const complaints = await prisma.complaints.create({
        data: {
            resident_id,
            complaint_type,
            description,
            status,
            image_paths,
        },
    })

    res.status(201).json(complaints)
  } catch (err) {
    console.error(err)
    res.status(500).json({
      error: err instanceof Error ? err.message : "Unknown error",
    })
  }
}

/* READ ALL */export const getcomplaints = async (
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

    // 🔹 Initialize monthly resolved count
    const monthlyResolvedCount: Record<string, number> = {
      Jan: 0, Feb: 0, Mar: 0, Apr: 0,
      May: 0, Jun: 0, Jul: 0, Aug: 0,
      Sep: 0, Oct: 0, Nov: 0, Dec: 0,
    };

    const result = await Promise.all(
      complaints.map(async (comp) => {
        // 🔹 Count resolved complaints by month (ALL years)
        if (comp.status === "resolved") {
          const month = comp.created_at.toLocaleString("en-US", {
            month: "short",
          });
          monthlyResolvedCount[month]++;
        }

        // 🔹 Decrypt resident names
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

    // 🔹 Final response
    res.json({
      complaints: result,
      monthlyResolvedCount,
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
     const { resident_id,complaint_type,description,status} = req.body
    const file = req.file

    // 1️⃣ Find existing complaints
    const existing = await prisma.complaints.findUnique({
      where: { id },
    })

    if (!existing) {
      res.status(404).json({ error: "complaints not found" })
      return
    }

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
        resident_id,
        complaint_type,
        description,
        status,
        image_paths,
      },
    })

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
