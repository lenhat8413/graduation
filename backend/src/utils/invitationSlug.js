import crypto from "crypto";

export function createInvitationSlugCandidate() {
  return crypto.randomBytes(6).toString("hex");
}

export async function generateUniqueInvitationSlug(pool) {
  let slug = createInvitationSlugCandidate();

  while (true) {
    const [rows] = await pool.query(
      "SELECT id FROM invitations WHERE public_slug = ? LIMIT 1",
      [slug]
    );

    if (!rows.length) {
      return slug;
    }

    slug = createInvitationSlugCandidate();
  }
}
