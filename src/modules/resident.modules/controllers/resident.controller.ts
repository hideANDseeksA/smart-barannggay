import { Request, Response } from "express"
import prisma from "@/prisma"

import { handlePrismaError } from "@/helper/prisma.helper"
import { decryptAll, safeDecrypt } from "@/utils/crypto.util"
import { calculateAge } from "@/helper/agecalculator.helper"
import { Prisma } from "@prisma/client"
import { lowercaseDeep } from "@/helper/lowercase.helper"
import { hashEmail,hashlastName } from "@/utils/hash.util"


/* CREATE */
export const createResident = async (
  req: Request<{}, {}, Prisma.residentsCreateInput>,
  res: Response
): Promise<void> => {
  try {

    // Await hashing for h_email_address
    const h_email_address = req.body.email_address
      ?  hashEmail(safeDecrypt(req.body.email_address.toLowerCase()))
      : null;

    const h_l_name = req.body.l_name      ? hashlastName(safeDecrypt(req.body.l_name.toLowerCase()))
      : null;

    // Prepare data object
    const data = lowercaseDeep({
      ...req.body,
      b_date: req.body.b_date ? new Date(req.body.b_date).toISOString() : null,
      h_email_address,
      h_l_name,
    });



    // Insert into DB
    const resident = await prisma.residents.create({ data });
    res.status(201).json(resident);
  } catch (err) {
    handlePrismaError(err, res);
  }
};



