import prisma from "../prisma";
import { decryptAll } from "../utils/crypto.util"; // adjust path if needed

export const getResidentById = async (resident_id: string) => {
  const resident = await prisma.residents.findUnique({
    where: { id: resident_id }, // ✅ correct for UUID
    select: {
      id: true,
      f_name: true,
      l_name: true,
      m_name: true,
    },
  });

  if (!resident) return null;

  console.log([resident]);
  
  const [decrypted] = decryptAll([resident]);

  console.log(decrypted);
  

  return decrypted;
};

export const formatResidentName = (resident: any) => {
  console.log("Resident Data:", resident);

  const fullName = `${resident.f_name} ${
    resident.m_name ? resident.m_name + " " : ""
  }${resident.l_name}`;

  console.log("Formatted Name:", fullName);

  return fullName;
};





