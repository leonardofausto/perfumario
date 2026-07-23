import { ProfileForm } from "@/components/profile/profile-form";
import { PageHeader } from "@/components/ui/page-header";
import styles from "@/components/ui/workspace.module.css";
import { requireUser } from "@/lib/auth/session";
import { getOwnProfile } from "@/lib/profile/queries";

export default async function ProfilePage() {
  const user = await requireUser();
  const profile = await getOwnProfile(user.id);
  const fallbackName = user.email?.split("@")[0] || "Minha conta";

  return (
    <div className={styles.page}>
      <PageHeader
        description="Atualize como você aparece e mantenha sua estante com a sua identidade."
        eyebrow="Sua conta"
        title="Editar perfil"
      />
      <ProfileForm
        email={user.email ?? ""}
        profile={{
          avatarUrl: profile?.avatarUrl ?? null,
          displayName: profile?.displayName ?? fallbackName,
        }}
      />
    </div>
  );
}
