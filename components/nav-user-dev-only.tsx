import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { api } from "@/lib/api-client";
import { UserCircleIcon } from "lucide-react";

export function NavUserDevOnly() {
  const handleOpenOnboarding = async () => {
    await api.api.onboardingControllerResetOnboardingAdmin();

    window.location.href = "/onboarding";
  };

  return (
    <DropdownMenuItem onClick={handleOpenOnboarding}>
      <UserCircleIcon />
      Reset state to onboarding
    </DropdownMenuItem>
  );
}
