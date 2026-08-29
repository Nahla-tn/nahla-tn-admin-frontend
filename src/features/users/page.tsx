import UsersTable from "@/features/users/components/UsersTable";
import { getUsers } from "@/features/users/services/users.service";

export default async function UsersPage() {
  const users = await getUsers();

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">
        Users Management
      </h1>

      <UsersTable
  users={users}
  onEdit={(user) => {
    console.log("edit user", user);
  }}
  onToggleStatus={(id) => {
    console.log("toggle status", id);
    // call API / update state
  }}
/>
    </div>
  );
}