export const getResidents = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.max(Number(req.query.limit) || 50, 1);
    const skip = (page - 1) * limit;

    const search = String(req.query.search || "").trim();
    const purokId = String(req.query.purok_id || "").trim();

    const hashedLastName = search ? hashlastName(search) : null;
    const hashedEmail = search ? hashEmail(search) : null;

    const baseWhere = {
      AND: [
        {
          OR: [
            { remarks: null },
            {
              remarks: {
                not: "archive",
              },
            },
          ],
        },
      ],
    };

    const listWhereCondition: any = {
      AND: [
        ...baseWhere.AND,

        ...(purokId
          ? [
              {
                purok_id: purokId,
              },
            ]
          : []),

        ...(search
          ? [
              {
                OR: [
                  {
                    resident_id: {
                      contains: search,
                      mode: "insensitive",
                    },
                  },
                  {
                    h_l_name: {
                      equals: hashedLastName,
                    },
                  },
                  {
                    h_email_address: {
                      equals: hashedEmail,
                    },
                  },
                ],
              },
            ]
          : []),
      ],
    };

    const summaryWhereCondition: any = {
      AND: [
        ...baseWhere.AND,

        ...(purokId
          ? [
              {
                purok_id: purokId,
              },
            ]
          : []),
      ],
    };

    const [
      residents,
      total,
      employmentCounts,
      votingCounts,
      purokGroups,
    ] = await Promise.all([
      prisma.residents.findMany({
        where: listWhereCondition,
        skip,
        take: limit,
        include: {
          purok: {
            select: { name: true },
          },
        },
        orderBy: {
          times_tamp: "desc",
        },
      }),

      prisma.residents.count({
        where: listWhereCondition,
      }),

      prisma.residents.groupBy({
        by: ["emp_status"],
        where: summaryWhereCondition,
        _count: { emp_status: true },
      }),

      prisma.residents.groupBy({
        by: ["voting_status"],
        where: summaryWhereCondition,
        _count: { voting_status: true },
      }),

      prisma.residents.groupBy({
        by: ["purok_id"],
        where: summaryWhereCondition,
        _count: { purok_id: true },
      }),
    ]);

    const purokIds = purokGroups
      .map((item) => item.purok_id)
      .filter((id): id is string => Boolean(id));

    const puroks = purokIds.length
      ? await prisma.purok.findMany({
          where: {
            id: {
              in: purokIds,
            },
          },
          select: {
            id: true,
            name: true,
          },
        })
      : [];

    const purokMap = new Map(puroks.map((p) => [p.id, p.name]));

    const purokCountSummary = purokGroups.reduce(
      (acc: Record<string, number>, curr) => {
        const purokName = curr.purok_id
          ? purokMap.get(curr.purok_id) || "Unknown"
          : "Unknown";

        acc[purokName] = curr._count.purok_id ?? 0;
        return acc;
      },
      {}
    );

    const decryptedResidents = decryptAll(residents);

    const residentsWithAge = decryptedResidents.map((resident: any) => ({
      ...resident,
      age: calculateAge(resident.b_date),
    }));

    const empStatusSummary = employmentCounts.reduce(
      (acc: Record<string, number>, curr) => {
        const key = curr.emp_status || "unknown";
        acc[key] = curr._count.emp_status;
        return acc;
      },
      {}
    );

    const votingStatusSummary = votingCounts.reduce(
      (acc: Record<string, number>, curr) => {
        const key = curr.voting_status || "unknown";
        acc[key] = curr._count.voting_status;
        return acc;
      },
      {}
    );

    res.json({
      residents: residentsWithAge,
      meta: {
        page,
        limit,
        total,
        search,
        purok_id: purokId || null,
        registeredCount: votingStatusSummary,
        employmentSummary: empStatusSummary,
        purokCounts: purokCountSummary,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    handlePrismaError(err, res);
  }
};

export const getBDACResidents = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1)
    const limit = Math.max(Number(req.query.limit) || 50, 1)

    const skip = (page - 1) * limit

    const [residents, total, registeredCount] = await Promise.all([
      prisma.residents.findMany({
        where: { remarks: "bdac" },
        skip,
        take: limit,
        include: {
          purok: {
            select: { name: true },
          },
        },
      }),

      prisma.residents.count({
        where: { remarks: "bdac" },
      }),

      prisma.residents.count({
        where: {
          remarks: "bdac",
          voting_status: "registered",
        },
      }),
    ])

    const decryptedResidents = decryptAll(residents)

    const residentsWithAge = decryptedResidents.map((resident: any) => ({
      ...resident,
      age: resident.b_date ? calculateAge(resident.b_date) : null,
    }))

    res.json({
      residents: residentsWithAge,
      meta: {
        page,
        limit,
        total,
        registeredCount,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (err) {
    handlePrismaError(err, res)
  }
}


export const getArchiveResidents = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1)
    const limit = Math.max(Number(req.query.limit) || 50, 1)

    const skip = (page - 1) * limit

    const [residents, total] = await Promise.all([
      prisma.residents.findMany({
        where: {
          remarks: "archive",
        },
        skip,
        take: limit,

        include : {
          purok: {
            select: {
              name: true
            }
          },
      }}),
      prisma.residents.count({where: {remarks: "archive"}}),
    ])

    const decryptedResidents = decryptAll(residents)

    const residentsWithAge = decryptedResidents.map((resident: any) => ({
      ...resident,
      age: calculateAge(resident.b_date),
    }))

    res.json({
      residents: residentsWithAge,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (err) {
    handlePrismaError(err, res)
  }
}



export const getResidentsByID = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Resident ID is required" });
    }

    const resident = await prisma.residents.findUnique({
      where: { resident_id: String(id) 
      },
      include:{
        purok:{
          select:{name:true}
        }
      }
    });

    if (!resident) {
      return res.status(404).json({ error: "Resident not found" });
    }

    res.json(resident);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch resident" });
  }
};




/* UPDATE */
export const updateResident = async (req: Request, res: Response): Promise<void> => {
  try {


 
    // Await hashing for h_email_address
    const h_email_address = req.body.email_address
      ?  hashEmail(safeDecrypt(req.body.email_address.toLowerCase()))
      : null;

    const h_l_name = req.body.l_name      ? hashlastName(safeDecrypt(req.body.l_name.toLowerCase()))
      : null;


    
    const data = lowercaseDeep({
      ...req.body,
      b_date: req.body.b_date ? new Date(req.body.b_date).toISOString() : null,
      h_email_address,
      h_l_name,
    });

    const resident = await prisma.residents.update({
      where: { id: req.params.id },
      data: data,
    })
    res.json(resident)
  } catch (err) {
 handlePrismaError(err, res)
  }
}

/* DELETE */
export const deleteResident = async (req: Request, res: Response): Promise<void> => {
  try {
    await prisma.residents.delete({
      where: { id: req.params.id },
    })
    res.json({ message: "Resident deleted successfully" })
  } catch (err) {
   handlePrismaError(err, res)
  }
}
