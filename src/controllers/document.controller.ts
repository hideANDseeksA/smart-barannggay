import { Request, Response } from "express"
import prisma from "../prisma"
import { uploadToSupabase } from "../utils/supabaseUpload.util"
import { generateSignedUrl } from "../utils/supabaseUrl.util"
import { updateSupabaseFile } from "../utils/supabaseUpdate.util"
import { deleteFromSupabase } from "../utils/supabaseDelete.util"
import { decrypt } from "../utils/crypto.util"
/* CREATE */
export const createDocuments = async (
    req: Request, 
    res: Response): Promise<void> => {
  try {
    
    const{  document_type_id,title ,purpose ,issued_date ,status} = req.body
    const file = req.file

    if (!file) {
      res.status(400).json({ error: "Template file is required" })
      return
    }

   const file_url= await uploadToSupabase({
      bucket: "documents",
      file,
    })

    const documents = await prisma.documents.create({
        data: {
            document_type_id,
            title,
            purpose,
            issued_date: issued_date ? new Date(issued_date) : null,
            status,
            file_url
        },
    })
    res.status(201).json(documents)
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message })
    } else {
      res.status(500).json({ error: "Unknown error occurred" })
    }
  }
}

/* READ ALL */
export const getDocuments = async (_req: Request, res: Response): Promise<void> => {
  try {
    const documentss = await prisma.documents.findMany({
         include: {
        document_type: {
          select: { name: true },
        },
      },
            
    })

   

    const result = await Promise.all(
        documentss.map(async doc => ({
            ...doc,
            file_url: doc.file_url ? await generateSignedUrl(doc.file_url, 60 * 5) : null,
            document_type: {
              name: decrypt(doc.document_type.name)
            }
        }))
    )

    res.status(200).json(result)
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message })
    } else {
      res.status(500).json({ error: "Unknown error occurred" })
    }
  }
}


export const getResidentDocuments = async (_req: Request, res: Response): Promise<void> => {
  try {
      const documents = await prisma.documents.findMany({
      where: {
        is_public: true,
      },
      select: {
        id: true,
        document_type: {
          select: {
            name: true,
          },
        },
        file_url: true,
        title: true,
        purpose: true,
        issued_date: true,
      },
    })


   

    const result = await Promise.all(
        documents.map(async doc => ({
            ...doc,
            file_url: doc.file_url ? await generateSignedUrl(doc.file_url, 60 * 5) : null,
            document_type: {
              name: decrypt(doc.document_type.name)
            }
        }))
    )

    res.status(200).json(result)
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message })
    } else {
      res.status(500).json({ error: "Unknown error occurred" })
    }
  }
}


/* UPDATE */
export const updateDocuments = async (req: Request, res: Response): Promise<void> => {
  try {

const file = req.file
const {id } = req.params
const { document_type_id,title ,purpose ,issued_date  ,status} = req.body

const existingDocument = await prisma.documents.findUnique({
  where: { id },
})
if (!existingDocument) {
  res.status(404).json({ message: "Document not found" })
  return
}

let file_url = existingDocument.file_url

if (file) {

  file_url = await updateSupabaseFile({
    bucket: "documents",
    file,
    oldPath: existingDocument.file_url,
  })
}

    const documents = await prisma.documents.update({
      where: { id },
      data: {
        document_type_id,
        title,
        purpose,
        issued_date: issued_date ? new Date(issued_date) : null,
        status,
        file_url
      },
    })
    res.status(200).json(documents)
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message })
    } else {
      res.status(500).json({ error: "Unknown error occurred" })
    }
  }
}

/* DELETE */
export const deleteDocuments = async (req: Request, res: Response): Promise<void> => {
  try {

    const existingDocument = await prisma.documents.findUnique({
      where: { id: req.params.id },
    })

    if (!existingDocument) {
      res.status(404).json({ message: "Document not found" })
      return
    }

    if (existingDocument.file_url){
      await deleteFromSupabase({
      bucket: "documents",
      path: existingDocument.file_url,
    })
    }
 

    await prisma.documents.delete({
      where: { id: req.params.id },
    })
    res.status(200).json({ message: "documents deleted successfully" })
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message })
    } else {
      res.status(500).json({ error: "Unknown error occurred" })
    }
  }
}
