import Dexie from "dexie";

export const db = new Dexie("GarudaCheckinDB");

db.version(1).stores({
  participants: "id, email, tribune, gate, isCheckedIn",
});

/**
 * id           : Kode Tiket
 * email        : pencarian by email
 * tribune      : filter per tribun
 * gate         : validasi gate masuk
 * isCheckedIn  : filter status check in
 */
